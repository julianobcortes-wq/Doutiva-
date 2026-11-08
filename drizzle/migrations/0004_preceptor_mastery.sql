CREATE TABLE public.mastery_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL,
  persona text NOT NULL,
  score integer NOT NULL CHECK (score BETWEEN 0 AND 100),
  dimensions jsonb NOT NULL DEFAULT '{}'::jsonb,
  strengths text[] NOT NULL DEFAULT '{}',
  gaps text[] NOT NULL DEFAULT '{}',
  next_step text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX mastery_records_user_idx ON public.mastery_records(user_id, created_at DESC);
GRANT SELECT, INSERT ON public.mastery_records TO authenticated;
GRANT ALL ON public.mastery_records TO service_role;
ALTER TABLE public.mastery_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own mastery read" ON public.mastery_records FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own mastery insert" ON public.mastery_records FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);