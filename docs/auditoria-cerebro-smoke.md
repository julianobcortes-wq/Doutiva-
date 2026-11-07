# Auditoria honesta — Cérebro Doutiva (07/11/2026)

## Resposta direta

**Sim, o plano existe e o núcleo AI-first foi implementado de verdade** — mas **produção (www.doutiva.com.br) ainda NÃO está ligada** para o aluno final.

| Camada | Estado |
|---|---|
| Plano / arquitetura | Documentado e coerente (IA no centro) |
| Código ondas 1–6 | No branch/PR #3 |
| Banco Supabase | **Ligado** (0026+0027) |
| Cartógrafo local (IA → mapa) | **Testado e funcionando** após correção de schema |
| Produção Vercel | `openai: false` + rota `/mapa` **404** (código não merged / env) |

## O que o smoke test provou (local)

Script: `node --env-file=.env scripts/smoke-brain.mjs`

- 8 `clinical_topics` + 96 `lesson_topics`
- RPC `upsert_mastery_by_topic` / `mastery_band`
- `POST /api/brain/cartographer` com JWT real
- Resposta da OpenAI (~4,7s)
- 2º turno com **assessment** (score 90, confiança “sei”)
- **Memória escrita** em `mastery_by_topic`

Isso é o coração “IA no meio”: Cartógrafo calibra → persiste mapa.

## O que é real vs. mais fino

| Peça | Realidade |
|---|---|
| Cartógrafo + `/mapa` | Real e testado local |
| Caso do Dia pessoal | Código real (`pickPersonalDailyCase`); depende do mapa preenchido |
| Universidade adaptativa | Ordenação por lacunas real se `lesson_topics`+mapa |
| Estúdio vivo / gaps | Código real; precisa admin + migration; geração IA sob demanda |
| Mentores + take rate | Schema + compra courtesy + Matchmaker; Stripe mentoria ainda cortesia |
| WhatsApp | Adapter + cron reais; precisa `WHATSAPP_*` + opt-in |

## Bug encontrado e corrigido neste teste

OpenAI strict JSON schema rejeitava campos `.optional()` no Cartógrafo → **400 Falha no Cartógrafo**.  
Corrigido para `.nullable()` + normalização de `topic_id`.

## Para o usuário não se frustrar

1. Merge PR #3 → main  
2. Vercel Production: `OPENAI_API_KEY` + `AI_GATEWAY_BASE_URL` + service role → redeploy  
3. Só então abrir `/mapa` em produção  

Até lá: banco pronto, cérebro validado **local**; site público ainda no app antigo sem cérebro.
