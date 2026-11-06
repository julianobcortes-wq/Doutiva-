-- Bridge for hosts that do not yet inject SUPABASE_SERVICE_ROLE_KEY into the app.
-- Re-enable the auth.uid()-scoped submit_daily_case so the Node server function
-- (after grading) can award XP/streak/credits without the service role.
--
-- Prefer award_daily_case via service_role in production (see 0006). When the
-- service role is present, the app calls award_daily_case and never needs this grant.
--
-- Apply in the Supabase SQL editor if the Cloud Agent cannot run migrations.

GRANT EXECUTE ON FUNCTION public.submit_daily_case(text, boolean) TO authenticated;

COMMENT ON FUNCTION public.submit_daily_case(text, boolean) IS
  'Auth-scoped daily case award. Preferred caller: server fn after grading. Prefer award_daily_case + service_role when available.';
