-- 1) Admin is granted only by operators (service_role / SQL), never self-claimed.
REVOKE EXECUTE ON FUNCTION public.claim_first_admin() FROM public, anon, authenticated;
DROP FUNCTION IF EXISTS public.claim_first_admin();

-- 2) Per-user quota for paid AI routes (tutor, preceptor, cartographer).
CREATE TABLE IF NOT EXISTS public.ai_request_log (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bucket text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ai_request_log_user_bucket_time
  ON public.ai_request_log (user_id, bucket, created_at DESC);
ALTER TABLE public.ai_request_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.ai_request_log FROM public, anon, authenticated;
GRANT ALL ON TABLE public.ai_request_log TO service_role;

-- Limits live here, not in the caller, so a direct RPC call cannot raise them.
CREATE OR REPLACE FUNCTION public.consume_ai_quota(_bucket text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _per_minute int;
  _per_day int;
  _n_minute int;
  _n_day int;
BEGIN
  IF _uid IS NULL THEN RETURN false; END IF;
  CASE _bucket
    WHEN 'tutor' THEN _per_minute := 8; _per_day := 150;
    WHEN 'preceptor' THEN _per_minute := 8; _per_day := 120;
    WHEN 'cartographer' THEN _per_minute := 8; _per_day := 120;
    ELSE RETURN false;
  END CASE;

  PERFORM pg_advisory_xact_lock(hashtext(_uid::text || ':' || _bucket));

  SELECT count(*) FILTER (WHERE created_at > now() - interval '1 minute'), count(*)
    INTO _n_minute, _n_day
    FROM public.ai_request_log
   WHERE user_id = _uid AND bucket = _bucket AND created_at > now() - interval '1 day';

  IF _n_minute >= _per_minute OR _n_day >= _per_day THEN RETURN false; END IF;

  INSERT INTO public.ai_request_log (user_id, bucket) VALUES (_uid, _bucket);
  DELETE FROM public.ai_request_log
   WHERE user_id = _uid AND bucket = _bucket AND created_at < now() - interval '2 days';
  RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.consume_ai_quota(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.consume_ai_quota(text) TO authenticated;
