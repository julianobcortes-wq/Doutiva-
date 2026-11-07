CREATE OR REPLACE FUNCTION public.award_daily_case(_user_id uuid, _case_key text, _correct boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := _user_id;
  today date := (now() AT TIME ZONE 'America/Sao_Paulo')::date;
  gx int := CASE WHEN _correct THEN 50 ELSE 10 END;
  gc int := CASE WHEN _correct THEN 5 ELSE 1 END;
  inserted boolean := false;
  p public.user_progress;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'missing user'; END IF;
  INSERT INTO public.daily_case_attempts(user_id, case_date, case_key, correct, xp_awarded, credits_awarded)
  VALUES (uid, today, _case_key, _correct, gx, gc)
  ON CONFLICT (user_id, case_date) DO NOTHING;
  inserted := FOUND;
  INSERT INTO public.user_progress(user_id) VALUES (uid) ON CONFLICT DO NOTHING;
  IF inserted THEN
    UPDATE public.user_progress SET
      xp = xp + gx, credits = credits + gc,
      streak = CASE WHEN last_active_date = today THEN streak
                    WHEN last_active_date = today - 1 THEN streak + 1 ELSE 1 END,
      last_active_date = today, updated_at = now()
    WHERE user_id = uid;
    UPDATE public.user_progress SET best_streak = GREATEST(best_streak, streak) WHERE user_id = uid;
  END IF;
  SELECT * INTO p FROM public.user_progress WHERE user_id = uid;
  RETURN jsonb_build_object('awarded', inserted, 'correct', _correct,
    'xp_awarded', CASE WHEN inserted THEN gx ELSE 0 END,
    'credits_awarded', CASE WHEN inserted THEN gc ELSE 0 END,
    'xp', p.xp, 'credits', p.credits, 'streak', p.streak);
END $$;
REVOKE ALL ON FUNCTION public.award_daily_case(uuid, text, boolean) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.award_daily_case(uuid, text, boolean) TO service_role;
REVOKE EXECUTE ON FUNCTION public.submit_daily_case(text, boolean) FROM authenticated;
COMMENT ON FUNCTION public.submit_daily_case(text, boolean) IS 'DEPRECATED: replaced by award_daily_case via server-side answer check';