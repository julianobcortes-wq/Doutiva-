# Deploy Doutiva (produção)

## Pré-requisitos

1. Projeto Supabase **Doutiva** (`ynmlbkfdjxzmsndcquap`) — contas Lovable Cloud não migram.
2. Secrets no host:
   - `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`
   - `OPENAI_API_KEY`, `AI_GATEWAY_BASE_URL=https://api.openai.com/v1`
   - Opcional: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*`, `RESEND_API_KEY`, `RESEND_FROM`, `CRON_SECRET`, `APP_ORIGIN`
3. Google login: criar OAuth Web no Google Cloud e rodar `node scripts/enable-google-auth.mjs` (ver `docs/INDEPENDENT_SUPABASE.md`).

## Vite / build

`vite.config.ts` é first-party (TanStack Start + React + Tailwind + Nitro). Não depende de `@lovable.dev/vite-tanstack-config`.

```bash
npm ci
npm run build
```

Preset Nitro padrão: `node-server`. Em Vercel use `NITRO_PRESET=vercel`. Em Cloudflare: `NITRO_PRESET=cloudflare-module`.

## Vercel

```bash
npm i -g vercel
vercel link
# setar env vars (incluindo NITRO_PRESET=vercel se usar o preset Nitro)
vercel env add ...
vercel --prod
```

Rotas de API (`/api/cron/*`, `/api/stripe/webhook`, `/api/tutor`, `/api/preceptor`) precisam do servidor Nitro — não faça deploy SPA-only com rewrite cego para `index.html` sem backend.

## Domínio doutiva.com.br (Registro.br → Vercel)

O site público (`/`, `/evento`, legais) e o app autenticado são o **mesmo** deploy. Não hospede a landing antiga em paralelo. `/eventos` redireciona para `/evento`.

1. Deploy em produção na Vercel (passo acima) e anote o host `*.vercel.app`.
2. No projeto Vercel → Domains → adicione `doutiva.com.br` e `www.doutiva.com.br`.
3. No painel do Registro.br (DNS do domínio), aponte conforme a Vercel indicar — em geral:
   - `www` → CNAME para `cname.vercel-dns.com` (ou o valor que a Vercel mostrar)
   - apex `@` → A `76.76.21.21` **ou** os nameservers da Vercel, se preferir delegar DNS
4. Aguarde propagação; remova o host/DNS da landing antiga só depois do `www` e do apex responderem este app.
5. Em Supabase Auth → URL Configuration, inclua `https://doutiva.com.br` e `https://www.doutiva.com.br` em Site URL / Redirect URLs.
6. Defina `APP_ORIGIN=https://www.doutiva.com.br` (ou o canônico escolhido) no host.

## Cloudflare Tunnel (preview)

```bash
npm run dev
cloudflared tunnel --url http://127.0.0.1:5173
```

## Cron do Caso do Dia

`GET /api/cron/daily-challenge` com header `Authorization: Bearer $CRON_SECRET`.

Agenda sugerida: 08:00 America/Sao_Paulo (`0 11 * * *` UTC).

## Stripe

1. Criar Prices no Dashboard e mapear em `STRIPE_PRICE_<PLAN_ID>` (ou `STRIPE_PRICE_DEFAULT`).
2. Webhook → `POST /api/stripe/webhook` com evento `checkout.session.completed`.
3. Sem `STRIPE_SECRET_KEY`, `/billing` continua ativando cortesia via RPC `select_plan`.
