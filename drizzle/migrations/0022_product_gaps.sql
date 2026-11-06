-- Product gaps: entitlements, plans, legal, daily challenge prefs, mentor ownership.

-- ---------- Marketplace fulfillment ----------
CREATE TABLE IF NOT EXISTS public.entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redemption_id uuid REFERENCES public.credit_redemptions(id) ON DELETE SET NULL,
  item_id uuid REFERENCES public.marketplace_items(id) ON DELETE SET NULL,
  kind text NOT NULL,
  title text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'used', 'expired', 'revoked')),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS entitlements_user_idx ON public.entitlements(user_id, created_at DESC);
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.entitlements TO authenticated;
GRANT ALL ON public.entitlements TO service_role;
DROP POLICY IF EXISTS "own entitlements read" ON public.entitlements;
CREATE POLICY "own entitlements read" ON public.entitlements
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.protocol_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  body_markdown text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.protocol_documents ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.protocol_documents TO authenticated;
GRANT ALL ON public.protocol_documents TO service_role;
DROP POLICY IF EXISTS "read active protocols" ON public.protocol_documents;
CREATE POLICY "read active protocols" ON public.protocol_documents
  FOR SELECT TO authenticated USING (active = true OR public.has_role(auth.uid(), 'admin'));

INSERT INTO public.protocol_documents(slug, title, body_markdown) VALUES
('incretina-consultorio', 'Protocolo clínico — incretina no consultório',
$$# Protocolo Doutiva — incretina no consultório

## Triagem
- IMC ≥ 30 ou ≥ 27 com comorbidade; ou DM2 elegível.
- Excluir gestação, MTC/MEN2 pessoal/familiar, pancreatite aguda ativa.

## Escolha
- Preferir tirzepatida quando perda ponderal máxima e acesso disponível.
- Preferir semaglutida quando desfecho CV (SELECT) ou renal (FLOW) for prioridade e o produto estiver registrado na indicação.

## Titulação (resumo)
- Semaglutida 2,4 mg: 0,25 → 0,5 → 1,0 → 1,7 → 2,4 mg/semana (mín. 4 semanas/dose).
- Tirzepatida: 2,5 → 5 → 7,5 → 10 → 12,5 → 15 mg/semana conforme tolerância.

## Monitoramento
- Peso, PA, sintomas GI; em DM2: HbA1c, glicemia; fundoscopia se DM; DEXA se risco de sarcopenia.

## Manutenção
- Tratamento crônico; retirada tipicamente implica reganho (STEP 4 / SURMOUNT-4).
$$)
ON CONFLICT (slug) DO NOTHING;

CREATE OR REPLACE FUNCTION public.redeem_item(_item_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  it public.marketplace_items;
  bal int;
  rid uuid;
  payload jsonb := '{}'::jsonb;
  ent_kind text;
  expires timestamptz := null;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT * INTO it FROM public.marketplace_items WHERE id = _item_id AND active FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'Item indisponível'); END IF;
  IF it.stock IS NOT NULL AND it.stock <= 0 THEN RETURN jsonb_build_object('ok', false, 'error', 'Esgotado'); END IF;
  INSERT INTO public.user_progress(user_id) VALUES (uid) ON CONFLICT DO NOTHING;
  SELECT credits INTO bal FROM public.user_progress WHERE user_id = uid FOR UPDATE;
  IF bal < it.price_credits THEN RETURN jsonb_build_object('ok', false, 'error', 'Créditos insuficientes'); END IF;
  UPDATE public.user_progress SET credits = credits - it.price_credits, updated_at = now() WHERE user_id = uid;
  IF it.stock IS NOT NULL THEN UPDATE public.marketplace_items SET stock = stock - 1 WHERE id = it.id; END IF;
  INSERT INTO public.credit_redemptions(user_id, item_id, price_credits)
  VALUES (uid, it.id, it.price_credits) RETURNING id INTO rid;

  ent_kind := lower(coalesce(it.kind, 'material'));
  IF ent_kind LIKE '%precept%' OR it.title ILIKE '%professor%ia%' THEN
    payload := jsonb_build_object('sessions', 1, 'route', '/professores');
    expires := now() + interval '90 days';
  ELSIF ent_kind LIKE '%material%' OR it.title ILIKE '%pdf%' OR it.title ILIKE '%protocolo%' THEN
    payload := jsonb_build_object(
      'document_slug', 'incretina-consultorio',
      'route', '/creditos'
    );
  ELSIF ent_kind LIKE '%evento%' OR it.title ILIKE '%masterclass%' THEN
    payload := jsonb_build_object('reservation', 'confirmed', 'event_label', it.title, 'route', '/events');
    expires := now() + interval '180 days';
  ELSIF ent_kind LIKE '%desconto%' OR it.title ILIKE '%desconto%' THEN
    payload := jsonb_build_object(
      'coupon_code', 'DOUTIVA10-' || upper(substr(replace(uid::text, '-', ''), 1, 6)),
      'percent_off', 10,
      'route', '/billing'
    );
    expires := now() + interval '365 days';
  ELSE
    payload := jsonb_build_object('note', 'Resgate registrado');
  END IF;

  INSERT INTO public.entitlements(user_id, redemption_id, item_id, kind, title, payload, expires_at)
  VALUES (uid, rid, it.id, ent_kind, it.title, payload, expires);

  RETURN jsonb_build_object('ok', true, 'credits', bal - it.price_credits, 'redemption_id', rid, 'fulfillment', payload);
END $$;
REVOKE ALL ON FUNCTION public.redeem_item(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.redeem_item(uuid) TO authenticated;

-- ---------- Subscriptions ----------
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  tagline text NOT NULL DEFAULT '',
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  interval text NOT NULL DEFAULT 'month' CHECK (interval IN ('month', 'year')),
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  highlighted boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0
);
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.subscription_plans TO authenticated, anon;
GRANT ALL ON public.subscription_plans TO service_role;
DROP POLICY IF EXISTS "plans public read" ON public.subscription_plans;
CREATE POLICY "plans public read" ON public.subscription_plans FOR SELECT TO authenticated, anon USING (active);

INSERT INTO public.subscription_plans(id, name, tagline, price_cents, interval, features, highlighted, sort_order) VALUES
('estudante', 'Doutiva Essencial', 'Caso do Dia, Universidade e Tutor IA.', 19700, 'month',
 '["Caso do Dia","Universidade","Tutor IA","Revisão espaçada"]'::jsonb, false, 1),
('pro', 'Doutiva Pro', 'Professores de IA ilimitados + marketplace acelerado.', 39700, 'month',
 '["Tudo do Essencial","Professores de IA","Marketplace","Certificados"]'::jsonb, true, 2),
('fundador', 'Membro Fundador', 'Acesso completo anual com prioridade editorial.', 239000, 'year',
 '["Tudo do Pro","Prioridade no Estúdio (mentor)","Masterclasses","Suporte prioritário"]'::jsonb, false, 3)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price_cents = EXCLUDED.price_cents, features = EXCLUDED.features, tagline = EXCLUDED.tagline;

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES public.subscription_plans(id),
  status text NOT NULL DEFAULT 'trialing'
    CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'pending_payment')),
  provider text NOT NULL DEFAULT 'manual',
  provider_ref text,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.user_subscriptions TO authenticated;
GRANT ALL ON public.user_subscriptions TO service_role;
DROP POLICY IF EXISTS "own subscription read" ON public.user_subscriptions;
CREATE POLICY "own subscription read" ON public.user_subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.select_plan(_plan_id text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); p public.subscription_plans; ends timestamptz;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT * INTO p FROM public.subscription_plans WHERE id = _plan_id AND active;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'Plano indisponível'); END IF;
  ends := CASE WHEN p.interval = 'year' THEN now() + interval '365 days' ELSE now() + interval '30 days' END;
  INSERT INTO public.user_subscriptions(user_id, plan_id, status, provider, current_period_end, updated_at)
  VALUES (uid, p.id, 'trialing', 'manual', ends, now())
  ON CONFLICT (user_id) DO UPDATE SET
    plan_id = EXCLUDED.plan_id,
    status = 'trialing',
    provider = 'manual',
    current_period_end = EXCLUDED.current_period_end,
    updated_at = now();
  RETURN jsonb_build_object('ok', true, 'plan_id', p.id, 'status', 'trialing', 'current_period_end', ends,
    'note', 'Período de cortesia ativado. Gateway de pagamento (Stripe) liga-se quando STRIPE_SECRET_KEY estiver configurada.');
END $$;
REVOKE ALL ON FUNCTION public.select_plan(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.select_plan(text) TO authenticated;

-- ---------- Legal acceptances ----------
CREATE TABLE IF NOT EXISTS public.legal_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doc text NOT NULL CHECK (doc IN ('terms', 'privacy', 'ai_policy')),
  version text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, doc, version)
);
ALTER TABLE public.legal_acceptances ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.legal_acceptances TO authenticated;
GRANT ALL ON public.legal_acceptances TO service_role;
DROP POLICY IF EXISTS "own legal read" ON public.legal_acceptances;
DROP POLICY IF EXISTS "own legal insert" ON public.legal_acceptances;
CREATE POLICY "own legal read" ON public.legal_acceptances FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own legal insert" ON public.legal_acceptances FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ---------- Daily challenge prefs ----------
CREATE TABLE IF NOT EXISTS public.notification_prefs (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_case_email boolean NOT NULL DEFAULT true,
  email text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notification_prefs ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.notification_prefs TO authenticated;
GRANT ALL ON public.notification_prefs TO service_role;
DROP POLICY IF EXISTS "own prefs" ON public.notification_prefs;
CREATE POLICY "own prefs" ON public.notification_prefs FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.daily_challenge_dispatch (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_key text NOT NULL,
  channel text NOT NULL DEFAULT 'email',
  status text NOT NULL DEFAULT 'queued',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.daily_challenge_dispatch ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.daily_challenge_dispatch TO authenticated;
GRANT ALL ON public.daily_challenge_dispatch TO service_role;
DROP POLICY IF EXISTS "own dispatch read" ON public.daily_challenge_dispatch;
CREATE POLICY "own dispatch read" ON public.daily_challenge_dispatch
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- ---------- Mentor ownership + session workflow ----------
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.mentor_sessions ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;
ALTER TABLE public.mentor_sessions ADD COLUMN IF NOT EXISTS mentor_notes text;
ALTER TABLE public.mentor_sessions ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DROP POLICY IF EXISTS "mentor_sessions own" ON public.mentor_sessions;
CREATE POLICY "mentor_sessions participant" ON public.mentor_sessions
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.mentors m
      WHERE m.id = mentor_sessions.mentor_id AND m.owner_user_id = auth.uid()
    )
  );
CREATE POLICY "mentor_sessions student insert" ON public.mentor_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "mentor_sessions mentor update" ON public.mentor_sessions
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.mentors m
      WHERE m.id = mentor_sessions.mentor_id AND m.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.mentors m
      WHERE m.id = mentor_sessions.mentor_id AND m.owner_user_id = auth.uid()
    )
  );

-- Link seeded mentors to QA admin when present
UPDATE public.mentors m
SET owner_user_id = u.id
FROM auth.users u
WHERE u.email = 'teste@doutiva.dev' AND m.owner_user_id IS NULL;

-- ---------- CRM verification workflow ----------
ALTER TABLE public.mentor_credentials ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.mentor_credentials ADD COLUMN IF NOT EXISTS review_notes text;
UPDATE public.mentor_credentials SET status = CASE WHEN verified THEN 'verified' ELSE 'pending' END
WHERE status IS NULL OR status = 'pending';

CREATE OR REPLACE FUNCTION public.verify_mentor_credentials(_user_id uuid, _approve boolean, _notes text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Apenas admin');
  END IF;
  UPDATE public.mentor_credentials
  SET verified = _approve,
      status = CASE WHEN _approve THEN 'verified' ELSE 'rejected' END,
      review_notes = _notes,
      updated_at = now()
  WHERE user_id = _user_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'Credencial não encontrada'); END IF;
  RETURN jsonb_build_object('ok', true, 'verified', _approve);
END $$;
REVOKE ALL ON FUNCTION public.verify_mentor_credentials(uuid, boolean, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.verify_mentor_credentials(uuid, boolean, text) TO authenticated;

-- Mentor video URLs: set per lesson in Estúdio (video_url). No placeholder embeds.