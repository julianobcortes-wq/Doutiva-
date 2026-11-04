ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS review_due_at timestamptz;

CREATE TABLE public.lesson_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL,
  version integer NOT NULL,
  changed_by uuid,
  changed_at timestamptz NOT NULL DEFAULT now(),
  status text,
  title text,
  snapshot jsonb NOT NULL
);
CREATE INDEX lesson_versions_lesson_idx ON public.lesson_versions(lesson_id, version DESC);
GRANT SELECT ON public.lesson_versions TO authenticated;
GRANT ALL ON public.lesson_versions TO service_role;
ALTER TABLE public.lesson_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read versions" ON public.lesson_versions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.track_lesson_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'review' AND (OLD.status IS DISTINCT FROM 'review') THEN
    NEW.review_due_at := now() + interval '3 days';
  ELSIF NEW.status <> 'review' THEN
    NEW.review_due_at := NULL;
  END IF;
  INSERT INTO public.lesson_versions(lesson_id, version, changed_by, status, title, snapshot)
  VALUES (OLD.id, COALESCE((SELECT max(version) FROM public.lesson_versions WHERE lesson_id = OLD.id), 0) + 1,
    auth.uid(), OLD.status, OLD.title, to_jsonb(OLD));
  RETURN NEW;
END $$;
CREATE TRIGGER lessons_track_change BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.track_lesson_change();

CREATE TABLE public.mentor_credentials (
  user_id uuid PRIMARY KEY,
  full_name text NOT NULL,
  crm text NOT NULL,
  crm_uf text NOT NULL,
  rqe text,
  specialty text,
  bio text,
  verified boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.mentor_credentials TO authenticated;
GRANT ALL ON public.mentor_credentials TO service_role;
ALTER TABLE public.mentor_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own or admin read" ON public.mentor_credentials FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own insert unverified" ON public.mentor_credentials FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND verified = false);
CREATE POLICY "own update" ON public.mentor_credentials FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR (auth.uid() = user_id AND verified = false));

CREATE OR REPLACE FUNCTION public.search_sources(_q text, _limit int DEFAULT 6)
RETURNS TABLE(title text, authors text, journal text, year int, doi text, url text, evidence_level text, excerpt text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT s.title, s.authors, s.journal, s.year, s.doi, s.url, s.evidence_level,
         left(COALESCE(s.abstract, s.full_text, ''), 1500)
  FROM public.knowledge_sources s,
       LATERAL (SELECT count(*) AS hits FROM unnest(regexp_split_to_array(lower(_q), '\W+')) w
                WHERE length(w) > 3 AND lower(s.title || ' ' || COALESCE(s.abstract,'') || ' ' || array_to_string(s.tags,' ')) LIKE '%' || w || '%') m
  WHERE auth.uid() IS NOT NULL AND m.hits > 0
  ORDER BY m.hits DESC, s.year DESC NULLS LAST
  LIMIT LEAST(_limit, 10)
$$;
REVOKE ALL ON FUNCTION public.search_sources(text, int) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.search_sources(text, int) TO authenticated;