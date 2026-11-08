#!/usr/bin/env node
/**
 * Find lessons with thin/missing monograph and re-deepen them with --force semantics.
 * Usage: node --env-file=.env --import tsx scripts/retry-missing-doutiva-v3.mjs
 *        node --env-file=.env --import tsx scripts/retry-missing-doutiva-v3.mjs --course=hormonios-implantes-criterio
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { spawn } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import { COURSES } from "./doutiva-curriculum-v3.mjs";

function loadEnv() {
  try {
    for (const line of readFileSync(".env", "utf8").split("\n")) {
      if (!line || line.startsWith("#")) continue;
      const i = line.indexOf("=");
      if (i < 0) continue;
      const k = line.slice(0, i);
      const v = line.slice(i + 1);
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {
    /* optional */
  }
}
loadEnv();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const courseArg = (process.argv.find((a) => a.startsWith("--course=")) || "").split("=")[1];
const MIN = 8000;

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit", cwd: process.cwd() });
    p.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`exit ${code}`))));
  });
}

async function main() {
  const list = courseArg ? COURSES.filter((c) => c.slug === courseArg) : COURSES;
  for (const c of list) {
    const { data: course } = await supabase.from("courses").select("id").eq("slug", c.slug).single();
    const { data: lessons } = await supabase
      .from("lessons")
      .select("position, monograph, slides")
      .eq("course_id", course.id)
      .order("position");
    const missing = (lessons || [])
      .filter((l) => (l.monograph || "").length < MIN)
      .map((l) => l.position);
    if (!missing.length) {
      console.log(c.slug, "OK all deep");
      continue;
    }
    console.log(c.slug, "retry positions", missing.join(","));
    await run("node", [
      "--env-file=.env",
      "--import",
      "tsx",
      "scripts/deepen-doutiva-courses-v3.mjs",
      `--course=${c.slug}`,
      `--only=${missing.join(",")}`,
      "--force",
    ]);
  }
  console.log("RETRY_PASS_DONE");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
