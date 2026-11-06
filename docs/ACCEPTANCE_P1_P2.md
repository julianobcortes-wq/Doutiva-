# Critérios de aceite — P1/P2 (RLS + Citation gate + AI provider)

## B1 — RLS versionado (`0015_base_table_rls.sql`)
- [ ] Migration aplicada no Supabase live sem erro
- [ ] Aluno autenticado **não** faz UPDATE/INSERT em `courses` / `lessons`
- [ ] Aluno lê apenas aulas `status = published`
- [ ] `user_progress` é SELECT own; INSERT/UPDATE/DELETE revogados para `authenticated`
- [ ] `enrollments`, `lesson_progress`, `review_cards`, sessões de mentor: own-row
- [ ] Admin (`has_role`) continua gerindo Estúdio / biblioteca

## B2 — Citation gate no Tutor
- [ ] `gateCorpusCitations` remove `[S#]` fora de `1..N` do corpus recuperado
- [ ] Sem corpus (`N=0`), marcações inventadas são removidas e aviso é anexado
- [ ] Tutor **não** chama `embedPendingSources` (sem write admin no path do aluno)
- [ ] Testes em `citations.test.ts` passam
- [ ] Resposta do `/api/tutor` inclui header `X-Doutiva-Citation-Gate: 1`

## B3 — Provider de IA desacoplável
- [ ] `src/lib/ai-provider.server.ts` centraliza gateway
- [ ] Tutor / Preceptor / embeddings usam o factory
- [ ] `.env.example` documenta `AI_GATEWAY_BASE_URL`, `OPENAI_API_KEY`, `DOUTIVA_CHAT_MODEL`, `DOUTIVA_EMBED_MODEL`
- [ ] Com `LOVABLE_API_KEY` atual, comportamento permanece compatível

## Validação

```bash
npm test
npm run lint
# Aplicar 0013, 0014 e 0015 no Supabase
```
