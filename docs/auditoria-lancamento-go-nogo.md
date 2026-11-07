# Auditoria cabo-a-rabo — go / no-go (piloto médicos)

**Quando:** 2026-11-07 (America/Sao_Paulo)  
**Branch:** `cursor/cerebro-ai-first-cd4c`  
**Conta QA:** `qa.aluno.doutiva@jubex.com.br` (aluno, sem admin)

## Veredito

| Ambiente | Status | Motivo |
|---|---|---|
| **Local (Vite + Supabase live)** | **GO piloto interno** | Jornada API + browser 100% nos caminhos críticos |
| **Produção (doutiva.com.br)** | **NO-GO público** | `/mapa` 404 + `openai:false` — falta merge PR + `OPENAI_API_KEY` na Vercel + redeploy |

Não convidar médicos para a URL pública até o bloco de produção ficar verde.

## O que foi testado (e passou)

### API / cérebro (`scripts/e2e-medico-journey.mjs` + deep tsx)

- Auth aluno, health local `openai=true`
- Cartógrafo 2 turnos + assessment + mapa `ready=true` (≥3 temas)
- Preceptor + Tutor stream
- Academy: cursos publicados + aulas
- Mentores publicados + offerings + compra courtesy (take rate 20%)
- Caso pessoal: `source=map`, `mapReady=true`
- Bibliotecário: retrieve por tokens (incretina/semaglutida → hits)
- Matchmaker: 2 parceiros ranqueados
- Estúdio: topic com aula → `reuse`; topic órfão → `gap` → draft lesson
- Award Caso do Dia (XP/créditos/streak)
- Matrícula + `lesson_progress`

### Browser Playwright (`scripts/e2e-browser-campus.mjs`) — **11/11**

- Login sessão → `/dashboard`
- `/mapa` com bandas Domina / Parcial / Lacuna
- `/caso-do-dia` com badge **DO SEU MAPA** + confiança + opções
- `/academy`, `/professores`, `/mentors` (Ana Figueiredo + Rafael Moura + ofertas)

Artefatos: `/opt/cursor/artifacts/e2e-*.png`

## Correções feitas nesta rodada

1. `mapReady` com ≥3 temas (piloto) — destrava Caso pessoal sem entrevista completa
2. Bibliotecário: match por tokens (não só `ilike` frágil)
3. Seed de `mentor_offerings` para os 2 mentores publicados
4. Copy do dashboard: removeu “Em breve” do Caso do Dia (já personaliza)
5. Mapa: temas não vistos não pintam mais como lacuna vermelha

## Bloqueios de lançamento público (você / ops)

1. **Merge** do PR do cérebro AI-first em `main`
2. **Vercel:** `OPENAI_API_KEY` (e redeploy) até `/api/health` → `openai:true`
3. Confirmar `https://www.doutiva.com.br/mapa` ≠ 404 (auth redirect ok)
4. (Opcional fim de semana) popular mais cursos — não bloqueia piloto se as 7 trilhas atuais bastarem
5. Stripe mentor price opcional — courtesy purchase já funciona para piloto

## Como revalidar em 2 minutos

```bash
node --env-file=.env scripts/smoke-brain.mjs
node --env-file=.env scripts/e2e-medico-journey.mjs
node --env-file=.env scripts/e2e-browser-campus.mjs
node --env-file=.env scripts/seed-mentor-offerings.mjs   # idempotente
```

Exit codes: `0` = tudo ok · `2` = local ok / prod ainda no-go · `1` = falha local.
