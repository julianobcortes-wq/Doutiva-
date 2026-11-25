# Analytics — setup para Juliano (esta semana)

O que o código já faz após o deploy, e o que você precisa clicar.

## O que já está no app

| Peça | Onde | Consentimento |
|------|------|----------------|
| Meta Pixel + `PageView` SPA | `src/lib/tracking.ts`, `SpaPageView` | Banner LGPD (opt-in) |
| Meta `ViewContent` / `Lead` / `CompleteRegistration` | `/medicos` | Opt-in |
| UTMs (sessão + first-touch) | Root (`UtmCapture`) + cadastro `/medicos` | N/A (só query string) |
| Vercel Analytics + Speed Insights | `WebAnalytics` no root | Cookieless — sem banner |
| Visitas anônimas (mkt hub) | `VisitTracker` | Já existia |
| Product stubs | `trackProduct` (mapa / trilha / lesson) | No-op até `VITE_POSTHOG_KEY` |

## 1. Vercel dashboard (obrigatório para UV/páginas)

1. Abra o projeto **Doutiva** em [vercel.com](https://vercel.com).
2. **Analytics** → Enable Web Analytics (Audience).
3. **Speed Insights** → Enable.
4. Redeploy se o dashboard pedir (push deste PR já inclui os SDKs).
5. Confirme em produção: abra `https://www.doutiva.com.br`, navegue 2–3 páginas; em ~1 min os hits aparecem em Analytics.

Sem o toggle, o componente React não grava nada.

## 2. Meta Events Manager (checklist campanha)

1. [Events Manager](https://business.facebook.com/events_manager) → Pixel **999653985998183** (ou o ID em `VITE_META_PIXEL_ID`).
2. **Test Events** com a URL `https://www.doutiva.com.br/medicos?utm_source=test&utm_medium=qa`.
3. Aceite o banner de cookies → deve ver `PageView` + `ViewContent`.
4. Preencha CRM + termos e submeta o form (pode usar e-mail de teste):
   - `Lead` (CRM/consent ok, antes do signUp)
   - `CompleteRegistration` (após signUp ok)
5. Navegue para outra rota (ex. `/privacidade`) → novo `PageView` (SPA).
6. Confirme que **sem** aceitar o banner nenhum evento Meta dispara.
7. Em Ads: use os mesmos nomes de evento nos objetivos da campanha.

Não ative Advanced Matching com e-mail/telefone sem base legal revisada — o código **não** envia PII.

## 3. Env vars (Vercel → Settings → Environment Variables)

| Var | Obrigatória? | Notas |
|-----|--------------|--------|
| `VITE_META_PIXEL_ID` | Não | Se omitida, usa o ID atual de produção. Defina só se trocar de Pixel; **rebuild** necessário (Vite embute no bundle). |
| `VITE_POSTHOG_KEY` | Não (próxima etapa) | Hooks já disparam `interview_started`, `trail_viewed`, `first_lesson`, etc. Sem chave = silêncio. |
| `VITE_POSTHOG_HOST` | Não | Ex.: `https://us.i.posthog.com` ou EU. |

## 4. Painel diário (já no produto)

- Meta Ads + Events Manager para ads.
- `/painel-marketing` + visitas (`mkt_visitas`) para tráfego próprio.
- Supabase: cadastros com `signup_source` / UTMs em `user_metadata`.

## 5. Próximo (não esta semana)

1. Criar projeto PostHog → colar `VITE_POSTHOG_KEY` (+ host) → carregar SDK no client.
2. Funil: Acquisition → Signup → Interview → First lesson → D7 → Paid.
3. Eventos `/auth`, Stripe `Purchase`, faculty.
4. Revisão LGPD do banner se PostHog usar cookies identificadores.
