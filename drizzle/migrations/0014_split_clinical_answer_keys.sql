-- Split clinical answer keys out of student-readable lesson JSON.
-- Students keep vignette/options labels in lessons.clinical_case;
-- correct/rationale/teaching live in lesson_case_keys (service_role / admin only).

CREATE TABLE IF NOT EXISTS public.lesson_case_keys (
  lesson_id uuid PRIMARY KEY REFERENCES public.lessons(id) ON DELETE CASCADE,
  correct_option integer NOT NULL CHECK (correct_option >= 0),
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  teaching text NOT NULL DEFAULT '',
  reward integer NOT NULL DEFAULT 40,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lesson_case_keys ENABLE ROW LEVEL SECURITY;
-- No policies for authenticated → deny by default. service_role bypasses RLS.
GRANT ALL ON TABLE public.lesson_case_keys TO service_role;
REVOKE ALL ON TABLE public.lesson_case_keys FROM anon, authenticated;

-- Backfill keys from existing clinical_case payloads, then redact the public column.
DO $$
DECLARE
  r record;
  opts jsonb;
  i int;
  correct_idx int;
  public_opts jsonb;
  full_opts jsonb;
BEGIN
  FOR r IN
    SELECT id, clinical_case
    FROM public.lessons
    WHERE clinical_case IS NOT NULL
      AND jsonb_typeof(clinical_case->'options') = 'array'
  LOOP
    opts := r.clinical_case->'options';
    correct_idx := NULL;
    full_opts := '[]'::jsonb;
    public_opts := '[]'::jsonb;
    FOR i IN 0 .. jsonb_array_length(opts) - 1 LOOP
      full_opts := full_opts || jsonb_build_array(opts->i);
      public_opts := public_opts || jsonb_build_array(jsonb_build_object('label', coalesce(opts->i->>'label', '')));
      IF coalesce((opts->i->>'correct')::boolean, false) THEN
        correct_idx := i;
      END IF;
    END LOOP;

    IF correct_idx IS NULL THEN
      CONTINUE;
    END IF;

    INSERT INTO public.lesson_case_keys(lesson_id, correct_option, options, teaching, reward)
    VALUES (
      r.id,
      correct_idx,
      full_opts,
      coalesce(r.clinical_case->>'teaching', ''),
      coalesce((r.clinical_case->>'reward')::int, 40)
    )
    ON CONFLICT (lesson_id) DO UPDATE SET
      correct_option = EXCLUDED.correct_option,
      options = EXCLUDED.options,
      teaching = EXCLUDED.teaching,
      reward = EXCLUDED.reward,
      updated_at = now();

    UPDATE public.lessons
    SET clinical_case =
      (r.clinical_case - 'teaching')
      || jsonb_build_object('options', public_opts)
    WHERE id = r.id;
  END LOOP;
END $$;

COMMENT ON TABLE public.lesson_case_keys IS
  'Private clinical answer keys. Never expose to authenticated clients; grade only via server service_role.';
