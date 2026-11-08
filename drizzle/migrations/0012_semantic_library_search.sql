CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;
ALTER TABLE public.knowledge_sources ADD COLUMN IF NOT EXISTS embedding extensions.vector(3072);
CREATE INDEX IF NOT EXISTS knowledge_sources_embedding_idx ON public.knowledge_sources
  USING hnsw ((embedding::extensions.halfvec(3072)) extensions.halfvec_cosine_ops);

CREATE OR REPLACE FUNCTION public.reset_source_embedding()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.title IS DISTINCT FROM OLD.title OR NEW.abstract IS DISTINCT FROM OLD.abstract
     OR NEW.full_text IS DISTINCT FROM OLD.full_text OR NEW.tags IS DISTINCT FROM OLD.tags THEN
    IF NEW.embedding IS NOT DISTINCT FROM OLD.embedding THEN NEW.embedding := NULL; END IF;
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.reset_source_embedding() FROM public, anon, authenticated;
DROP TRIGGER IF EXISTS knowledge_sources_reset_embedding ON public.knowledge_sources;
CREATE TRIGGER knowledge_sources_reset_embedding BEFORE UPDATE ON public.knowledge_sources
  FOR EACH ROW EXECUTE FUNCTION public.reset_source_embedding();

CREATE OR REPLACE FUNCTION public.match_sources(_embedding text, _limit int DEFAULT 6)
RETURNS TABLE(title text, authors text, journal text, year int, doi text, url text, evidence_level text, excerpt text, similarity float)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, extensions AS $$
  SELECT s.title, s.authors, s.journal, s.year, s.doi, s.url, s.evidence_level,
         left(COALESCE(s.abstract, s.full_text, ''), 1500),
         1 - (s.embedding::halfvec(3072) <=> (_embedding::vector(3072))::halfvec(3072))
  FROM public.knowledge_sources s
  WHERE auth.uid() IS NOT NULL AND s.embedding IS NOT NULL
  ORDER BY s.embedding::halfvec(3072) <=> (_embedding::vector(3072))::halfvec(3072)
  LIMIT LEAST(_limit, 10)
$$;
REVOKE ALL ON FUNCTION public.match_sources(text, int) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.match_sources(text, int) TO authenticated;