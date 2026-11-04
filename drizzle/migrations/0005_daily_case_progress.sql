CREATE TABLE public.user_progress (
  user_id uuid PRIMARY KEY,
  xp integer NOT NULL DEFAULT 0,
  credits integer NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 0,
  best_streak integer NOT NULL DEFAULT 0,
  last_active_date date,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.user_progress TO authenticated;
GRANT ALL ON public.user_progress TO service_role;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own progress read" ON public.user_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.daily_case_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  case_date date NOT NULL,
  case_key text NOT NULL,
  correct boolean NOT NULL,
  xp_awarded integer NOT NULL,
  credits_awarded integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, case_date)
);
GRANT SELECT ON public.daily_case_attempts TO authenticated;
GRANT ALL ON public.daily_case_attempts TO service_role;
ALTER TABLE public.daily_case_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own attempts read" ON public.daily_case_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.submit_daily_case(_case_key text, _correct boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  today date := (now() AT TIME ZONE 'America/Sao_Paulo')::date;
  gx int := CASE WHEN _correct THEN 50 ELSE 10 END;
  gc int := CASE WHEN _correct THEN 5 ELSE 1 END;
  inserted boolean := false;
  p public.user_progress;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  INSERT INTO public.daily_case_attempts(user_id, case_date, case_key, correct, xp_awarded, credits_awarded)
  VALUES (uid, today, _case_key, _correct, gx, gc)
  ON CONFLICT (user_id, case_date) DO NOTHING;
  inserted := FOUND;
  INSERT INTO public.user_progress(user_id) VALUES (uid) ON CONFLICT DO NOTHING;
  IF inserted THEN
    UPDATE public.user_progress SET
      xp = xp + gx,
      credits = credits + gc,
      streak = CASE WHEN last_active_date = today THEN streak
                    WHEN last_active_date = today - 1 THEN streak + 1 ELSE 1 END,
      last_active_date = today,
      updated_at = now()
    WHERE user_id = uid;
    UPDATE public.user_progress SET best_streak = GREATEST(best_streak, streak) WHERE user_id = uid;
  END IF;
  SELECT * INTO p FROM public.user_progress WHERE user_id = uid;
  RETURN jsonb_build_object('awarded', inserted, 'xp_awarded', CASE WHEN inserted THEN gx ELSE 0 END,
    'credits_awarded', CASE WHEN inserted THEN gc ELSE 0 END,
    'xp', p.xp, 'credits', p.credits, 'streak', p.streak);
END $$;
REVOKE ALL ON FUNCTION public.submit_daily_case(text, boolean) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.submit_daily_case(text, boolean) TO authenticated;