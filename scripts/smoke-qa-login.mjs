#!/usr/bin/env node
/**
 * Smoke-test permanent QA logins against the live Auth backend.
 * Usage: node scripts/smoke-qa-login.mjs
 * Exit 0 only if both aluno and professor password grants succeed.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cfg = readFileSync(join(root, "src/integrations/supabase/public-config.ts"), "utf8");
const urlMatch = cfg.match(/PUBLIC_SUPABASE_URL\s*=\s*"([^"]+)"/);
const keyMatch = cfg.match(/PUBLIC_SUPABASE_PUBLISHABLE_KEY\s*=\s*\n?\s*"([^"]+)"/);
const url = (process.env.SUPABASE_URL || urlMatch?.[1] || "").replace(/\/+$/, "");
const key = process.env.SUPABASE_PUBLISHABLE_KEY || keyMatch?.[1] || "";

if (!url || !key) {
  console.error("Missing Supabase URL/key");
  process.exit(1);
}

const accounts = [
  { email: "aluno.teste@doutiva.com", password: "AlunoTeste82@" },
  { email: "professor.teste@doutiva.com", password: "ProfessorTeste82@" },
];

let failed = 0;
for (const a of accounts) {
  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: a.email, password: a.password }),
  });
  const body = await res.text();
  if (!res.ok) {
    console.error(`FAIL ${a.email}: ${res.status} ${body.slice(0, 200)}`);
    failed += 1;
    continue;
  }
  console.log(`OK   ${a.email}`);
}

if (failed) {
  console.error(`\n${failed} QA login(s) failed against ${url}`);
  process.exit(1);
}
console.log(`\nAll QA logins OK against ${url}`);
