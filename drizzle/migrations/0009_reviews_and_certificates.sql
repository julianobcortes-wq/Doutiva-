CREATE TABLE public.review_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  case_key text NOT NULL,
  ease real NOT NULL DEFAULT 2.5,
  interval_days integer NOT NULL DEFAULT 0,
  reps integer NOT NULL DEFAULT 0,
  lapses integer NOT NULL DEFAULT 0,
  due_date date NOT NULL DEFAULT current_date,
  last_reviewed_at timestamptz,
  UNIQUE (user_id, case_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.review_cards TO authenticated;
GRANT ALL ON public.review_cards TO service_role;
ALTER TABLE public.review_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own review cards" ON public.review_cards FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE DEFAULT upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL,
  holder_name text NOT NULL,
  course_title text NOT NULL,
  hours numeric NOT NULL DEFAULT 0,
  issued_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
GRANT SELECT ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own certificates" ON public.certificates FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.issue_certificate(_course_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); total int; done int; c record; nm text; cert record;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT * INTO c FROM public.courses WHERE id = _course_id AND published;
  IF NOT FOUND THEN RAISE EXCEPTION 'curso não encontrado'; END IF;
  SELECT count(*) INTO total FROM public.lessons WHERE course_id = _course_id AND status = 'published';
  SELECT count(*) INTO done FROM public.lessons l JOIN public.lesson_progress p ON p.lesson_id = l.id AND p.user_id = uid
    WHERE l.course_id = _course_id AND l.status = 'published';
  IF total = 0 OR done < total THEN
    RETURN jsonb_build_object('issued', false, 'done', done, 'total', total);
  END IF;
  SELECT COALESCE(NULLIF(raw_user_meta_data->>'full_name',''), split_part(email,'@',1)) INTO nm FROM auth.users WHERE id = uid;
  INSERT INTO public.certificates(user_id, course_id, holder_name, course_title, hours)
  VALUES (uid, _course_id, nm, c.title,
    round(COALESCE((SELECT sum(duration_minutes) FROM public.lessons WHERE course_id = _course_id AND status='published'),0)/60.0, 1))
  ON CONFLICT (user_id, course_id) DO NOTHING;
  SELECT * INTO cert FROM public.certificates WHERE user_id = uid AND course_id = _course_id;
  RETURN jsonb_build_object('issued', true, 'code', cert.code);
END $$;
REVOKE ALL ON FUNCTION public.issue_certificate(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.issue_certificate(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.verify_certificate(_code text)
RETURNS TABLE(holder_name text, course_title text, hours numeric, issued_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT holder_name, course_title, hours, issued_at FROM public.certificates WHERE code = upper(trim(_code))
$$;
REVOKE ALL ON FUNCTION public.verify_certificate(text) FROM public;
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;