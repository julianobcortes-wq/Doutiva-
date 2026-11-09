/**
 * Curated landmark DOIs for Doutiva — only entries verified against publisher pages.
 * Prefer these over model-emitted DOIs. If unsure, omit DOI entirely.
 */
export const GOLD_DOIS = {
  // Incretinas / obesidade
  "SURMOUNT-1": {
    doi: "10.1056/NEJMoa2206038",
    citation:
      "Jastreboff AM et al. Tirzepatide Once Weekly for the Treatment of Obesity (SURMOUNT-1). N Engl J Med. 2022;387:205-216.",
    url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2206038",
  },
  "STEP-1": {
    doi: "10.1056/NEJMoa2032183",
    citation:
      "Wilding JPH et al. Once-Weekly Semaglutide in Adults with Overweight or Obesity (STEP 1). N Engl J Med. 2021;384:989-1002.",
    url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2032183",
  },
  "SELECT": {
    doi: "10.1056/NEJMoa2307563",
    citation:
      "Lincoff AM et al. Semaglutide and Cardiovascular Outcomes in Obesity without Diabetes (SELECT). N Engl J Med. 2023;389:2221-2232.",
    url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2307563",
  },
  "FLOW": {
    doi: "10.1056/NEJMoa2403347",
    citation:
      "Perkovic V et al. Effects of Semaglutide on Chronic Kidney Disease in Patients with Type 2 Diabetes (FLOW). N Engl J Med. 2024;391:109-121.",
    url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2403347",
  },
  "STEP-4": {
    doi: "10.1001/jama.2021.3224",
    citation:
      "Rubino D et al. Effect of Continued Weekly Semaglutide vs Placebo on Weight Loss Maintenance in Adults With Overweight or Obesity (STEP 4). JAMA. 2021;325(14):1414-1425.",
    url: "https://jamanetwork.com/journals/jama/fullarticle/2777886",
  },
  "SURMOUNT-5": {
    doi: "10.1056/NEJMoa2416394",
    citation:
      "Aronne LJ et al. Tirzepatide as Compared with Semaglutide for the Treatment of Obesity (SURMOUNT-5). N Engl J Med. 2025;393:26-36.",
    url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2416394",
  },
  // Hormônios / sangue
  "ENDOCRINE-SOCIETY-TRT-2018": {
    doi: "10.1210/jc.2018-00229",
    citation:
      "Bhasin S et al. Testosterone Therapy in Men With Hypogonadism: An Endocrine Society Clinical Practice Guideline. J Clin Endocrinol Metab. 2018;103:1715-1744.",
    url: "https://academic.oup.com/jcem/article/103/5/1715/4939465",
  },
  "BAILLARGEON-TRT-VTE-2015": {
    doi: "10.1016/j.mayocp.2015.05.012",
    citation:
      "Baillargeon J et al. Risk of Venous Thromboembolism in Men Receiving Testosterone Therapy. Mayo Clin Proc. 2015;90(8):1038-1045.",
    url: "https://doi.org/10.1016/j.mayocp.2015.05.012",
  },
  // Compounding / segurança
  "NECC-FUNGAL-MENINGITIS-2012": {
    doi: "10.1056/NEJMoa1213978",
    citation:
      "Smith RM et al. Fungal Infections Associated with Contaminated Methylprednisolone Injections. N Engl J Med. 2013;369:1598-1609.",
    url: "https://www.nejm.org/doi/full/10.1056/NEJMoa1213978",
  },
};

/** DOIs confirmed fabricated, mismatched, or unresolved — strip on sight (keep rest of citation) */
export const BANNED_DOIS = [
  "10.1056/nejmoa2022186",
  "10.1177/1060028015595427", // wrong journal/DOI pairing for Baillargeon VTE
  "10.1016/s2213-8587(18", // truncated
  "10.1161/circulationaha.106.656987",
  "10.1182/blood-2016-05-716737",
  "10.3945/ajcn.111.030750",
  "10.1111/dom.14056",
  "10.1007/s13679-022-00489-6",
  "10.1056/nejmoa2416392", // off-by-digit hallucination of SURMOUNT-5 (real: ...394)
];

/** Regex: incomplete Elsevier-style DOIs cut at year paren */
export const INCOMPLETE_DOI_RE = /10\.\d{4,9}\/[A-Za-z0-9._;()\-\/]*\(\d{2,4}(?!\))/g;
