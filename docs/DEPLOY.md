# Deploy Doutiva (produção)

## Pré-requisitos

1. Projeto Supabase próprio com migrations `0000`–`0022` aplicadas.
2. Secrets no host:
   - `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`
   - `OPENAI_API_KEY`, `AI_GATEWAY_BASE_URL=https://api.openai.com/v1`
   - Opcional: `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, `RESEND_FROM`, `CRON_SECRET`, `APP_ORIGIN`

## Vercel (recomendado enquanto o Vite usa `@lovable.dev/vite-tanstack-config`)

```bash
npm i -g vercel
vercel link
vercel env add ...
vercel --prod
```

O build atual ainda depende do pacote Lovable Vite/TanStack. Desacoplar exige migrar `vite.config.ts` para `@tanstack/react-start/plugin/vite` + Nitro explícito — faça em PR dedicado após smoke do build.

## Cloudflare Tunnel (preview)

```bash
npm run dev
cloudflared tunnel --url http://127.0.0.1:5173
```

## Cron do Caso do Dia

`GET /api/cron/daily-challenge` com header `Authorization: Bearer $CRON_SECRET`.

Agenda sugerida: 08:00 America/Sao_Paulo (`0 11 * * *` UTC).
