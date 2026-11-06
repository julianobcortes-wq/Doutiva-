#!/usr/bin/env node
/**
 * Provision a Doutiva-owned Supabase project (NOT the Lovable Cloud one).
 *
 * Requires:
 *   SUPABASE_ACCESS_TOKEN  — https://supabase.com/dashboard/account/tokens
 * Optional:
 *   SUPABASE_DB_PASSWORD   — strong password for the new Postgres (generated if absent)
 *   SUPABASE_ORG_ID        — skip org picker when you have several orgs
 *   SUPABASE_REGION        — default sa-east-1 (São Paulo)
 *   SUPABASE_PROJECT_NAME  — default doutiva
 *
 * Writes /workspace/.env (gitignored) with the new project keys and applies
 * drizzle/migrations/*.sql in order via the Management API SQL endpoint when
 * available, otherwise prints the psql command.
 *
 * Usage: node scripts/bootstrap-independent-supabase.mjs
 */
import { createHash, randomBytes } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const API = "https://api.supabase.com/v1";
const ROOT = new URL("..", import.meta.url).pathname;
const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error("Missing SUPABASE_ACCESS_TOKEN. Create one at https://supabase.com/dashboard/account/tokens");
  process.exit(1);
}

const projectName = process.env.SUPABASE_PROJECT_NAME || "doutiva";
const region = process.env.SUPABASE_REGION || "sa-east-1";
const dbPass =
  process.env.SUPABASE_DB_PASSWORD ||
  randomBytes(24).toString("base64url") + "Aa1!";

async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const err = new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 500)}`);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function pickOrg() {
  if (process.env.SUPABASE_ORG_ID) return process.env.SUPABASE_ORG_ID;
  const orgs = await api("/organizations");
  if (!Array.isArray(orgs) || orgs.length === 0) {
    throw new Error("No Supabase organizations on this token. Create one at https://supabase.com/dashboard");
  }
  if (orgs.length > 1) {
    console.log("Organizations:");
    for (const o of orgs) console.log(`  ${o.id}  ${o.name}`);
    throw new Error("Multiple orgs — set SUPABASE_ORG_ID to the one you want.");
  }
  return orgs[0].id;
}

async function findOrCreateProject(orgId) {
  const list = await api(`/projects`);
  const existing = (list || []).find(
    (p) => p.name === projectName || p.name === "Doutiva" || p.name === "doutiva-prod",
  );
  if (existing) {
    console.log(`Reusing project ${existing.id} (${existing.name}) status=${existing.status}`);
    return existing;
  }
  console.log(`Creating project "${projectName}" in ${region}…`);
  const created = await api("/projects", {
    method: "POST",
    body: {
      name: projectName,
      organization_id: orgId,
      region,
      db_pass: dbPass,
      desired_instance_size: "micro",
    },
  });
  console.log(`Created ref=${created.id}`);
  return created;
}

async function waitHealthy(ref) {
  for (let i = 0; i < 60; i++) {
    const p = await api(`/projects/${ref}`);
    console.log(`  status=${p.status}`);
    if (p.status === "ACTIVE_HEALTHY" || p.status === "ACTIVE_UNHEALTHY") return p;
    await sleep(5000);
  }
  throw new Error("Timed out waiting for project to become healthy");
}

async function getKeys(ref) {
  const keys = await api(`/projects/${ref}/api-keys`);
  const anon = keys.find((k) => k.name === "anon" || k.name === "publishable");
  const service = keys.find((k) => k.name === "service_role" || k.name === "secret");
  // Newer API may return sb_publishable_ / sb_secret_
  const publishable =
    anon?.api_key ||
    keys.find((k) => String(k.api_key || "").startsWith("sb_publishable_") || String(k.api_key || "").startsWith("eyJ"))?.api_key;
  const serviceRole =
    service?.api_key ||
    keys.find((k) => String(k.api_key || "").startsWith("sb_secret_") || (k.name || "").includes("service"))?.api_key;
  if (!publishable || !serviceRole) {
    throw new Error(`Could not resolve API keys: ${JSON.stringify(keys).slice(0, 400)}`);
  }
  return { publishable, serviceRole };
}

async function writeEnv(ref, publishable, serviceRole) {
  const url = `https://${ref}.supabase.co`;
  const contents = `# Doutiva — independent Supabase (NOT Lovable)
# Generated ${new Date().toISOString()}
SUPABASE_PROJECT_ID=${ref}
SUPABASE_URL=${url}
SUPABASE_PUBLISHABLE_KEY=${publishable}
SUPABASE_SERVICE_ROLE_KEY=${serviceRole}

VITE_SUPABASE_PROJECT_ID=${ref}
VITE_SUPABASE_URL=${url}
VITE_SUPABASE_PUBLISHABLE_KEY=${publishable}

# Database (for migrations / drizzle)
SUPABASE_DB_PASSWORD=${dbPass}
DATABASE_URL=postgresql://postgres.${ref}:${encodeURIComponent(dbPass)}@aws-0-${region}.pooler.supabase.com:6543/postgres

# AI — set your own keys (do not rely on Lovable gateway)
# OPENAI_API_KEY=
# ANTHROPIC_API_KEY=
# AI_GATEWAY_BASE_URL=https://api.openai.com/v1
`;
  await writeFile(join(ROOT, ".env"), contents, { mode: 0o600 });
  console.log("Wrote /workspace/.env (gitignored)");
}

async function migrationFiles() {
  const dir = join(ROOT, "drizzle/migrations");
  const files = (await readdir(dir))
    .filter((f) => /^\d+.*\.sql$/.test(f))
    .sort();
  return files.map((f) => join(dir, f));
}

async function applyMigrations(ref, serviceRole) {
  const files = await migrationFiles();
  console.log(`Applying ${files.length} SQL migrations via PostgREST rpc is not possible; using database REST query API…`);

  // Management "database query" endpoint (beta): POST /v1/projects/{ref}/database/query
  for (const file of files) {
    const sql = await readFile(file, "utf8");
    const name = file.split("/").pop();
    process.stdout.write(`  ${name}… `);
    try {
      await api(`/projects/${ref}/database/query`, {
        method: "POST",
        body: { query: sql },
      });
      console.log("ok");
    } catch (e) {
      // Some projects expose /sql instead
      try {
        await api(`/projects/${ref}/database/query`, {
          method: "POST",
          body: { query: sql },
        });
        console.log("ok");
      } catch (e2) {
        console.log("FAILED");
        console.error(`    ${e2.message}`);
        console.error(`    Apply manually: psql "$DATABASE_URL" -f ${file}`);
        throw e2;
      }
    }
  }
}

async function main() {
  console.log("=== Doutiva independent Supabase bootstrap ===");
  const orgId = await pickOrg();
  console.log(`org=${orgId}`);
  const project = await findOrCreateProject(orgId);
  const healthy = await waitHealthy(project.id);
  const { publishable, serviceRole } = await getKeys(healthy.id);
  await writeEnv(healthy.id, publishable, serviceRole);
  try {
    await applyMigrations(healthy.id, serviceRole);
  } catch {
    console.error("\nMigrations need a one-shot apply. After .env is loaded:");
    console.error('  for f in drizzle/migrations/*.sql; do psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"; done');
  }
  console.log("\nDone. Restart vite so it picks up the new .env.");
  console.log(`Dashboard: https://supabase.com/dashboard/project/${healthy.id}`);
  console.log(`Fingerprint: ${createHash("sha256").update(publishable).digest("hex").slice(0, 12)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
