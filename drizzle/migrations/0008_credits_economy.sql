CREATE TABLE public.marketplace_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  kind text NOT NULL DEFAULT 'material',
  price_credits integer NOT NULL CHECK (price_credits > 0),
  stock integer,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.marketplace_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.marketplace_items TO authenticated;
GRANT ALL ON public.marketplace_items TO service_role;
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read active items" ON public.marketplace_items FOR SELECT TO authenticated USING (active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin manage items" ON public.marketplace_items FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.credit_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_id uuid NOT NULL REFERENCES public.marketplace_items(id),
  price_credits integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.credit_redemptions TO authenticated;
GRANT ALL ON public.credit_redemptions TO service_role;
ALTER TABLE public.credit_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own redemptions" ON public.credit_redemptions FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.redeem_item(_item_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); it public.marketplace_items; bal int;
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
  INSERT INTO public.credit_redemptions(user_id, item_id, price_credits) VALUES (uid, it.id, it.price_credits);
  RETURN jsonb_build_object('ok', true, 'credits', bal - it.price_credits);
END $$;
REVOKE ALL ON FUNCTION public.redeem_item(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.redeem_item(uuid) TO authenticated;

CREATE TABLE public.lesson_rewards (
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);
GRANT SELECT ON public.lesson_rewards TO authenticated;
GRANT ALL ON public.lesson_rewards TO service_role;
ALTER TABLE public.lesson_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own lesson rewards" ON public.lesson_rewards FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.award_lesson(_lesson_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); today date := (now() AT TIME ZONE 'America/Sao_Paulo')::date;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.lesson_progress WHERE user_id = uid AND lesson_id = _lesson_id) THEN
    RETURN jsonb_build_object('awarded', false);
  END IF;
  INSERT INTO public.lesson_rewards(user_id, lesson_id) VALUES (uid, _lesson_id) ON CONFLICT DO NOTHING;
  IF NOT FOUND THEN RETURN jsonb_build_object('awarded', false); END IF;
  INSERT INTO public.user_progress(user_id) VALUES (uid) ON CONFLICT DO NOTHING;
  UPDATE public.user_progress SET xp = xp + 30, credits = credits + 2,
    streak = CASE WHEN last_active_date = today THEN streak WHEN last_active_date = today - 1 THEN streak + 1 ELSE 1 END,
    last_active_date = today, updated_at = now() WHERE user_id = uid;
  UPDATE public.user_progress SET best_streak = GREATEST(best_streak, streak) WHERE user_id = uid;
  RETURN jsonb_build_object('awarded', true, 'xp', 30, 'credits', 2);
END $$;
REVOKE ALL ON FUNCTION public.award_lesson(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.award_lesson(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE(rank bigint, name text, xp integer, streak integer, is_me boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT row_number() OVER (ORDER BY p.xp DESC, p.updated_at), 
    COALESCE(NULLIF(u.raw_user_meta_data->>'full_name',''), split_part(u.email,'@',1)),
    p.xp, p.streak, p.user_id = auth.uid()
  FROM public.user_progress p JOIN auth.users u ON u.id = p.user_id
  WHERE p.xp > 0 ORDER BY p.xp DESC, p.updated_at LIMIT 50
$$;
REVOKE ALL ON FUNCTION public.get_leaderboard() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard() TO authenticated;

INSERT INTO public.marketplace_items(title, description, kind, price_credits) VALUES
('Sessão extra com Professor IA', 'Uma sabatina adicional com nota de domínio registrada.', 'preceptoria', 10),
('Protocolo clínico em PDF', 'Guia de conduta revisado por Médico Mentor.', 'material', 20),
('Masterclass fechada', 'Acesso à próxima masterclass ao vivo com mentor convidado.', 'evento', 60),
('10% de desconto na assinatura', 'Cupom aplicado na próxima renovação.', 'desconto', 100);