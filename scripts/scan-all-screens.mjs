#!/usr/bin/env node
/**
 * Authenticated screen sweep — visit every app route and report crashes.
 * Usage: APP_BASE=http://127.0.0.1:5173 node scripts/scan-all-screens.mjs
 */
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import { writeFileSync, mkdirSync } from "node:fs";

const base = process.env.APP_BASE || "http://127.0.0.1:5173";
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY;
const email = process.env.TEST_EMAIL || "teste@doutiva.dev";
const password = process.env.TEST_PASSWORD || "DoutivaTeste2026!";

const ROUTES = [
  "/",
  "/auth",
  "/dashboard",
  "/onboarding",
  "/caso-do-dia",
  "/academy",
  "/academy/peptideos-medicina-de-precisao",
  "/revisao",
  "/professores",
  "/mentors",
  "/mentors/ana-figueiredo-endocrino",
  "/marketplace",
  "/creditos",
  "/ranking",
  "/certifications",
  "/credenciais",
  "/help",
  "/settings",
  "/community",
  "/community/incretinas-consultorio",
  "/events",
  "/events/masterclass-glp1-2026",
  "/library",
  "/inbox",
  "/notifications",
  "/missions",
  "/achievements",
  "/skills",
  "/season",
  "/store",
  "/wallet",
  "/billing",
  "/affiliates",
  "/admin",
  "/expert-apply",
  "/editor",
  "/editor/biblioteca",
  "/verificar/DEMO",
];

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data, error } = await supabase.auth.signInWithPassword({ email, password });
if (error) throw error;

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROME_PATH,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const results = [];

await page.goto(`${base}/auth`, { waitUntil: "domcontentloaded", timeout: 60000 });
const ref = new URL(url).hostname.split(".")[0];
await page.evaluate(
  ({ k, s }) => localStorage.setItem(k, JSON.stringify(s)),
  { k: `sb-${ref}-auth-token`, s: data.session },
);

mkdirSync("/opt/cursor/artifacts/screen-scan", { recursive: true });

for (const route of ROUTES) {
  const errors = [];
  const onConsole = (m) => {
    if (m.type() === "error") errors.push(m.text().slice(0, 400));
  };
  const onPage = (e) => errors.push(`pageerror: ${e.message}`);
  page.on("console", onConsole);
  page.on("pageerror", onPage);

  let status = "ok";
  let snippet = "";
  let title = "";
  try {
    const res = await page.goto(`${base}${route}`, {
      waitUntil: "networkidle",
      timeout: 45000,
    });
    await page.waitForTimeout(1800);
    title = await page.title();
    const body = await page.locator("body").innerText();
    snippet = body.replace(/\s+/g, " ").slice(0, 220);
    const crashed = /This page didn't load|Something went wrong on our end/i.test(body);
    const notFound = /Page not found|404|Curso não encontrado|não encontrado/i.test(body);
    const stuckAuth = route !== "/auth" && /Entrar|Criar conta|Acesse a Doutiva/i.test(body) && body.length < 800;
    const emptyFatal = body.trim().length < 40;
    if (crashed) status = "crash";
    else if (stuckAuth) status = "auth-redirect";
    else if (emptyFatal) status = "blank";
    else if (notFound && !route.includes("DEMO")) status = "not-found";
    else if (res && res.status() >= 500) status = `http-${res.status()}`;
  } catch (e) {
    status = "nav-error";
    snippet = e.message.slice(0, 200);
  }

  const file = route.replace(/\//g, "_").replace(/^_/, "") || "root";
  await page.screenshot({
    path: `/opt/cursor/artifacts/screen-scan/${file || "root"}.png`,
    fullPage: false,
  }).catch(() => {});

  page.off("console", onConsole);
  page.off("pageerror", onPage);

  const meaningful = errors.filter(
    (e) =>
      !e.includes("404") &&
      !e.includes("Download the React DevTools") &&
      !e.includes("Failed to load resource"),
  );
  results.push({
    route,
    status,
    title,
    snippet,
    errors: meaningful.slice(0, 5),
  });
  console.log(
    `${status.padEnd(14)} ${route.padEnd(45)} ${meaningful[0] ? meaningful[0].slice(0, 80) : snippet.slice(0, 60)}`,
  );
}

await browser.close();
writeFileSync("/opt/cursor/artifacts/screen-scan/report.json", JSON.stringify(results, null, 2));
const bad = results.filter((r) => r.status !== "ok");
console.log("\n=== SUMMARY ===");
console.log(`total=${results.length} ok=${results.length - bad.length} bad=${bad.length}`);
for (const r of bad) {
  console.log(`- ${r.status} ${r.route}`);
  for (const e of r.errors) console.log(`    ${e.slice(0, 160)}`);
}
process.exit(bad.filter((r) => r.status === "crash" || r.status === "blank" || r.status === "nav-error").length ? 1 : 0);
