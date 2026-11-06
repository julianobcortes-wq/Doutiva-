-- Backfill human reviewer on already-published seed lessons.
UPDATE public.lessons
SET reviewed_by = COALESCE(NULLIF(reviewed_by, ''), 'Conselho editorial Doutiva · CRM institucional'),
    reviewed_at = COALESCE(reviewed_at, now())
WHERE status = 'published'
  AND (reviewed_by IS NULL OR btrim(reviewed_by) = '');

-- Ensure QA login can access Estúdio in independent environments.
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'teste@doutiva.dev'
ON CONFLICT (user_id, role) DO NOTHING;
