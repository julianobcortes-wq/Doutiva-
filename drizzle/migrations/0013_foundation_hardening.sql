-- Foundation hardening (P0):
-- 1) Mastery scores only writable by service_role (server evaluate path)
-- 2) Restore claim_first_admin execute for authenticated (function still blocks demo + second admin)
-- 3) Document that clinical answer keys must not be trusted from the client

DROP POLICY IF EXISTS "own mastery insert" ON public.mastery_records;
REVOKE INSERT ON TABLE public.mastery_records FROM authenticated;
GRANT SELECT ON TABLE public.mastery_records TO authenticated;
GRANT ALL ON TABLE public.mastery_records TO service_role;

-- Keep own-row read
DROP POLICY IF EXISTS "own mastery read" ON public.mastery_records;
CREATE POLICY "own mastery read" ON public.mastery_records
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Bootstrap admin (first non-demo user) — revoked incorrectly for the StudioGate UX in 0011
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;

COMMENT ON TABLE public.mastery_records IS
  'Mastery scores are inserted only by the server evaluate path (service_role). Clients may SELECT own rows.';
