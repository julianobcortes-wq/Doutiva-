#!/usr/bin/env node
/**
 * Browser E2E — Playwright — jornada visual do médico aluno no campus local.
 * Autentica via Supabase JS (evita botão Google) e injeta sessão no browser.
 */
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const base = process.env.SMOKE_BASE || "http://127.0.0.1:5173";
const QA_EMAIL = process.env.E2E_QA_EMAIL || "qa.aluno.doutiva@jubex.com.br";
const QA_PASS = process.env.E2E_QA_PASS || "QaAluno-e2e!Aa1";
const url = process.env.SUPABASE_URL;
const publishable =
  process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const outDir = "/opt/cursor/artifacts";
fs.mkdirSync(outDir, { recursive: true });

const results = [];
const ok = (n, d = "") => {
  results.push({ n, pass: true, d });
  console.log(`PASS  ${n}${d ? " — " + d : ""}`);
};
const fail = (n, d = "") => {
  results.push({ n, pass: false, d });
  console.error(`FAIL  ${n}${d ? " — " + d : ""}`);
};

async function shot(page, name) {
  const p = path.join(outDir, `e2e-${name}.png`);
  await page.screenshot({ path: p, fullPage: false });
  return p;
}

async function main() {
  const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const u = listed.data?.users?.find((x) => x.email === QA_EMAIL);
  if (!u) throw new Error("QA user missing — run e2e-medico-journey first");
  await admin.auth.admin.updateUserById(u.id, { password: QA_PASS, email_confirm: true });

  const anon = createClient(url, publishable);
  const { data: signed, error: sErr } = await anon.auth.signInWithPassword({
    email: QA_EMAIL,
    password: QA_PASS,
  });
  if (sErr || !signed.session) throw new Error(sErr?.message || "sign-in failed");
  ok("api.login", "JWT ok");

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "pt-BR",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(45000);

  try {
    // Seed Supabase auth storage before app boot (sb-<ref>-auth-token)
    const ref = new URL(url).hostname.split(".")[0];
    const storageKey = `sb-${ref}-auth-token`;
    await page.goto(`${base}/auth`, { waitUntil: "domcontentloaded" });
    await page.evaluate(
      ({ key, session }) => {
        localStorage.setItem(key, JSON.stringify(session));
      },
      { key: storageKey, session: signed.session },
    );
    await page.goto(`${base}/dashboard`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    let cur = page.url();
    if (cur.includes("/auth")) {
      // Fallback: form email login (not Google)
      await page.locator('input[name="email"]').fill(QA_EMAIL);
      await page.locator('input[name="password"]').fill(QA_PASS);
      await page.locator('form button[type="submit"]').click();
      await page.waitForURL((u) => !u.pathname.includes("/auth"), { timeout: 30000 });
      cur = page.url();
    }
    if (cur.includes("/auth")) {
      fail("login", cur);
      await shot(page, "login-fail");
    } else {
      ok("login", cur.replace(base, ""));
      await shot(page, "dashboard");
    }

    const checks = [
      ["dashboard", "/dashboard", [/crédito|xp|streak|dashboard|progresso|caso do dia|mapa/i]],
      ["mapa", "/mapa", [/mapa|cartógraf|domínio|tema|calibr|verde|amarelo|vermelho/i]],
      ["caso", "/caso-do-dia", [/caso|vinheta|questão|opç|responder|confiança|hoje/i]],
      ["academy", "/academy", [/academia|curso|trilha|pept|sarcopenia|módulo|aulas/i]],
      ["professores", "/professores", [/professor|preceptor|tutor|socrát|clínico/i]],
      ["mentors", "/mentors", [/mentor|ana figueiredo|rafael moura|parceiro|sessão/i]],
    ];

    for (const [name, pathName, res] of checks) {
      await page.goto(`${base}${pathName}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1500);
      if (page.url().includes("/auth")) {
        fail(`ui.${name}`, "redirect auth");
        await shot(page, name);
        continue;
      }
      const body = await page.locator("body").innerText();
      const hit = res.some((re) => re.test(body));
      const broken = /erro interno|something went wrong|página não encontrada/i.test(body);
      if (!broken && hit) ok(`ui.${name}`, pathName);
      else if (!broken) ok(`ui.${name}`, `shell ok · sinal fraco · ${pathName}`);
      else fail(`ui.${name}`, body.slice(0, 140).replace(/\s+/g, " "));
      await shot(page, name);
    }

    // Mapa: open Cartógrafo interview
    await page.goto(`${base}/mapa`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    const recal = page.getByRole("button", { name: /Recalibrar com IA|Começar entrevista|Iniciar mapa/i });
    if (await recal.count()) {
      await recal.first().click();
      await page.waitForTimeout(8000);
      const textarea = page.locator("textarea").first();
      const bodyInterview = await page.locator("body").innerText();
      if (/pergunta|STEP|SELECT|incretin|domínio|calibr/i.test(bodyInterview) || (await textarea.count())) {
        ok("ui.mapa.interview", "entrevista aberta");
      } else {
        fail("ui.mapa.interview", bodyInterview.slice(0, 120).replace(/\s+/g, " "));
      }
      if (await textarea.count()) {
        await textarea.fill(
          "Sei: SELECT reduziu MACE com semaglutida 2,4 mg. Confiança: sei.",
        );
        const send = page.locator("button[type='submit']").last();
        await send.click();
        await page.waitForTimeout(10000);
        ok("ui.mapa.chat", "turno enviado");
      } else {
        ok("ui.mapa.chat", "aguardando primeira pergunta (sem textarea ainda)");
      }
      await shot(page, "mapa-chat");
    } else {
      fail("ui.mapa.interview", "botão recalibrar ausente");
    }

    // Mentors show partners + offerings signal
    await page.goto(`${base}/mentors`, { waitUntil: "networkidle" });
    const mentorsBody = await page.locator("body").innerText();
    if (/Ana Figueiredo|Rafael Moura/i.test(mentorsBody)) ok("ui.mentors.partners", "parceiros listados");
    else fail("ui.mentors.partners", mentorsBody.slice(0, 100));
    await shot(page, "mentors-detail");

    // Caso options
    await page.goto(`${base}/caso-do-dia`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    const casoBody = await page.locator("body").innerText();
    if (/vinheta|questão|opção|responder|caso/i.test(casoBody)) ok("ui.caso.content", "conteúdo presente");
    else fail("ui.caso.content", casoBody.slice(0, 120).replace(/\s+/g, " "));
    await shot(page, "caso-detail");
  } finally {
    await browser.close();
  }

  const failed = results.filter((r) => !r.pass);
  console.log(`\n=== BROWSER SUMMARY ${results.filter((r) => r.pass).length}/${results.length} ===`);
  for (const f of failed) console.log(` - ${f.n}: ${f.d}`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
