# Doutiva — Síntese estratégica: a escola do médico do futuro

**Documento para análise externa (Claude / conselho)**  
**Data:** 7 de novembro de 2026  
**Autor da síntese:** discussão Juliano Brites Cortes × Cursor Agent  
**Contexto:** pós-avaliação da plataforma + benchmark *Precursores do ensino com IA no mundo*

---

## 1. Problema que estamos resolvendo

Médicos em prática (emagrecimento, performance, alta complexidade ambulatorial) precisam de **educação médica continuada**, mas:

- não gostam de *estudar* (assistir, ler, decorar);
- gostam de *aprender* (decidir, errar, corrigir, aplicar na segunda-feira);
- já sabem parte do conteúdo — empurrar curso linear gera tédio e abandono;
- precisam de **proximidade** (turma, mentor, eventos), não só de app;
- a escola também precisa ajudar o médico a **gerar demanda** no consultório (protocolo → público → agenda).

A Doutiva não pode ser “mais um LMS com IA”. Tem que ser a **escola do médico do futuro**: IA no centro, hábito sem dor, profundidade sob demanda, proximidade humana, e protocolo que paga a clínica.

---

## 2. Frase-mestra (para não se perder)

> **A IA descobre o buraco e monta a trilha. O Caso do Dia vira hábito. O protocolo aprofunda e enche a agenda. Mentoria e eventos aproximam.**

Versão curta das quatro camadas:

> **Caso do Dia = hábito. Curso = profundidade do que falta. Mentoria + eventos = proximidade. Diagnóstico (IA) = o que ensinar.**

---

## 3. Duas promessas, um sistema

| Promessa | Para quem | Resultado |
|---|---|---|
| Aprender sem sofrer | O médico | Só estuda o que falta; sessões curtas; domínio medido |
| Protocolo que gera demanda | O consultório | Conduta padronizada → oferta clara ao paciente → agenda |

Se só educar → vira curso.  
Se só “gerar demanda” → vira marketing.  
A Doutiva junta os dois: **domínio clínico → conduta segura → público confia → clínica fatura**.

---

## 4. Arquitetura de produto (4 peças)

### 4.1 Caso do Dia = o “Duolingo” clínico
- Unidade: 1 decisão / dia, 3–5 minutos.
- Canal preferencial: **WhatsApp primeiro**; site para aprofundar.
- Conduta + **confiança declarada** (`sei / acho / não sei`).
- Alimenta revisão espaçada e o mapa de domínio.
- **Não** é o mentor quem faz o papel de Duolingo (mentor é caro demais para hábito diário).

### 4.2 Universidade / Protocolos = curso de verdade
- Tratado, evidência, regulação BR (ANVISA/CFM), guia de bolso.
- Deixa de ser ementa fixa “aula 1, 2, 3…” e vira **fila do que falta**.
- Aprofundar sob demanda (AMBOSS-like), não parágrafo infinito.
- Oferta comercial: **Protocolos R$ 297/mês** (+ Peptídeos free como porta).

### 4.3 Mentoria = proximidade humana (produto separado)
- Turmas pequenas (8–10), mentor-guia (não palestrante).
- Encontro curto para discutir os casos mais errados da turma.
- SKU próprio na escada (não misturar com o hábito diário).

### 4.4 Eventos presenciais = segundo pilar de proximidade
- Semana Doutiva / A Origem / imersões.
- Marca, networking, confiança Medway-like (“quem assina”).
- Mentoria presencial + eventos = os dois principais pontos de proximidade.

---

## 5. A peça que faltava: ensinar só o que o médico não sabe

Hoje a plataforma ainda **empurra** curso e caso editorial.  
Os precursores de sucesso (Alpha School / MathAcademy / Khanmigo / Brilliant) fazem o oposto: **diagnosticam o que já sabe e só ensinam o buraco**.

### 5.1 Por que casos fixos sozinhos não bastam
Montar à mão milhares de casos de diagnóstico não escala e continua sendo “nossa trilha”, não “a trilha dele”.

### 5.2 Direção desejada: IA entrevista e monta a trilha
1. IA conduz entrevista socrática (10–15 min).  
2. Médico responde + declara confiança.  
3. IA **não entrega a conduta** — cobra raciocínio (guarda-corpo Khanmigo).  
4. IA ancora no **corpus Doutiva** (conteúdo curado), não no ChatGPT genérico.  
5. Saída: mapa verde / amarelo / vermelho por tema.  
6. IA sugere/gera a próxima micro-sessão e o Caso do Dia a partir do buraco.  
7. Material permanente novo passa por **assinatura humana (nome + CRM)**.

### 5.3 Regra de avanço (motor de maestria)
| Resultado | Ação da plataforma |
|---|---|
| Acertou + “sei” | Pula teoria daquele tema |
| Acertou + “acho” | Caso gêmeo leve; domínio parcial |
| Errou ou “não sei” | Sessão curta só do buraco → reteste |
| 3 casos não vistos corretos + confiantes | Tema = dominado |

O **Índice de Domínio** substitui “aula concluída” em painel, certificado e ranking.

---

## 6. A IA no centro (cérebro único, três faces)

Não é um botão “Tutor” no canto. É o **sistema nervoso** da escola.

| Face | Função | Entrada → Saída |
|---|---|---|
| **Cartógrafo** | Entende o médico | Conversa + confiança → mapa de domínio |
| **Preceptor** | Ensina o buraco | Mapa → Caso do Dia / sessão socrática |
| **Estúdio** | Transforma material em aula | PDF/diretriz/monografia → lâminas, casos, guia, áudio (médico assina) |

### Requisitos para resultado de alto nível
1. **Memória longa** do médico (mastery persistido).  
2. **RAG / corpus Doutiva** — só gera e ensina ancorado no material revisado.  
3. **Motor de decisão** — atualiza mapa → escolhe próxima sessão → agenda revisão.  
4. **Guarda-corpo pedagógico** — socrático; nunca entrega conduta antes do compromisso.  
5. **Humano na vitrine** — IA na cozinha; CRM/nome na assinatura; mentor/evento na proximidade.  
6. **Métricas de verdade** — delta de domínio, sessões/semana, retenção D30, NPS (não “horas publicadas”).

### Arquitetura lógica
```
Materiais curados → Corpus Doutiva (versionado + assinado)
                         │
Médico ← conversa →  CÉREBRO DOUTIVA  → mapa / fila / Caso do Dia
                         │
                    Estúdio gera aula
                         │
                 Médico revisor assina
```

No produto: Professores, Tutor, Caso do Dia, onboarding “Mapa” e Estúdio chamam o **mesmo cérebro** (mesmas tools: getMastery, updateMastery, nextSession, retrieveCorpus, generateLessonDraft).

---

## 7. O que já existe vs. o que falta

### Já existe (não jogar fora)
- Loop lâminas → chaves → caso → revisão  
- 7 trilhas / conteúdo clínico denso  
- Professores de IA (personas) + Tutor  
- Revisão espaçada  
- Protocolos R$ 297 alinhado na oferta  
- Intensidade Completa / Equilibrada / Discreta  
- Sprint recente: monografias legíveis, leaks, auto-matrícula, tabs Aprofundar  

### Falta (o salto)
- IA ligada em produção (env Vercel)  
- Entrevista/Mapa clínico como porta de entrada  
- Caso do Dia dirigido pelo mapa (não por calendário fixo)  
- Índice de Domínio por tema  
- WhatsApp como canal do hábito  
- Docente com nome/CRM/foto na vitrine  
- Mentor + eventos usando o mapa da turma  
- Elo explícito “tema dominado → oferta ao paciente / demanda”  

---

## 8. Plano em fases (ordem prática)

### Fase A — Ligar a base (esta semana)
1. `OPENAI_API_KEY` (+ Supabase service role) na Vercel + redeploy  
2. Conta aluno de QA (sem admin)  
3. Docente real no “Revisado por”  
4. Limpar fixtures de teste  

### Fase B — Cérebro + hábito (diferencial)
5. Serviço único **Cérebro Doutiva**  
6. Fluxo **Mapa clínico** (entrevista IA → mastery_by_topic)  
7. Caso do Dia lê a fila do mapa + confiança  
8. WhatsApp do Caso do Dia (piloto 50)  

### Fase C — Protocolo que paga a clínica
9. Cada tema dominado desbloqueia Guia de bolso + oferta ao paciente  
10. Universidade vira fila do que falta (Aula 2.0: caso primeiro)  

### Fase D — Proximidade
11. Mentoria presencial com pauta = lacunas da turma  
12. Eventos (A Origem / Semana) sobre a base ativa  

### Portões sugeridos
- Semana 2 do piloto: ≥70% fazem 3 sessões  
- D30: retenção > 60%  
- Domínio médio +20 pts vs baseline  
- NPS > 60 antes de escalar aquisição paga  

---

## 9. Escada comercial (sem confundir SKUs)

| Oferta | O que entrega |
|---|---|
| Peptídeos (grátis) | Porta de entrada + hábito light |
| Protocolos (R$ 297/mês) | Mapa + Caso do Dia + Universidade + Preceptor |
| Mentoria | Proximidade humana / turma |
| Imersão / Eventos | Proximidade presencial + marca |
| Clube | Círculo restrito / conselho |

IA e hábito vivem em Protocolos.  
Mentoria e eventos continuam **produtos separados** de proximidade.

---

## 10. O que NÃO fazer

- Chatbot aberto sem corpus Doutiva (“cheatbot”)  
- Empurrar ementa linear para quem já domina o tema  
- Fazer o mentor virar Duolingo  
- Fundir mentoria dentro do curso e perder o SKU  
- Medir sucesso por aulas concluídas / horas publicadas  
- Abrir para médico pagante sem Mapa + IA ligada + proximidade mínima no piloto  

---

## 11. Pedido de análise ao Claude

Por favor, avalie criticamente:

1. A arquitetura **Caso do Dia / Curso / Mentoria+Eventos / Mapa-IA** está coerente para EMC de médicos em prática no Brasil?  
2. O desenho do **cérebro único (Cartógrafo / Preceptor / Estúdio)** é suficiente para “IA no centro”, ou falta alguma camada (ex.: voz, multiagente de auditoria, CRM clínico)?  
3. Como priorizar as Fases A–D se o objetivo é: (a) retenção, (b) gerar demanda para o consultório, (c) proximidade de comunidade?  
4. Quais riscos regulatórios/éticos (CFM, propaganda de procedimento, responsabilidade do conteúdo gerado por IA) precisam de guarda-corpo explícito?  
5. Proponha um **MVP de 30 dias** ainda mais enxuto, se discordar da ordem acima.  
6. Sugira métricas de piloto e critério de “go / no-go” para abrir Protocolos com a nova promessa.

---

## 12. Referências internas desta conversa

- Avaliação da plataforma (06/11/2026)  
- Benchmark *Precursores do ensino com IA no mundo* (07/11/2026) — Alpha, Khanmigo, Duolingo, Brilliant, AMBOSS/NEJM Knowledge+, Arist/WhatsApp  
- Plano 90 dias: `docs/plano-tutor-maestria-90-dias.md`  
- Norte de cópia: AMBOSS (produto) × Medway (confiança) × MasterClass (marca) × Duolingo (hábito)

---

*Fim da síntese. Documento preparado para revisão crítica e refinamento do plano de execução.*
