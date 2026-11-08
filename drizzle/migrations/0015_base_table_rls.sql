-- Versioned RLS for base tables created outside this repo's early migrations.
-- Idempotent: safe to re-run. Assumes tables already exist (Lovable Cloud baseline).
-- Principle: students read published content; own-row for progress; admin writes via has_role.

-- ---------- helpers ----------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin'::public.app_role)
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ---------- profiles ----------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles read authenticated" ON public.profiles;
DROP POLICY IF EXISTS "profiles update own" ON public.profiles;
CREATE POLICY "profiles read authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles update own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ---------- user_roles ----------
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "roles read own or admin" ON public.user_roles;
CREATE POLICY "roles read own or admin" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());
-- writes only via SECURITY DEFINER (claim_first_admin / owner trigger)

-- ---------- courses ----------
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "courses select published or admin" ON public.courses;
DROP POLICY IF EXISTS "courses admin write" ON public.courses;
CREATE POLICY "courses select published or admin" ON public.courses
  FOR SELECT TO authenticated
  USING (published = true OR public.is_admin());
CREATE POLICY "courses admin write" ON public.courses
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------- lessons ----------
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS lessons_select_published ON public.lessons;
DROP POLICY IF EXISTS lessons_select_authenticated ON public.lessons;
DROP POLICY IF EXISTS "lessons select published or admin" ON public.lessons;
DROP POLICY IF EXISTS "lessons admin write" ON public.lessons;
CREATE POLICY "lessons select published or admin" ON public.lessons
  FOR SELECT TO authenticated
  USING (status = 'published' OR public.is_admin());
CREATE POLICY "lessons admin write" ON public.lessons
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------- enrollments ----------
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "enrollments own" ON public.enrollments;
CREATE POLICY "enrollments own" ON public.enrollments
  FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- ---------- lesson_progress ----------
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lesson_progress own" ON public.lesson_progress;
CREATE POLICY "lesson_progress own" ON public.lesson_progress
  FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- ---------- user_progress (read own; writes via DEFINER RPCs only) ----------
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own progress read" ON public.user_progress;
DROP POLICY IF EXISTS "user_progress read own" ON public.user_progress;
CREATE POLICY "user_progress read own" ON public.user_progress
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());
REVOKE INSERT, UPDATE, DELETE ON TABLE public.user_progress FROM authenticated;
GRANT SELECT ON TABLE public.user_progress TO authenticated;

-- ---------- community ----------
ALTER TABLE public.community_spaces ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "spaces read" ON public.community_spaces;
DROP POLICY IF EXISTS "spaces admin write" ON public.community_spaces;
CREATE POLICY "spaces read" ON public.community_spaces
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "spaces admin write" ON public.community_spaces
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "posts read" ON public.community_posts;
DROP POLICY IF EXISTS "posts insert own" ON public.community_posts;
DROP POLICY IF EXISTS "posts update own" ON public.community_posts;
CREATE POLICY "posts read" ON public.community_posts
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "posts insert own" ON public.community_posts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts update own" ON public.community_posts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_admin());

ALTER TABLE public.community_replies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "replies read" ON public.community_replies;
DROP POLICY IF EXISTS "replies insert own" ON public.community_replies;
CREATE POLICY "replies read" ON public.community_replies
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "replies insert own" ON public.community_replies
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ---------- events ----------
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "events read published" ON public.events;
DROP POLICY IF EXISTS "events admin write" ON public.events;
CREATE POLICY "events read published" ON public.events
  FOR SELECT TO authenticated USING (published = true OR public.is_admin());
CREATE POLICY "events admin write" ON public.events
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "event_regs own" ON public.event_registrations;
CREATE POLICY "event_regs own" ON public.event_registrations
  FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- ---------- mentors ----------
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mentors read published" ON public.mentors;
DROP POLICY IF EXISTS "mentors admin write" ON public.mentors;
CREATE POLICY "mentors read published" ON public.mentors
  FOR SELECT TO authenticated USING (published = true OR public.is_admin());
CREATE POLICY "mentors admin write" ON public.mentors
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.mentor_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mentor_sessions own" ON public.mentor_sessions;
CREATE POLICY "mentor_sessions own" ON public.mentor_sessions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- ---------- marketplace catalog already partially covered; harden tools/ventures ----------
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tools read published" ON public.tools;
DROP POLICY IF EXISTS "tools admin write" ON public.tools;
CREATE POLICY "tools read published" ON public.tools
  FOR SELECT TO authenticated USING (published = true OR public.is_admin());
CREATE POLICY "tools admin write" ON public.tools
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.ventures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ventures read published" ON public.ventures;
DROP POLICY IF EXISTS "ventures admin write" ON public.ventures;
CREATE POLICY "ventures read published" ON public.ventures
  FOR SELECT TO authenticated USING (published = true OR public.is_admin());
CREATE POLICY "ventures admin write" ON public.ventures
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.venture_interests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "venture_interests own" ON public.venture_interests;
CREATE POLICY "venture_interests own" ON public.venture_interests
  FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

COMMENT ON FUNCTION public.is_admin() IS 'App-level admin check for RLS policies; wraps has_role.';
