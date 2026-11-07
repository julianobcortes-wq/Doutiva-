# Scorecard de lançamento — segunda-feira

**Gerado:** 2026-11-07 (America/Sao_Paulo)  
**Branch:** `cursor/cerebro-ai-first-cd4c` · PR #3  
**Meta:** convidar médicos sem vergonha

## Nota geral

| Escopo | Nota | Veredito |
|---|---|---|
| **Produto local (piloto)** | **A−** | Pronto para médicos convidados em ambiente controlado |
| **Produção doutiva.com.br** | **F** | Bloqueado: PR não merged + OpenAI off + `/mapa` 404 |
| **Pronto para segunda pública** | **C** | Sobe para **A−** só depois dos 2 passos de deploy |

## Grade por peça

| Peça | Nota | Evidência |
|---|---|---|
| Auth (e-mail aluno) | A | E2E + Playwright login sessão |
| Dashboard campus | A− | Cérebro em destaque; copy Caso do Dia atualizado |
| Cartógrafo / `/mapa` | A | Live OpenAI, assessment, memória persistida, UI entrevista |
| Caso do Dia pessoal | A | Badge **DO SEU MAPA**, confiança, grade+XP |
| Preceptor / Tutor IA | A | Streams E2E ok |
| Academia (7 cursos) | A− | 7 publicados · peptídeos 15 aulas; fim de semana pode popular mais |
| Mentores parceiros | A− | 2 mentores + 2 offerings + matchmaker + courtesy purchase |
| Bibliotecário | B+ | Retrieve por tokens ok; curadoria admin menos exercitada no browser |
| Estúdio gaps | B+ | reuse + orphan→draft testados via service; UI curadoria admin ok por código |
| WhatsApp cron | B | Código presente; não smoke em prod (cron secret) |
| Stripe checkout | C | `stripe:false` em health; courtesy cobre piloto |
| Marketing `/mentores` | A− | Removido “Em breve” (esta rodada) |
| **Prod health openai** | **F** | `openai:false` |
| **Prod `/mapa`** | **F** | 404 |

## Suites verdes (local)

- `smoke-brain.mjs` → 20/20 local (2 fails só prod)
- `e2e-medico-journey.mjs` → 27/27 local
- `e2e-browser-campus.mjs` → 12/12
- vitest clinical-case + daily-case → 7/7

## O que VOCÊ precisa fazer antes de segunda (ops)

1. **Merge** [PR #3](https://github.com/julianobcortes-wq/Doutiva-/pull/3)
2. **Vercel → Environment Variables** (Production):
   - `OPENAI_API_KEY=sk-...`
   - (se usar) `AI_GATEWAY_BASE_URL=https://api.openai.com/v1`
3. **Redeploy** Production
4. Validar:
   - `https://www.doutiva.com.br/api/health` → `"openai":true`
   - `https://www.doutiva.com.br/mapa` → ≠ 404 (redirect auth ok)
5. Smoke pós-deploy: criar conta convidado e abrir mapa + caso do dia

## O que NÃO bloqueia segunda

- Mais cursos (fim de semana / conteúdo)
- Stripe mentor price (courtesy funciona no piloto)
- WhatsApp daily push (nice-to-have)
- Google OAuth polish (e-mail/senha ok)

## Convite seguro se prod ainda atrasar

Use preview autenticado Vercel **ou** sessões demo no ambiente local/staging com a conta QA — **não** mande médicos para `doutiva.com.br` enquanto `openai:false` e `/mapa` 404.
