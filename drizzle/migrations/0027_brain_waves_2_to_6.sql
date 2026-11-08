-- Ondas 2–6: fila pessoal, universidade adaptativa, gaps/estúdio vivo,
-- marketplace de mentores parceiros, WhatsApp.

-- ---------- Onda 2/3: lesson ↔ topic ----------
CREATE TABLE IF NOT EXISTS public.lesson_topics (
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  topic_id uuid NOT NULL REFERENCES public.clinical_topics(id) ON DELETE CASCADE,
  weight numeric(4,2) NOT NULL DEFAULT 1.0,
  PRIMARY KEY (lesson_id, topic_id)
);
CREATE INDEX IF NOT EXISTS lesson_topics_topic_idx ON public.lesson_topics(topic_id);
ALTER TABLE public.lesson_topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lesson_topics read" ON public.lesson_topics;
CREATE POLICY "lesson_topics read" ON public.lesson_topics
  FOR SELECT TO authenticated USING (true);
GRANT SELECT ON public.lesson_topics TO authenticated;
GRANT ALL ON public.lesson_topics TO service_role;

-- Heuristic seed: map published lessons to topics by title/module keywords
INSERT INTO public.lesson_topics (lesson_id, topic_id, weight)
SELECT l.id, t.id, 1.0
FROM public.lessons l
CROSS JOIN public.clinical_topics t
WHERE l.status = 'published'
  AND (
    (t.slug LIKE 'incretinas%' AND (l.title ILIKE '%incretin%' OR l.title ILIKE '%semaglut%' OR l.title ILIKE '%tirzepat%' OR l.title ILIKE '%GLP%' OR l.module_title ILIKE '%incretin%' OR l.module_title ILIKE '%protocolo%'))
    OR (t.slug = 'eixo-gh-secretagogos' AND (l.title ILIKE '%GH%' OR l.title ILIKE '%tesamorel%' OR l.title ILIKE '%secretagog%' OR l.module_title ILIKE '%GH%'))
    OR (t.slug = 'reparo-bpc-tb500' AND (l.title ILIKE '%BPC%' OR l.title ILIKE '%TB-500%' OR l.title ILIKE '%reparo%' OR l.module_title ILIKE '%reparo%'))
    OR (t.slug = 'regulacao-anvisa-cfm' AND (l.title ILIKE '%regula%' OR l.title ILIKE '%ANVISA%' OR l.title ILIKE '%CFM%' OR l.title ILIKE '%WADA%' OR l.module_title ILIKE '%ética%' OR l.module_title ILIKE '%regula%'))
    OR (t.slug = 'composicao-corporal' AND (l.title ILIKE '%massa%' OR l.title ILIKE '%músculo%' OR l.title ILIKE '%composi%' OR l.title ILIKE '%segurança%'))
    OR (t.slug = 'demanda-consultorio' AND (l.title ILIKE '%consultório%' OR l.title ILIKE '%demanda%' OR l.title ILIKE '%vendável%' OR l.module_title ILIKE '%prática%'))
  )
ON CONFLICT DO NOTHING;

-- Personal daily case attempts (map-driven key already string; add confidence)
ALTER TABLE public.daily_case_attempts
  ADD COLUMN IF NOT EXISTS confidence text
    CHECK (confidence IS NULL OR confidence IN ('sei', 'acho', 'nao_sei'));
ALTER TABLE public.daily_case_attempts
  ADD COLUMN IF NOT EXISTS topic_id uuid REFERENCES public.clinical_topics(id) ON DELETE SET NULL;

-- ---------- Onda 4: content gaps / living studio ----------
CREATE TABLE IF NOT EXISTS public.content_gaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES public.clinical_topics(id) ON DELETE CASCADE,
  demand_count integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'drafting', 'in_review', 'published', 'rejected')),
  draft_lesson_id uuid REFERENCES public.lessons(id) ON DELETE SET NULL,
  published_lesson_id uuid REFERENCES public.lessons(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS content_gaps_open_topic_uidx
  ON public.content_gaps (topic_id) WHERE status IN ('open', 'drafting', 'in_review');
CREATE INDEX IF NOT EXISTS content_gaps_status_idx ON public.content_gaps(status, updated_at DESC);
ALTER TABLE public.content_gaps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "content_gaps admin" ON public.content_gaps;
CREATE POLICY "content_gaps admin" ON public.content_gaps
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
GRANT SELECT ON public.content_gaps TO authenticated;
GRANT ALL ON public.content_gaps TO service_role;

CREATE TABLE IF NOT EXISTS public.lesson_origins (
  lesson_id uuid PRIMARY KEY REFERENCES public.lessons(id) ON DELETE CASCADE,
  source text NOT NULL DEFAULT 'ai_gap'
    CHECK (source IN ('ai_gap', 'ai_from_upload', 'mentor_material', 'human')),
  gap_id uuid REFERENCES public.content_gaps(id) ON DELETE SET NULL,
  created_for_user uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lesson_origins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lesson_origins admin" ON public.lesson_origins;
CREATE POLICY "lesson_origins admin" ON public.lesson_origins
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
GRANT SELECT ON public.lesson_origins TO authenticated;
GRANT ALL ON public.lesson_origins TO service_role;

-- ---------- Onda 5: mentor partner marketplace ----------
CREATE TABLE IF NOT EXISTS public.mentor_offerings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('session', 'course')),
  title text NOT NULL,
  description text,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  currency text NOT NULL DEFAULT 'brl',
  duration_minutes integer,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  take_rate_bps integer NOT NULL DEFAULT 2000 CHECK (take_rate_bps BETWEEN 0 AND 10000),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS mentor_offerings_mentor_idx ON public.mentor_offerings(mentor_id, active);
ALTER TABLE public.mentor_offerings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "offerings public read" ON public.mentor_offerings;
CREATE POLICY "offerings public read" ON public.mentor_offerings
  FOR SELECT TO authenticated USING (active = true OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "offerings admin write" ON public.mentor_offerings;
CREATE POLICY "offerings admin write" ON public.mentor_offerings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
GRANT SELECT ON public.mentor_offerings TO authenticated;
GRANT ALL ON public.mentor_offerings TO service_role;

CREATE TABLE IF NOT EXISTS public.mentor_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_id uuid NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  offering_id uuid NOT NULL REFERENCES public.mentor_offerings(id) ON DELETE RESTRICT,
  amount_cents integer NOT NULL,
  take_rate_bps integer NOT NULL,
  platform_fee_cents integer NOT NULL,
  mentor_net_cents integer NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'refunded', 'cancelled')),
  stripe_session_id text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);
CREATE INDEX IF NOT EXISTS mentor_purchases_user_idx ON public.mentor_purchases(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS mentor_purchases_mentor_idx ON public.mentor_purchases(mentor_id, status);
ALTER TABLE public.mentor_purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "purchases own read" ON public.mentor_purchases;
CREATE POLICY "purchases own read" ON public.mentor_purchases
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.mentors m
      WHERE m.id = mentor_purchases.mentor_id AND m.owner_user_id = auth.uid()
    )
  );
GRANT SELECT ON public.mentor_purchases TO authenticated;
GRANT ALL ON public.mentor_purchases TO service_role;

-- Courtesy purchase when Stripe absent (service_role / admin RPC)
CREATE OR REPLACE FUNCTION public.complete_mentor_purchase_courtesy(
  _offering_id uuid,
  _user_id uuid DEFAULT auth.uid()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  off public.mentor_offerings;
  fee int;
  net int;
  pid uuid;
BEGIN
  IF _user_id IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT * INTO off FROM public.mentor_offerings WHERE id = _offering_id AND active FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'Oferta indisponível'); END IF;
  fee := ROUND(off.price_cents * off.take_rate_bps / 10000.0)::int;
  net := off.price_cents - fee;
  INSERT INTO public.mentor_purchases(
    user_id, mentor_id, offering_id, amount_cents, take_rate_bps,
    platform_fee_cents, mentor_net_cents, status, paid_at, meta
  ) VALUES (
    _user_id, off.mentor_id, off.id, off.price_cents, off.take_rate_bps,
    fee, net, 'paid', now(), jsonb_build_object('channel', 'courtesy')
  ) RETURNING id INTO pid;
  RETURN jsonb_build_object(
    'ok', true,
    'purchase_id', pid,
    'amount_cents', off.price_cents,
    'platform_fee_cents', fee,
    'mentor_net_cents', net,
    'take_rate_bps', off.take_rate_bps
  );
END;
$$;
REVOKE ALL ON FUNCTION public.complete_mentor_purchase_courtesy FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_mentor_purchase_courtesy TO authenticated, service_role;

-- ---------- Onda 6: WhatsApp prefs / dispatch ----------
ALTER TABLE public.notification_prefs
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in boolean NOT NULL DEFAULT false;
ALTER TABLE public.notification_prefs
  ADD COLUMN IF NOT EXISTS whatsapp_e164 text;

ALTER TABLE public.daily_challenge_dispatch
  DROP CONSTRAINT IF EXISTS daily_challenge_dispatch_channel_check;
-- channel already text in most schemas; ensure whatsapp allowed by not constraining tightly

COMMENT ON TABLE public.content_gaps IS 'Fila recuperar-ou-criar do Cérebro Doutiva.';
COMMENT ON TABLE public.mentor_offerings IS 'Ofertas de mentores parceiros (sessão ou curso).';
COMMENT ON TABLE public.mentor_purchases IS 'Vendas com take rate Doutiva.';
