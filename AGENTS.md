- Course content is authored in the in-app Course Studio (/editor, admin-only via user_roles + has_role); lesson DB columns (slides, monograph, clinical_case, quick_ref) override the built-in src/content files, which remain as fallback. Why: mentors create courses without code changes.
- Lessons have status draft/review/published; only published lessons are visible to students (RLS), and publishing requires a named reviewer. Why: medical content must pass human review.
- Clinical answer keys live in public.lesson_case_keys (service_role only). Student clients receive redacted cases; grading is server-side (getTodayCase / answerDailyCase / gradeLessonCase). Why: XP/mastery integrity.
- mastery_records INSERT is service_role only (preceptor evaluate path). Why: domain scores must not be client-forgeable.
- Faculty nav is gated by has_role('admin') via studioMe — never localStorage user_class.

- Studio lesson generation is a 3-stage pipeline in src/lib/lesson-ai.server.ts (Claude Opus monograph → GPT structuring → Claude Sonnet audit). Why: depth from one model, structure from another, independent review.
- Scientific Library lives in public.knowledge_sources (admin-only RLS); search uses Europe PMC + ClinicalTrials.gov v2 public APIs (no keys); PDFs are parsed client-side with pdfjs-dist. Selected sources are injected as numbered [S#] corpus into lesson generation. Why: lessons grounded in real, citable evidence.
- AI Professors (/professores) run through src/lib/preceptor.server.ts with personas in src/lib/preceptor-personas.ts; each graded session is stored in public.mastery_records. Why: mastery is measured per session and drives future adaptive study.
