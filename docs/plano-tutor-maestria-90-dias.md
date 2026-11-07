# Plano Doutiva — Tutor de IA com maestria medida (90 dias)

Fonte: *Precursores do ensino com IA no mundo* (07/11/2026) × estado atual do produto × avaliação 06/11.

## Norte (uma frase)

Deixar de ser catálogo de aulas e virar **“2 horas por semana que mudam a conduta na segunda”**: sessão curta → decisão → confiança → preceptor socrático → domínio auditável → mentor humano → WhatsApp.

## O que já temos (não jogar fora)

| Ativo | Onde |
|---|---|
| Loop lâminas → chaves → caso → revisão | `lesson-player`, `revisao` |
| Conteúdo clínico curado (7 trilhas) | Supabase + Estúdio |
| Professores de IA (personas) | `/professores`, `/api/preceptor` |
| Revisão espaçada | `review_cards` |
| Protocolos R$ 297 | billing + offer-ladder |
| Intensidade Completa/Equilibrada/Discreta | economy / settings |
| Certificado verificável | `/verificar/$code` |

## O que muda (produto)

| De | Para |
|---|---|
| “7 trilhas · 75 aulas · 21h” | “4×25 min/semana · 1 protocolo/mês” |
| Lâmina → depois caso | **Caso primeiro** → confiança → teoria sob demanda |
| Aula concluída / XP cosmética | **Índice de Domínio** por tema (3 casos não vistos + confiança) |
| Chatbot / sabatina solta | Preceptor **com guarda-corpo** (nunca entrega conduta antes) |
| Só site | **WhatsApp** (Caso do Dia) + site para aprofundar |
| “Conselho editorial” anônimo | Médico com **nome + CRM** na vitrine |
| Mentor = palestrante | Mentor = **guia** (turma 8–10, 20 min/semana) |

## Roadmap

### Fase 0 — Fundações (esta semana) — bloqueia tudo

Sem isto, o resto é teatro.

1. **Vercel env:** `OPENAI_API_KEY`, `AI_GATEWAY_BASE_URL`, `SUPABASE_URL/PUBLISHABLE/SERVICE_ROLE`, redeploy.
2. **Google OAuth** (opcional mas desejável): Client ID/Secret → `enable-google-auth`.
3. **Docente real:** `reviewed_by` com nome + CRM + foto (pelo menos Peptídeos).
4. **Fechar leaks restantes** e fixtures de teste (ranking / mentores fictícios).
5. **Conta aluno de verdade** para QA (sem `user_roles.admin`).

**Portão:** Tutor e Professores respondem em produção; Aprofundar legível; billing = Protocolos 297.

### Fase 1 — Dias 0–30 — Provar a sessão (“Aula 2.0”)

Objetivo: uma sessão que o médico *faz*, não assiste.

1. **Reconstruir Aula 1 Peptídeos** no formato:
   - Caso 60s → conduta + confiança (`sei / acho / não sei`)
   - Preceptor socrático se errou/duvidou; pula teoria se acertou com confiança
   - 3–5 telas com **ação** (não lâmina passiva)
   - Mesmo caso / gêmeo de novo (delta da sessão)
   - Guia de bolso + próxima revisão agendada
2. **Diagnóstico inicial 15 min** (nível por tema) antes da trilha.
3. **Caso do Dia no WhatsApp** para 50 convidados (Arist-lite): responde ali; aprofunda no site.
4. Ligar preceptor com guarda-corpo (já desenhado; garantir regra “comprometeu antes”).

**Portão:** ≥70% dos 50 convidados fazem **3 sessões na semana 2**.

### Fase 2 — Dias 31–60 — Ligar o motor

1. **Grafo de pré-requisitos** entre temas das 7 trilhas (MathAcademy-lite).
2. **Índice de Domínio** por tema: limiar = 3 casos não vistos corretos + confiantes; substitui “aulas concluídas” em painel, certificado e ranking.
3. Revisão espaçada **com confiança** (errar confiante volta antes).
4. **Turmas 8–10** + mentor guia (encontro 20 min/semana + cobrança de sequência).
5. **Áudio da aula** (trajeto) gerado no Estúdio + revisão humana.
6. Certificado = domínio verificado (código público com índice).

**Portão:** retenção D30 > 60%; domínio médio +20 pts vs baseline.

### Fase 3 — Dias 61–90 — Provar e vender

1. Relatório do piloto (N ≥ 100): domínio antes/depois, sessões/semana, tempo/sessão, NPS.
2. Abrir **Protocolos** com a nova promessa (tempo + domínio, não catálogo).
3. Piloto **B2B** com 2 clínicas (painel de domínio por médico).
4. Lista **A Origem** sobre a base ativa.

**Portão:** NPS > 60; CAC pago em ≤ 3 meses.

## Métricas (só estas)

- Sessões/semana (meta 3 de 4)
- Retenção D30
- Delta de domínio (casos não vistos)
- Tempo médio/sessão (≤ 25 min)
- NPS

**Ignorar como KPI de produto:** aulas concluídas, horas publicadas, nº de cursos.

## Ordem de engenharia (quando formos codar)

1. `Session 2.0` player (caso→confiança→ações→reteste) — novo fluxo, convive com player atual
2. `mastery` por tema + confiança no `review_cards` / `mastery_records`
3. Grafo `topic_edges` (pré-requisitos)
4. WhatsApp Caso do Dia (Resend/Twilio/Z-API + cron já existente)
5. Painel mentor/turma
6. Áudio sob demanda + reviewed_by enriquecido
7. Certificado por domínio + relatório público do piloto

## Decisão de agora

**Não abrir para médico pagante com o catálogo atual.**  
Abrir o **piloto de 50** assim que a Fase 0 + Aula 2.0 de Peptídeos estiverem verdes.
