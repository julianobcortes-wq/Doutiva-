-- Doutiva curriculum v3: six premium courses (stubs; content via deepen scripts).
-- Slugs:
--   tirzepatida-incretinas-consultorio
--   hormonios-implantes-criterio
--   soroterapia-injetaveis-estereis
--   obesidade-precisao-consultorio
--   sarcopenia-composicao-performance
--   ia-pratica-medica

-- Courses are upserted by scripts/bootstrap-doutiva-courses-v3.mjs against live Supabase.
-- This migration documents the catalog for reproducible environments.

COMMENT ON TABLE public.courses IS 'Doutiva courses — v3 catalog adds 6 premium clinical tracks alongside peptideos-medicina-de-precisao';
