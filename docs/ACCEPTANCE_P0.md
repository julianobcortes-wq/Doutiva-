# Critérios de aceite — Fundação P0

## A1 — Demo login removido
- [ ] `src/routes/auth.tsx` não contém e-mail/senha demo
- [ ] Não há botão “Entrar como convidado”
- [ ] Login só por e-mail/senha ou OAuth configurado

## A2 — Gabarito server-only
- [ ] `getTodayCase` / `listReviewCases` / `getCourseBySlug` não devolvem `correct`, `rationale` ou `teaching`
- [ ] `answerDailyCase` / `answerReviewCase` / `gradeLessonCase` corrigem no servidor e devolvem `grade`
- [ ] Migration `0014` cria `lesson_case_keys` sem GRANT a `authenticated`
- [ ] Testes `clinical-case-public.test.ts` e `daily-case.test.ts` passam

## A3 — Mastery não forjável
- [ ] Migration `0013` revoga INSERT de `authenticated` em `mastery_records`
- [ ] `preceptor.server.ts` grava via `supabaseAdmin` após evaluate

## A4 — Nav por papel real
- [ ] Estúdio / menu docente só aparece quando `studioMe().isAdmin`
- [ ] Troca localStorage de “classe” não revela Estúdio
- [ ] Rotas VISUAL_ONLY (billing, admin KPIs, missões, wallet, /creditos mock, afiliados) fora do menu principal

## A5 — Higiene de secrets
- [ ] `.env` no `.gitignore`
- [ ] `.env.example` documenta variáveis sem valores secretos
- [ ] Repo não contém `SUPABASE_SERVICE_ROLE_KEY` nem `LOVABLE_API_KEY`

## Como validar localmente

```bash
npm ci
npm test
npm run lint
# Aplicar migrations 0013 e 0014 no projeto Supabase antes do smoke E2E
```
