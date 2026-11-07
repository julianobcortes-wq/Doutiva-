-- Allow the publishable (anon) key to read published course/lesson content.
-- Needed so server-side grading helpers that fall back to a publishable client
-- see the same catalog as authenticated students. Answer keys stay out of
-- clinical_case (see 0014) / behind service_role.

DO $$ BEGIN
  CREATE POLICY "anon read published courses"
    ON public.courses FOR SELECT TO anon
    USING (published = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "anon read published lessons"
    ON public.lessons FOR SELECT TO anon
    USING (
      status = 'published'
      AND EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.id = lessons.course_id AND c.published = true
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
