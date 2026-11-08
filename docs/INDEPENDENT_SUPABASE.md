# Doutiva fora do Lovable — Supabase próprio

## Por que ainda apontava para o Lovable?

O ZIP importado trouxe um `.env` com o projeto **Lovable Cloud** (`nflhfjyyaefhxeesvrge`). Foi o único banco disponível no ambiente do agente (só chave publishable, sem service role). Não é a arquitetura-alvo — é dívida de bootstrap.

A meta é: **conta Supabase sua → projeto `doutiva` → app Cursor aponta só para ele**.

## O que o agente não consegue sozinho

Criar projeto na API Management exige `SUPABASE_ACCESS_TOKEN` da **sua** conta (não do Lovable). Sem esse token, o agente não autentica em `api.supabase.com`.

## Org + projeto Doutiva

Org: `pfsreyjaiiiofnlcqrvw` — https://supabase.com/dashboard/org/pfsreyjaiiiofnlcqrvw  
Projeto: `ynmlbkfdjxzmsndcquap` (Doutiva, us-east-1) — https://supabase.com/dashboard/project/ynmlbkfdjxzmsndcquap  

Schema `0000`–`0018` aplicado. App Cursor aponta para este projeto (não Lovable).

## Passo a passo (você + agente)

1. Na conta dona dessa org: **Account → Access Tokens** → gerar token → colar no ambiente Cursor como `SUPABASE_ACCESS_TOKEN`.
2. Opcional: `SUPABASE_DB_PASSWORD` (senha do Postgres).
3. Avisar o agente. Ele roda:

```bash
SUPABASE_ORG_ID=pfsreyjaiiiofnlcqrvw SUPABASE_REGION=sa-east-1 \
  node scripts/bootstrap-independent-supabase.mjs
```

Isso cria o projeto `doutiva`, grava `.env` gitignored com publishable + **service role**, e aplica `drizzle/migrations/0000`…`0018`.

4. Reiniciar o Vite / túnel. Conta de teste é recriada no projeto novo.

## O que deixa de depender do Lovable

| Antes | Depois |
|---|---|
| Supabase do Lovable Cloud | Projeto Supabase Doutiva |
| Só publishable no agente | Service role no `.env` local |
| Gateway IA Lovable default | `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` + `AI_GATEWAY_BASE_URL` |
| Pacotes `@lovable.dev/*` no Vite/OAuth | Vite first-party + OAuth nativo feitos; residual `cloud-auth-js` só para preview Lovable |

## Região

Default do script: `sa-east-1` (São Paulo). Override: `SUPABASE_REGION=us-east-1`.

## Contas Lovable

**Cortadas.** O app de produção aponta só para `ynmlbkfdjxzmsndcquap`. Contas do projeto Lovable Cloud (`nflhfjyyaefhxeesvrge`) não são migradas — o médico cria acesso novo (Google ou e-mail/senha) neste projeto.

## Google OAuth

1. No Google Cloud Console, crie um cliente OAuth **Aplicativo da Web** com:
   - Redirect: `https://ynmlbkfdjxzmsndcquap.supabase.co/auth/v1/callback`
   - Origens: `https://www.doutiva.com.br`, `https://doutiva.com.br`
2. Defina `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` no ambiente.
3. Rode:

```bash
node scripts/enable-google-auth.mjs
```

Isso liga `external_google_*` no Auth do projeto Doutiva (site_url já é `https://www.doutiva.com.br`).
