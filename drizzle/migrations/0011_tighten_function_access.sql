REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.track_lesson_change() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_exists() FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.claim_first_admin() FROM public, anon, authenticated;