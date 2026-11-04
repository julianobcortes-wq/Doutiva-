CREATE OR REPLACE FUNCTION public.grant_owner_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND lower(NEW.email) = 'juliano@jubex.com.br' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.grant_owner_admin() FROM public, anon, authenticated;

CREATE TRIGGER on_auth_user_created_owner_admin
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.grant_owner_admin();

CREATE TRIGGER on_auth_user_confirmed_owner_admin
AFTER UPDATE OF email_confirmed_at ON auth.users FOR EACH ROW
WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
EXECUTE FUNCTION public.grant_owner_admin();