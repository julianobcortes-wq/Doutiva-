-- Cérebro Doutiva — memória por tema (Cartógrafo / Preceptor / next_session).
-- AI-first: o mapa do médico é a fonte de verdade para o que ensinar.

CREATE TABLE IF NOT EXISTS public.clinical_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  specialty text NOT NULL DEFAULT 'geral',
  summary text,
  parent_id uuid REFERENCES public.clinical_topics(id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS clinical_topics_specialty_idx
  ON public.clinical_topics (specialty, sort_order);

CREATE TABLE IF NOT EXISTS public.mastery_by_topic (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id uuid NOT NULL REFERENCES public.clinical_topics(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  band text NOT NULL DEFAULT 'red' CHECK (band IN ('green', 'yellow', 'red')),
  confidence_avg numeric(4,2) NOT NULL DEFAULT 0,
  attempts integer NOT NULL DEFAULT 0,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, topic_id)
);

CREATE INDEX IF NOT EXISTS mastery_by_topic_user_band_idx
  ON public.mastery_by_topic (user_id, band, score);

CREATE TABLE IF NOT EXISTS public.brain_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  face text NOT NULL CHECK (face IN ('cartographer', 'preceptor', 'librarian', 'studio', 'matchmaker')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  transcript jsonb NOT NULL DEFAULT '[]'::jsonb,
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS brain_sessions_user_idx
  ON public.brain_sessions (user_id, created_at DESC);

ALTER TABLE public.clinical_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mastery_by_topic ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "topics readable" ON public.clinical_topics;
CREATE POLICY "topics readable" ON public.clinical_topics
  FOR SELECT TO authenticated USING (active = true);

DROP POLICY IF EXISTS "own mastery_by_topic read" ON public.mastery_by_topic;
CREATE POLICY "own mastery_by_topic read" ON public.mastery_by_topic
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own brain_sessions read" ON public.brain_sessions;
CREATE POLICY "own brain_sessions read" ON public.brain_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own brain_sessions insert" ON public.brain_sessions;
CREATE POLICY "own brain_sessions insert" ON public.brain_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "own brain_sessions update" ON public.brain_sessions;
CREATE POLICY "own brain_sessions update" ON public.brain_sessions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

GRANT SELECT ON public.clinical_topics TO authenticated;
GRANT SELECT ON public.mastery_by_topic TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.brain_sessions TO authenticated;
GRANT ALL ON public.clinical_topics TO service_role;
GRANT ALL ON public.mastery_by_topic TO service_role;
GRANT ALL ON public.brain_sessions TO service_role;

-- Band helper: score + confidence → green / yellow / red
CREATE OR REPLACE FUNCTION public.mastery_band(score integer, confidence numeric DEFAULT 0.5)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN score >= 75 AND confidence >= 0.65 THEN 'green'
    WHEN score >= 45 THEN 'yellow'
    ELSE 'red'
  END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_mastery_by_topic(
  _user_id uuid,
  _topic_id uuid,
  _score integer,
  _confidence numeric DEFAULT 0.5,
  _evidence jsonb DEFAULT '{}'::jsonb
)
RETURNS public.mastery_by_topic
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  row public.mastery_by_topic;
  conf numeric := GREATEST(0, LEAST(1, COALESCE(_confidence, 0.5)));
  sc integer := GREATEST(0, LEAST(100, COALESCE(_score, 0)));
  blended integer;
BEGIN
  IF _user_id IS NULL OR _topic_id IS NULL THEN
    RAISE EXCEPTION 'user_id e topic_id obrigatórios';
  END IF;

  INSERT INTO public.mastery_by_topic AS m (
    user_id, topic_id, score, band, confidence_avg, attempts, evidence, last_seen_at, updated_at
  ) VALUES (
    _user_id,
    _topic_id,
    sc,
    public.mastery_band(sc, conf),
    conf,
    1,
    COALESCE(_evidence, '{}'::jsonb),
    now(),
    now()
  )
  ON CONFLICT (user_id, topic_id) DO UPDATE SET
    score = GREATEST(0, LEAST(100, ROUND((m.score * 0.55) + (sc * 0.45))::integer)),
    confidence_avg = ROUND(((m.confidence_avg * 0.55) + (conf * 0.45))::numeric, 2),
    attempts = m.attempts + 1,
    evidence = COALESCE(m.evidence, '{}'::jsonb) || COALESCE(_evidence, '{}'::jsonb),
    last_seen_at = now(),
    updated_at = now()
  RETURNING * INTO row;

  -- Recompute band from blended values
  UPDATE public.mastery_by_topic
  SET band = public.mastery_band(score, confidence_avg)
  WHERE user_id = _user_id AND topic_id = _topic_id
  RETURNING * INTO row;

  RETURN row;
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_mastery_by_topic FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_mastery_by_topic TO service_role;

-- Seed clinical topics aligned to Doutiva (peptídeos / performance / regulação)
INSERT INTO public.clinical_topics (slug, title, specialty, summary, sort_order) VALUES
  ('incretinas-evidencia', 'Incretinas — evidência (STEP, SURMOUNT, SELECT)', 'incretinas', 'Ensaios pivô e leitura crítica de desfechos.', 10),
  ('incretinas-seguranca', 'Incretinas — segurança e massa magra', 'incretinas', 'EA GI, eventos raros, preservação muscular.', 20),
  ('incretinas-protocolo', 'Incretinas — protocolo de consultório', 'incretinas', 'Seleção, titulação, metas e seguimento.', 30),
  ('eixo-gh-secretagogos', 'Eixo GH — secretagogos', 'eixo-gh', 'Tesamorelina vs marketing (CJC, ipamorelina).', 40),
  ('reparo-bpc-tb500', 'Reparo tecidual — BPC-157 / TB-500 / GHK-Cu', 'reparo', 'Evidência pré-clínica vs lacunas humanas.', 50),
  ('regulacao-anvisa-cfm', 'Regulação ANVISA / CFM / WADA', 'regulacao', 'Aprovado, off-label, manipulado, doping.', 60),
  ('composicao-corporal', 'Composição corporal e performance', 'performance', 'DEXA, proteína, treino de força no protocolo.', 70),
  ('demanda-consultorio', 'Protocolo que gera demanda no consultório', 'pratica', 'Oferta clara ao paciente a partir do domínio clínico.', 80)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  specialty = EXCLUDED.specialty,
  summary = EXCLUDED.summary,
  sort_order = EXCLUDED.sort_order,
  active = true;

COMMENT ON TABLE public.clinical_topics IS 'Catálogo de temas do Cérebro Doutiva (mapa clínico).';
COMMENT ON TABLE public.mastery_by_topic IS 'Memória longa por tema — Cartógrafo/Preceptor.';
COMMENT ON TABLE public.brain_sessions IS 'Sessões do cérebro (faces AI-first).';
