# Doutiva — Arquitetura-alvo (fundação)

## Princípio

Qualidade = fluxos ponta a ponta verificáveis. Tela sem backend não conta como feature.

## Planos

1. **Learning core** — auth, academia, caso do dia, revisão, tutor, preceptor, certificados, ranking, créditos reais (`user_progress`). Respostas clínicas nunca no client antes do submit.
2. **Evidence plane** — `knowledge_sources`, embeddings assíncronos, citation gate, Estúdio com revisor humano rastreável.
3. **Commerce plane** — pagamentos + fulfillment (ainda não implementado). UI falsa permanece fora do menu.

## Stack atual

TanStack Start · React 19 · Supabase Auth/Postgres/RLS · Drizzle SQL migrations · AI via Lovable Gateway (a desacoplar) · Europe PMC / ClinicalTrials.gov.

## Regras de segurança clínica

- Gabaritos em `lesson_case_keys` (service_role only) após migration `0014`.
- `mastery_records` INSERT só via service_role (`0013`).
- Nav docente via `has_role('admin')`, nunca `localStorage`.
- Sem conta demo com senha no bundle.

## Desacoplamento Lovable (ordem)

1. Providers AI próprios (`LOVABLE_API_KEY` → OpenAI/Anthropic/Google)
2. Vite/TanStack config explícita (sair de `@lovable.dev/vite-tanstack-config`)
3. OAuth Supabase nativo (sair de `@lovable.dev/cloud-auth-js`)
4. Remover error bridge / preview auth
5. Schema base + RLS completo versionado no git

## Conteúdo médico

Geração por IA exige revisão humana (`reviewed_by` + status) antes de `published`. Citações devem preferir o acervo; gate de fidelidade claim↔trecho é P2.
