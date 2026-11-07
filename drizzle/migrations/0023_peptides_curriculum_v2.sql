-- Peptídeos curriculum v2: expand to 15 lessons (stubs; content filled by deepen script).
-- Idempotent inserts for positions 10–15 on course peptideos-medicina-de-precisao.

DO $$
DECLARE
  cid uuid;
BEGIN
  SELECT id INTO cid FROM public.courses WHERE slug = 'peptideos-medicina-de-precisao';
  IF cid IS NULL THEN
    RAISE NOTICE 'course peptideos-medicina-de-precisao missing — skip';
    RETURN;
  END IF;

  UPDATE public.courses SET
    subtitle = 'Tratado clínico completo · 15 aulas · monografias + slides + casos',
    description = 'Quinze aulas em profundidade de tratado (~20h): farmacologia molecular, regulatório ANVISA/CFM/WADA, fisiologia GLP-1/GIP, ECRs STEP/SURMOUNT/SELECT/FLOW, segurança e massa magra, secretagogos de GH, regenerativos (ciência vs hype), protocolo de consultório, casos integrados, fronteira dual/triplo/orais, organoproteção, sarcopenia, populações especiais, armamentário peptídico ampliado e excelência operacional da clínica. Cada aula: monografia densa, 8–12 slides com dados, guia de bolso e caso clínico com gabarito server-side.',
    duration_minutes = GREATEST(duration_minutes, 1200),
    featured = true,
    published = true,
    updated_at = now()
  WHERE id = cid;

  INSERT INTO public.lessons (
    course_id, position, module_position, module_title, title, description,
    duration_minutes, evidence_level, status, content, key_points, refs
  )
  SELECT cid, v.position, v.module_position, v.module_title, v.title, v.description,
         v.duration_minutes, v.evidence_level, 'draft',
         '# Stub — conteúdo gerado pelo deepen', ARRAY[]::text[], '[]'::jsonb
  FROM (VALUES
    (10, 6, 'Módulo 6 · Fronteira terapêutica',
     'Agonistas dual/triplo e incretinas orais: retatrutida, CagriSema, survodutida, orforglipron',
     'Leitura crítica da fronteira 2024–2026: triplo agonismo, coagonismo amilina e orais.',
     90, 'Nível A–B'),
    (11, 6, 'Módulo 6 · Fronteira terapêutica',
     'Organoproteção além do peso: SELECT, FLOW, HFpEF, AOS, MASLD/MASH e desfechos duros',
     'Traduzir desfechos cardiovasculares, renais, hepáticos e respiratórios em seleção clínica.',
     90, 'Nível A'),
    (12, 7, 'Módulo 7 · Composição corporal e populações especiais',
     'Sarcopenia iatrogênica, massa magra, DEXA, proteína e treino sob incretina',
     'Mitigação de perda de massa magra e comunicação honesta sobre composição corporal.',
     75, 'Nível B'),
    (13, 7, 'Módulo 7 · Composição corporal e populações especiais',
     'Populações especiais: gestação/contracepção, adolescente, idoso, DRC avançada e perioperatório',
     'Ajustes de indicação e segurança em fenômenos críticos.',
     75, 'Nível A–C'),
    (14, 8, 'Módulo 8 · Armamentário peptídico ampliado',
     'Mapa do armamentário peptídico com registro: setmelanotida, análogos de PTH, somatostatina e fronteiras',
     'Peptídeos com indicação clara versus extrapolação estética.',
     75, 'Nível A–D'),
    (15, 8, 'Módulo 8 · Armamentário peptídico ampliado',
     'Clínica de excelência: documentação, consentimento, falha terapêutica, transição entre agentes e economia BR',
     'Operacionalizar a clínica ética e vendável com peptídeos baseados em evidência.',
     90, 'Nível B')
  ) AS v(position, module_position, module_title, title, description, duration_minutes, evidence_level)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.lessons l WHERE l.course_id = cid AND l.position = v.position
  );
END $$;
