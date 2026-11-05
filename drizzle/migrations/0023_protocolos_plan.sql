-- Alinha planos ao lançamento: Protocolos Online R$ 297/mês como oferta principal.
-- Imersão / mentoria / clube NÃO são self-serve aqui — ficam na escada pública (/oferta) como "em breve".

INSERT INTO public.subscription_plans(id, name, tagline, price_cents, interval, features, highlighted, sort_order, active) VALUES
('protocolos', 'Protocolos', 'Online: sessão guiada, trilhas, revisão e IA.', 29700, 'month',
 '["Sessão do dia","Trilhas e monografias","Revisão espaçada","Professores de IA","Comunidade"]'::jsonb, true, 1, true),
('protocolos_anual', 'Protocolos Anual', '12 meses de Protocolos com prioridade na lista A Origem.', 297000, 'year',
 '["Tudo de Protocolos","Lista prioritária A Origem","Suporte prioritário"]'::jsonb, false, 2, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  price_cents = EXCLUDED.price_cents,
  interval = EXCLUDED.interval,
  features = EXCLUDED.features,
  highlighted = EXCLUDED.highlighted,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active;

-- Planos antigos de CME genérico: desativar (mantém linhas por FK de assinaturas existentes).
UPDATE public.subscription_plans
SET active = false
WHERE id IN ('estudante', 'pro', 'fundador');
