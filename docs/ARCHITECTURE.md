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

## Hospedagem independente

O ZIP Lovable trouxe um projeto Supabase alheio (`nflhfjyyaefhxeesvrge`). **Não é o destino.** Ver `docs/INDEPENDENT_SUPABASE.md` e `scripts/bootstrap-independent-supabase.mjs` para criar o projeto Doutiva na sua conta e reapontar o `.env`.

## Desacoplamento Lovable (ordem)

1. ~~Providers AI próprios~~ — `ai-provider.server.ts` + env (`AI_GATEWAY_BASE_URL` / `OPENAI_API_KEY`)
2. **Supabase próprio** — bootstrap via Management API (token da conta Doutiva)
3. Vite/TanStack config explícita (sair de `@lovable.dev/vite-tanstack-config`)
4. OAuth Supabase nativo (sair de `@lovable.dev/cloud-auth-js`)
5. Remover error bridge / preview auth
6. ~~Schema base + RLS versionado~~ — migration `0015` (tabelas-base); CREATE TABLE das seeds ainda vive no Cloud baseline

## Citation integrity

Tutor recupera até N fontes → injeta `[S1]…[SN]` → após geração, `gateCorpusCitations` remove índices fora do corpus antes de enviar ao cliente.

## Conteúdo médico

Geração por IA exige revisão humana (`reviewed_by` + status) antes de `published`. Citações devem preferir o acervo; gate de fidelidade claim↔trecho é P2.
