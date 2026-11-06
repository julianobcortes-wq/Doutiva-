-- Guided-session gamification: XP per beat, daily session goal, streak on session complete.

CREATE TABLE IF NOT EXISTS public.session_beat_awards (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  beat text NOT NULL CHECK (beat IN ('slides', 'keys', 'case', 'session')),
  xp integer NOT NULL DEFAULT 0 CHECK (xp >= 0),
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id, beat)
);

CREATE INDEX IF NOT EXISTS session_beat_awards_day_idx
  ON public.session_beat_awards (user_id, created_at);

ALTER TABLE public.session_beat_awards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own session beats read" ON public.session_beat_awards;
CREATE POLICY "own session beats read" ON public.session_beat_awards
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

GRANT SELECT ON public.session_beat_awards TO authenticated;
GRANT ALL ON public.session_beat_awards TO service_role;

COMMENT ON TABLE public.session_beat_awards IS
  'Anti-farm XP awards for guided lesson beats (slides/keys/case/session).';

CREATE OR REPLACE FUNCTION public.award_session_beat(
  _lesson_id uuid,
  _beat text,
  _correct boolean DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  today date := (now() AT TIME ZONE 'America/Sao_Paulo')::date;
  xp_amt int := 0;
  inserted boolean := false;
  p public.user_progress;
  sessions_today int := 0;
  goal int := 1;
  due_days int := NULL;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _beat NOT IN ('slides', 'keys', 'case', 'session') THEN
    RAISE EXCEPTION 'beat inválido';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.lessons WHERE id = _lesson_id) THEN
    RAISE EXCEPTION 'aula não encontrada';
  END IF;

  xp_amt := CASE _beat
    WHEN 'slides' THEN 5
    WHEN 'keys' THEN 5
    WHEN 'case' THEN CASE WHEN COALESCE(_correct, false) THEN 15 ELSE 5 END
    WHEN 'session' THEN 10
    ELSE 0
  END;

  INSERT INTO public.session_beat_awards(user_id, lesson_id, beat, xp, meta)
  VALUES (
    uid,
    _lesson_id,
    _beat,
    xp_amt,
    jsonb_build_object(
      'correct', _correct,
      'awarded_day', today
    )
  )
  ON CONFLICT DO NOTHING
  RETURNING true INTO inserted;

  inserted := COALESCE(inserted, false);

  IF inserted THEN
    INSERT INTO public.user_progress(user_id) VALUES (uid) ON CONFLICT DO NOTHING;
    UPDATE public.user_progress
      SET xp = xp + xp_amt,
          updated_at = now()
      WHERE user_id = uid;

    -- Completing a guided session advances daily streak (same rules as lesson/daily case).
    IF _beat = 'session' THEN
      UPDATE public.user_progress SET
        streak = CASE
          WHEN last_active_date = today THEN streak
          WHEN last_active_date = today - 1 THEN streak + 1
          ELSE 1
        END,
        last_active_date = today,
        updated_at = now()
      WHERE user_id = uid;
      UPDATE public.user_progress
        SET best_streak = GREATEST(best_streak, streak)
        WHERE user_id = uid;
    END IF;
  END IF;

  SELECT * INTO p FROM public.user_progress WHERE user_id = uid;

  SELECT count(*)::int INTO sessions_today
  FROM public.session_beat_awards
  WHERE user_id = uid
    AND beat = 'session'
    AND (created_at AT TIME ZONE 'America/Sao_Paulo')::date = today;

  IF _beat = 'case' THEN
    due_days := CASE WHEN COALESCE(_correct, false) THEN
      GREATEST(1, COALESCE(
        (SELECT interval_days FROM public.review_cards WHERE user_id = uid AND case_key = _lesson_id::text),
        1
      ))
    ELSE 1 END;
  END IF;

  RETURN jsonb_build_object(
    'awarded', inserted,
    'beat', _beat,
    'xp', CASE WHEN inserted THEN xp_amt ELSE 0 END,
    'xp_total', COALESCE(p.xp, 0),
    'credits', COALESCE(p.credits, 0),
    'streak', COALESCE(p.streak, 0),
    'sessions_today', sessions_today,
    'daily_goal', goal,
    'goal_met', sessions_today >= goal,
    'review_due_days', due_days
  );
END $$;

REVOKE ALL ON FUNCTION public.award_session_beat(uuid, text, boolean) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.award_session_beat(uuid, text, boolean) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_daily_session_goal()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  today date := (now() AT TIME ZONE 'America/Sao_Paulo')::date;
  sessions_today int := 0;
  goal int := 1;
  p public.user_progress;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT count(*)::int INTO sessions_today
  FROM public.session_beat_awards
  WHERE user_id = uid
    AND beat = 'session'
    AND (created_at AT TIME ZONE 'America/Sao_Paulo')::date = today;
  SELECT * INTO p FROM public.user_progress WHERE user_id = uid;
  RETURN jsonb_build_object(
    'sessions_today', sessions_today,
    'daily_goal', goal,
    'goal_met', sessions_today >= goal,
    'streak', COALESCE(p.streak, 0),
    'xp', COALESCE(p.xp, 0),
    'credits', COALESCE(p.credits, 0),
    'last_active_date', p.last_active_date
  );
END $$;

REVOKE ALL ON FUNCTION public.get_daily_session_goal() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_daily_session_goal() TO authenticated;
