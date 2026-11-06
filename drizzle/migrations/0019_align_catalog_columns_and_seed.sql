-- Align catalog tables with TypeScript/app selects + seed demo content.
-- Greenfield 0016 omitted several columns the Lovable cloud schema had.

ALTER TABLE public.mentors
  ADD COLUMN IF NOT EXISTS rating numeric NOT NULL DEFAULT 5.0,
  ADD COLUMN IF NOT EXISTS sessions_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.community_spaces
  ADD COLUMN IF NOT EXISTS specialty text;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS subtitle text,
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'aula',
  ADD COLUMN IF NOT EXISTS capacity integer,
  ADD COLUMN IF NOT EXISTS price_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;

ALTER TABLE public.ventures
  ADD COLUMN IF NOT EXISTS sector text,
  ADD COLUMN IF NOT EXISTS stage text,
  ADD COLUMN IF NOT EXISTS kind text,
  ADD COLUMN IF NOT EXISTS raise_target_cents integer,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'open';

-- Demo mentors
INSERT INTO public.mentors (slug, name, title, specialty, location, bio, hourly_rate_cents, rating, sessions_count, featured, published)
VALUES
  (
    'ana-figueiredo-endocrino',
    'Dra. Ana Figueiredo',
    'Endocrinologista · Médica Mentora Doutiva',
    'Endocrinologia',
    'São Paulo, SP',
    'Mentoria em incretinas, obesidade e protocolos de consultório com evidência.',
    45000, 4.9, 128, true, true
  ),
  (
    'rafael-moura-clinica',
    'Dr. Rafael Moura',
    'Clínico geral · Medicina de precisão',
    'Clínica Médica',
    'Curitiba, PR',
    'Casos difíceis de consultório, leitura crítica de trials e carreira médica.',
    35000, 4.8, 76, true, true
  )
ON CONFLICT (slug) DO UPDATE SET
  published = EXCLUDED.published,
  featured = EXCLUDED.featured,
  rating = EXCLUDED.rating,
  sessions_count = EXCLUDED.sessions_count,
  bio = EXCLUDED.bio;

-- Demo community spaces
INSERT INTO public.community_spaces (slug, name, specialty, description, featured, published, members_count)
VALUES
  (
    'incretinas-consultorio',
    'Incretinas no consultório',
    'Endocrinologia',
    'Discussão de condutas, interações e casos reais com GLP-1/GIP.',
    true, true, 42
  ),
  (
    'carreira-medica',
    'Carreira e autoridade médica',
    'Carreira',
    'Posicionamento, preceptoria e construção de reputação clínica.',
    false, true, 28
  )
ON CONFLICT (slug) DO UPDATE SET
  published = true,
  specialty = EXCLUDED.specialty,
  description = EXCLUDED.description,
  members_count = EXCLUDED.members_count;

-- Demo events (next 14 days)
INSERT INTO public.events (slug, title, subtitle, description, kind, location, starts_at, ends_at, capacity, price_cents, featured, published)
VALUES
  (
    'masterclass-glp1-2026',
    'Masterclass GLP-1: do trial ao consultório',
    'Aula magna com corpo docente Doutiva',
    'Leitura de desfechos cardiorrenais, titulação prática e erros comuns de prescrição.',
    'masterclass',
    'Online · Zoom Doutiva',
    (now() AT TIME ZONE 'America/Sao_Paulo' + interval '5 days')::timestamptz,
    (now() AT TIME ZONE 'America/Sao_Paulo' + interval '5 days' + interval '90 minutes')::timestamptz,
    200, 0, true, true
  ),
  (
    'plantao-casos-obesidade',
    'Plantão de casos: obesidade e SOP',
    'Discussão ao vivo com mentores',
    'Traga seu caso (anonimizado). Conduta, evidência e follow-up.',
    'plantao',
    'Online',
    (now() AT TIME ZONE 'America/Sao_Paulo' + interval '10 days')::timestamptz,
    (now() AT TIME ZONE 'America/Sao_Paulo' + interval '10 days' + interval '60 minutes')::timestamptz,
    80, 0, false, true
  )
ON CONFLICT (slug) DO UPDATE SET
  published = true,
  featured = EXCLUDED.featured,
  subtitle = EXCLUDED.subtitle,
  kind = EXCLUDED.kind,
  starts_at = EXCLUDED.starts_at,
  ends_at = EXCLUDED.ends_at;
