-- Align pgvector with OpenAI text-embedding-3-small (1536 dims).
-- Prior column was 3072 (text-embedding-3-large / Lovable gemini path).

DROP INDEX IF EXISTS public.knowledge_sources_embedding_idx;

ALTER TABLE public.knowledge_sources
  ALTER COLUMN embedding TYPE extensions.vector(1536)
  USING NULL;

CREATE INDEX knowledge_sources_embedding_idx ON public.knowledge_sources
  USING hnsw ((embedding::extensions.halfvec(1536)) extensions.halfvec_cosine_ops);

CREATE OR REPLACE FUNCTION public.match_sources(_embedding text, _limit int DEFAULT 6)
RETURNS TABLE(title text, authors text, journal text, year int, doi text, url text, evidence_level text, excerpt text, similarity float)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, extensions AS $$
  SELECT s.title, s.authors, s.journal, s.year, s.doi, s.url, s.evidence_level,
         left(COALESCE(s.abstract, s.full_text, ''), 1500),
         1 - (s.embedding::halfvec(1536) <=> (_embedding::vector(1536))::halfvec(1536))
  FROM public.knowledge_sources s
  WHERE auth.uid() IS NOT NULL AND s.embedding IS NOT NULL
  ORDER BY s.embedding::halfvec(1536) <=> (_embedding::vector(1536))::halfvec(1536)
  LIMIT LEAST(_limit, 10)
$$;
REVOKE ALL ON FUNCTION public.match_sources(text, int) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.match_sources(text, int) TO authenticated;
