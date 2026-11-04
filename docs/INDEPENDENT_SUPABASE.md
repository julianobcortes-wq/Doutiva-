# Doutiva fora do Lovable — Supabase próprio

## Por que ainda apontava para o Lovable?

O ZIP importado trouxe um `.env` com o projeto **Lovable Cloud** (`nflhfjyyaefhxeesvrge`). Foi o único banco disponível no ambiente do agente (só chave publishable, sem service role). Não é a arquitetura-alvo — é dívida de bootstrap.

A meta é: **conta Supabase sua → projeto `doutiva` → app Cursor aponta só para ele**.

## O que o agente não consegue sozinho

Criar projeto na API Management exige `SUPABASE_ACCESS_TOKEN` da **sua** conta (não do Lovable). Sem esse token, o agente não autentica em `api.supabase.com`.

## Passo a passo (você + agente)

1. Conta em https://supabase.com (pessoal/empresa — **não** Lovable Cloud).
2. **Account → Access Tokens** → gerar token → colar no ambiente Cursor como `SUPABASE_ACCESS_TOKEN`.
3. Opcional: `SUPABASE_DB_PASSWORD` (senha do Postgres).
4. Avisar o agente. Ele roda:

```bash
node scripts/bootstrap-independent-supabase.mjs
```

Isso cria o projeto (região default `sa-east-1`), grava `.env` gitignored com publishable + **service role**, e aplica `drizzle/migrations/0000`…`0018`.

5. Reiniciar o Vite / túnel. Conta de teste é recriada no projeto novo.

## O que deixa de depender do Lovable

| Antes | Depois |
|---|---|
| Supabase do Lovable Cloud | Projeto Supabase Doutiva |
| Só publishable no agente | Service role no `.env` local |
| Gateway IA Lovable default | `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` + `AI_GATEWAY_BASE_URL` |
| Pacotes `@lovable.dev/*` no Vite/OAuth | Desacoplar em seguida (ver ARCHITECTURE.md) |

## Região

Default do script: `sa-east-1` (São Paulo). Override: `SUPABASE_REGION=us-east-1`.
