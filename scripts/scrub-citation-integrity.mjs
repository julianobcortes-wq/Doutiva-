#!/usr/bin/env node
/**
 * Mechanical citation integrity scrub for physician-facing authority.
 * - Strip incomplete / banned DOIs
 * - Replace known mismatched citations with curated gold entries
 * - Normalize landmark trial DOIs when the trial name is present but DOI wrong
 *
 * Usage:
 *   node --env-file=.env scripts/scrub-citation-integrity.mjs
 *   node --env-file=.env scripts/scrub-citation-integrity.mjs --dry-run
 *   node --env-file=.env scripts/scrub-citation-integrity.mjs --course=cardiometabolico-prescritor-criterio
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { GOLD_DOIS, BANNED_DOIS, INCOMPLETE_DOI_RE } from "./gold-doi-map.mjs";

const dry = process.argv.includes("--dry-run");
const courseArg = (process.argv.find((a) => a.startsWith("--course=")) || "").split("=")[1];
const SKIP = new Set(["Negócios"]);

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const BANNED_SET = new Set(BANNED_DOIS.map((d) => d.toLowerCase()));
const DOI_TOKEN = /10\.\d{4,9}\/[A-Za-z0-9._;()\/:\-]+/g;

function stripBadDoisFromText(text) {
  if (!text) return { text, changes: [] };
  const changes = [];
  let out = text;

  // incomplete parenthetical DOIs
  out = out.replace(INCOMPLETE_DOI_RE, (m) => {
    changes.push(`strip_incomplete:${m}`);
    return "[DOI incompleto removido — citar pelo nome do trial/guideline]";
  });

  // any DOI that appears in banned list (prefix match for truncated)
  out = out.replace(DOI_TOKEN, (m) => {
    const low = m.toLowerCase().replace(/[.,);]+$/, "");
    if ([...BANNED_SET].some((b) => low === b || low.startsWith(b))) {
      changes.push(`strip_banned:${m}`);
      return "";
    }
    // unbalanced paren DOI
    if (low.includes("(") && !low.includes(")")) {
      changes.push(`strip_unbalanced:${m}`);
      return "";
    }
    return m;
  });

  // cleanup double spaces / empty DOI: lines
  out = out.replace(/\bDOI:\s*(?=\n|$)/gi, "");
  out = out.replace(/[ \t]{2,}/g, " ");
  return { text: out, changes };
}

function detectGoldKey(citation) {
  const c = citation || "";
  if (/SURMOUNT-?1/i.test(c) && /Jastreboff|tirzepatide/i.test(c)) return "SURMOUNT-1";
  if (/SURMOUNT-?5/i.test(c) && /Aronne|tirzepatide|semaglutide/i.test(c)) return "SURMOUNT-5";
  if (/\bSTEP\s*1\b/i.test(c) && /Wilding|semaglutide/i.test(c)) return "STEP-1";
  if (/\bSTEP\s*4\b/i.test(c) && /Rubino|semaglutide|maintenance/i.test(c)) return "STEP-4";
  if (/\bSELECT\b/i.test(c) && /Lincoff|semaglutide/i.test(c)) return "SELECT";
  if (/\bFLOW\b/i.test(c) && /Perkovic|semaglutide|kidney|renal/i.test(c)) return "FLOW";
  if (/Baillargeon/i.test(c) && /thrombo|VTE|venous|Mayo|Pharmacother/i.test(c))
    return "BAILLARGEON-TRT-VTE-2015";
  if (/Bhasin/i.test(c) && /Endocrine Society|hypogonadism|Testosterone Therapy/i.test(c))
    return "ENDOCRINE-SOCIETY-TRT-2018";
  // Only replace when the citation itself claims the NECC/NEJM fungal outbreak paper
  if (
    (/NECC/i.test(c) || /contaminated methylprednisolone/i.test(c) || /Kainer/i.test(c) || /Smith RM/i.test(c)) &&
    /fungal|meningitis|NEJM|N Engl J Med/i.test(c)
  ) {
    return "NECC-FUNGAL-MENINGITIS-2012";
  }
  return null;
}

function scrubRefs(refs) {
  const changes = [];
  const out = [];
  const seenGold = new Set();
  for (const ref of refs || []) {
    let citation = String(ref.citation || "");
    let url = ref.url || null;
    const goldKey = detectGoldKey(citation);
    if (goldKey && GOLD_DOIS[goldKey] && !seenGold.has(goldKey)) {
      // Always normalize landmark citations to curated publisher metadata (anti face-plant).
      const g = GOLD_DOIS[goldKey];
      changes.push(`gold_replace:${goldKey}`);
      citation = `${g.citation} DOI: ${g.doi}`;
      url = g.url;
      seenGold.add(goldKey);
      out.push({ citation, url });
      continue;
    }

    const scrubbed = stripBadDoisFromText(citation);
    citation = scrubbed.text.trim();
    changes.push(...scrubbed.changes.map((c) => `ref:${c}`));

    if (url) {
      const u = stripBadDoisFromText(url);
      url = u.text.trim() || null;
      changes.push(...u.changes.map((c) => `url:${c}`));
      // kill sage URL that embeds banned DOI
      if (url && [...BANNED_SET].some((b) => url.toLowerCase().includes(b))) {
        url = null;
        changes.push("url:drop_banned_doi_host");
      }
    }

    // drop empty / placeholder-only refs
    if (!citation || /^verificar$/i.test(citation) || citation.length < 12) {
      changes.push("ref:drop_empty");
      continue;
    }
    out.push({ citation, url });
  }

  // ensure gold landmarks present if monograph mentions them? skip — don't invent silently
  return { refs: out, changes };
}

function scrubMono(mono) {
  const changes = [];
  let text = mono || "";

  // Fix Baillargeon wrong journal inline if present
  if (/Baillargeon[\s\S]{0,80}Ann Pharmacother/i.test(text)) {
    text = text.replace(
      /Baillargeon[^.\n]{0,120}Ann Pharmacother[^.\n]{0,80}/gi,
      "Baillargeon J et al. Mayo Clin Proc. 2015 (VTE e TRT; DOI 10.1016/j.mayocp.2015.05.012)",
    );
    changes.push("mono:fix_baillargeon_journal");
  }

  // Landmark DOI swaps in body
  const swaps = [
    [/10\.1056\/NEJMoa2206038/gi, "10.1056/NEJMoa2206038"], // identity
    // wrong SELECT volume sometimes; ensure DOI string if SELECT mentioned with wrong doi
  ];
  void swaps;

  // Replace wrong SURMOUNT DOI patterns if any known fakes
  text = text.replace(/10\.1056\/nejmoa2022186/gi, () => {
    changes.push("mono:strip_fake_nejm_doi");
    return "10.1056/NEJMoa2206038";
  });

  const scrubbed = stripBadDoisFromText(text);
  text = scrubbed.text;
  changes.push(...scrubbed.changes.map((c) => `mono:${c}`));

  // Prefer gold DOI strings when trial named nearby with wrong DOI — light touch
  if (/SURMOUNT-?1/i.test(text) && !/10\.1056\/NEJMoa2206038/i.test(text)) {
    // don't inject aggressively into prose
  }

  return { text, changes };
}

async function main() {
  mkdirSync("/tmp/scientific-audit", { recursive: true });
  let q = supabase.from("courses").select("id,slug,title,category").eq("published", true);
  if (courseArg) q = q.eq("slug", courseArg);
  const { data: courses, error } = await q;
  if (error) throw error;

  const log = [];
  let updated = 0;

  for (const c of courses || []) {
    if (SKIP.has(c.category)) continue;
    const { data: lessons } = await supabase
      .from("lessons")
      .select("id,position,title,monograph,refs")
      .eq("course_id", c.id)
      .eq("status", "published")
      .order("position");

    for (const L of lessons || []) {
      const monoRes = scrubMono(L.monograph || "");
      const refRes = scrubRefs(L.refs || []);
      const changes = [...monoRes.changes, ...refRes.changes];
      if (!changes.length) continue;

      const entry = {
        course: c.slug,
        position: L.position,
        title: L.title,
        changes,
        dry,
      };
      log.push(entry);
      console.log(`${c.slug}#${L.position}`, changes.join(", "));

      if (!dry) {
        const { error: uerr } = await supabase
          .from("lessons")
          .update({
            monograph: monoRes.text,
            refs: refRes.refs,
            updated_at: new Date().toISOString(),
            reviewed_by: "Conselho editorial Doutiva · scrub de integridade citacional",
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", L.id);
        if (uerr) console.error("UPDATE_FAIL", uerr.message);
        else updated++;
      }
    }
  }

  writeFileSync("/tmp/scientific-audit/scrub-log.json", JSON.stringify(log, null, 2));
  writeFileSync("docs/citation-scrub-log.json", JSON.stringify({ updated, dry, n: log.length, log }, null, 2));
  console.log(`\nDONE scrub events=${log.length} updated=${updated} dry=${dry}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
