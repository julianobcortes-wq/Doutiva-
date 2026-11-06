import type { RichLesson } from "../lesson-types";

/* Aula 4 — Ensaios de semaglutida e tirzepatida */
export const lesson4: RichLesson = {
  slides: [
    { kind: "title", eyebrow: "Módulo 2 · Incretinas", title: "Os ensaios que mudaram a medicina", subtitle: "STEP, SURMOUNT, SELECT, FLOW: números que todo médico precisa saber de cor — e como lê-los." },
    { kind: "bars", title: "Perda de peso média vs placebo", unit: "%", bars: [
      { label: "Placebo (STEP 1)", value: -2.4 },
      { label: "Semaglutida 2,4 mg", value: -14.9, highlight: true },
      { label: "Placebo (SURMOUNT-1)", value: -3.1 },
      { label: "Tirzepatida 5 mg", value: -15.0 },
      { label: "Tirzepatida 10 mg", value: -19.5 },
      { label: "Tirzepatida 15 mg", value: -20.9, highlight: true },
    ], source: "Wilding, NEJM 2021 (68 sem) · Jastreboff, NEJM 2022 (72 sem)", note: "Análise por intenção de tratar (estimand de política de tratamento)." },
    { kind: "bars", title: "Comparação direta: SURMOUNT-5", unit: "%", bars: [
      { label: "Semaglutida (MTD)", value: -13.7 },
      { label: "Tirzepatida (MTD)", value: -20.2, highlight: true },
    ], source: "Aronne et al., NEJM 2025 — 72 semanas, obesidade sem DM2" },
    { kind: "table", title: "Desfechos duros", head: ["Ensaio", "População", "Desfecho", "Resultado"], rows: [
      ["SUSTAIN-6", "DM2 alto risco CV", "MACE-3", "HR 0,74"],
      ["SELECT", "DCV estabelecida, IMC ≥ 27, sem DM", "MACE-3", "HR 0,80 (0,72–0,90)"],
      ["FLOW", "DM2 + DRC", "Composto renal", "HR 0,76 (0,66–0,88)"],
      ["STEP-HFpEF", "ICFEp + obesidade", "KCCQ e peso", "Melhora de sintomas"],
      ["SURMOUNT-OSA", "AOS moderada-grave + obesidade", "IAH", "−25 a −29 eventos/h"],
    ], source: "Marso 2016 · Lincoff 2023 · Perkovic 2024 · Kosiborod 2023 · Malhotra 2024 (NEJM)" },
    { kind: "bars", title: "O que acontece ao suspender (STEP 4)", unit: "%", bars: [
      { label: "Semana 0–20 (todos)", value: -10.6 },
      { label: "Manteve semaglutida (20→68)", value: -7.9, highlight: true },
      { label: "Trocou p/ placebo (20→68)", value: 6.9 },
    ], source: "Rubino et al., JAMA 2021", note: "Obesidade se comporta como doença crônica: o efeito depende da exposição contínua." },
    { kind: "bullets", title: "Como ler esses ensaios criticamente", bullets: [
      "Estimand de “política de tratamento” (ITT) vs “em uso” — números diferem 2–4 pontos.",
      "Populações selecionadas: poucos idosos frágeis, sem transtornos alimentares graves.",
      "Perda de peso inclui massa magra (~25–40% do total) — ver aula 5.",
      "SELECT: benefício CV surgiu cedo, antes da perda ponderal máxima — sugere efeito além do peso.",
      "Financiamento industrial: dados robustos, mas atenção à seleção de desfechos.",
    ] },
    { kind: "pearl", title: "Mensagem central", text: "Pela primeira vez, um fármaco para obesidade reduziu infarto, AVC e morte cardiovascular. Obesidade passou a ser tratada como doença cardiometabólica.", source: "SELECT · Lincoff, NEJM 2023" },
  ],
  monograph: `## 1. Por que estes ensaios importam

Até 2021, a farmacoterapia da obesidade produzia perdas médias de 5–10% e carregava o histórico de retiradas por segurança (fenfluramina, sibutramina, rimonabanto). Os programas **STEP** (semaglutida) e **SURMOUNT** (tirzepatida) elevaram a perda média para faixas antes exclusivas da cirurgia bariátrica, e **SELECT** e **FLOW** demonstraram redução de eventos clínicos. Esta aula organiza os números e, sobretudo, ensina a lê-los.

## 2. Programa STEP — semaglutida 2,4 mg/semana

### STEP 1 (Wilding, NEJM 2021)
- **n = 1.961**, IMC ≥ 30 ou ≥ 27 com comorbidade, **sem diabetes**.
- 68 semanas, com intervenção de estilo de vida em ambos os braços.
- Perda média **−14,9% vs −2,4%** (diferença −12,4 pontos).
- **86%** perderam ≥ 5%; **69%** ≥ 10%; **50%** ≥ 15%; **32%** ≥ 20%.
- Descontinuação por eventos adversos: 7,0% vs 3,1%, majoritariamente gastrointestinais.

### STEP 1 — extensão
Um ano após suspender, os participantes **recuperaram cerca de dois terços** do peso perdido, e a melhora de fatores cardiometabólicos regrediu em paralelo.

### STEP 4 (Rubino, JAMA 2021)
Após 20 semanas em dose plena (−10,6%), randomização para manter ou trocar por placebo. Às 68 semanas: **−7,9% adicional** com manutenção versus **+6,9%** de reganho com placebo. É o dado mais importante para explicar ao paciente que o tratamento é **crônico**.

### Outros STEPs relevantes
- **STEP 2**: DM2 — perda menor (−9,6%), padrão consistente: diabéticos perdem menos.
- **STEP 5**: 104 semanas, efeito sustentado (−15,2%).
- **STEP TEENS**: adolescentes, −16,1% vs +0,6%.
- **STEP-HFpEF**: insuficiência cardíaca com fração de ejeção preservada — melhora de sintomas (KCCQ), capacidade funcional e peso.
- **STEP 9**: osteoartrite de joelho — redução de dor (WOMAC).

## 3. Programa SURMOUNT — tirzepatida

### SURMOUNT-1 (Jastreboff, NEJM 2022)
- **n = 2.539**, sem diabetes, 72 semanas.
- **−15,0% / −19,5% / −20,9%** com 5/10/15 mg vs **−3,1%** com placebo.
- Na dose de 15 mg, **57%** perderam ≥ 20% do peso.
- Extensão de 3 anos em pré-diabéticos: redução de ~94% no risco de progressão para DM2.

### SURMOUNT-4
Após 36 semanas de tirzepatida, a troca para placebo levou a reganho de **14%**, enquanto a manutenção trouxe perda adicional de 5,5%. Mesma lição de STEP 4.

### SURMOUNT-5 (Aronne, NEJM 2025)
Primeiro ensaio de comparação direta: tirzepatida dose máxima tolerada **−20,2%** vs semaglutida **−13,7%** em 72 semanas, aberto. Confirma superioridade de magnitude da tirzepatida em perda ponderal; não avaliou desfechos cardiovasculares.

### SURMOUNT-OSA (Malhotra, NEJM 2024)
Apneia obstrutiva moderada a grave com obesidade: redução do índice de apneia-hipopneia de **−25,3 a −29,3 eventos/h** (vs −5,3 a −5,5 com placebo). Levou à aprovação pelo FDA para AOS em 2024.

## 4. Desfechos cardiovasculares e renais

### SUSTAIN-6 (Marso, NEJM 2016)
DM2 de alto risco, semaglutida 0,5–1,0 mg: **MACE HR 0,74**. Sinal de **piora de retinopatia** (HR 1,76), concentrado em pacientes com retinopatia prévia e queda rápida de HbA1c — origem da recomendação de fundoscopia basal em diabéticos.

### SELECT (Lincoff, NEJM 2023) — o divisor de águas
- **n = 17.604**, DCV estabelecida, IMC ≥ 27, **sem diabetes**.
- Seguimento médio de ~40 meses.
- **MACE-3 HR 0,80 (IC95% 0,72–0,90)**: redução relativa de 20% em morte CV, IAM e AVC não fatais.
- A separação das curvas começou precocemente, sugerindo mecanismos além do peso (anti-inflamatórios, hemodinâmicos, ateroscleróticos).
- Descontinuação por eventos adversos: 16,6% vs 8,2%.

### FLOW (Perkovic, NEJM 2024)
DM2 com doença renal crônica, semaglutida 1,0 mg: desfecho composto renal (falência renal, queda ≥ 50% da TFG, morte renal ou CV) **HR 0,76 (0,66–0,88)**. Encerrado precocemente por eficácia. Também reduziu MACE e mortalidade total.

### SURPASS-CVOT
Comparou tirzepatida a dulaglutida em DM2 com DCV; resultados de 2025 mostraram **não inferioridade** para MACE, com tendência favorável. Leia o artigo completo antes de usar como argumento de superioridade.

## 5. Leitura crítica — o que separa o especialista

1. **Estimands**: “política de tratamento” inclui todos os randomizados (mais conservador); “em tratamento” considera só quem seguiu o fármaco. Publicações e propagandas escolhem o número mais favorável — saiba qual está sendo citado.
2. **Populações**: poucos idosos acima de 75 anos, poucos pacientes com sarcopenia, transtorno alimentar ou doença psiquiátrica grave. Extrapole com prudência.
3. **Massa magra**: subestudos com DEXA mostram que **~25–40%** do peso perdido é massa magra. A proporção relativa de massa magra melhora, mas em idosos a perda absoluta importa.
4. **Durabilidade**: todos os ensaios de retirada mostram reganho. Planeje desde a primeira consulta a estratégia de manutenção.
5. **Custo e acesso**: eficácia sem acesso não muda a saúde populacional; discuta custo de longo prazo com o paciente.

## 6. Retatrutida — o horizonte

Triagonista GIP/GLP-1/glucagon. Fase 2 (Jastreboff, NEJM 2023): **−24,2%** em 48 semanas com 12 mg, sem platô evidente. Programa TRIUMPH de fase 3 em andamento. **Não há registro**; qualquer oferta comercial atual é irregular.`,
  clinicalCase: {
    title: "O executivo pós-infarto",
    vignette: "Homem de 58 anos, IAM com supra de ST há 8 meses, angioplastia com stent em DA. Em AAS, ticagrelor, rosuvastatina 40 mg, ramipril e metoprolol. IMC 31, sem diabetes. LDL 52 mg/dL. Pergunta se “remédio de emagrecer” tem papel para ele.",
    data: [
      { label: "IMC", value: "31 kg/m²" },
      { label: "HbA1c", value: "5,8%" },
      { label: "LDL-c", value: "52 mg/dL" },
      { label: "TFGe", value: "78 mL/min" },
      { label: "PCR-us", value: "3,4 mg/L" },
      { label: "FEVE", value: "52%" },
    ],
    question: "Qual o embasamento mais forte para a conduta?",
    options: [
      { label: "Não há indicação: ele já está com LDL na meta e não é diabético.", correct: false, rationale: "Ignora o SELECT, que incluiu exatamente esse perfil (DCV + IMC ≥ 27 sem DM) e mostrou redução de MACE." },
      { label: "Iniciar semaglutida 2,4 mg com escalonamento padrão, citando SELECT (MACE HR 0,80) como evidência de redução de eventos neste perfil.", correct: true, rationale: "É a única molécula com ECR de desfecho cardiovascular em prevenção secundária sem diabetes. Indicação cardiovascular consta em bula em diversas agências." },
      { label: "Iniciar tirzepatida 15 mg porque SURMOUNT-5 mostrou maior perda de peso.", correct: false, rationale: "Maior perda ponderal não equivale a evidência de desfecho CV em prevenção secundária sem DM. Além disso, nunca se inicia em dose máxima." },
      { label: "Encaminhar para cirurgia bariátrica antes de qualquer fármaco.", correct: false, rationale: "IMC 31 sem DM2 não é indicação clássica de bariátrica; há fármaco com desfecho CV demonstrado." },
    ],
    teaching: `**Desfecho duro vence magnitude de perda de peso** quando o objetivo é prevenir eventos.

- **SELECT**: 17.604 pacientes, MACE-3 HR 0,80. Perfil idêntico ao do caso.
- Monitorar FC (betabloqueado), tolerância GI e adesão.
- Explique: é tratamento **crônico** — STEP 4 mostra reganho ao suspender.`,
    reward: 50,
  },
  quickRef: `### Números de memória
| Ensaio | Resultado |
|---|---|
| STEP 1 | −14,9% vs −2,4% (68 sem) |
| SURMOUNT-1 | −15,0 / −19,5 / −20,9% vs −3,1% (72 sem) |
| SURMOUNT-5 | Tirz −20,2% vs Sema −13,7% |
| SELECT | MACE HR **0,80** |
| SUSTAIN-6 | MACE HR 0,74 · retinopatia HR 1,76 |
| FLOW | Renal HR **0,76** |
| SURMOUNT-OSA | IAH −25 a −29/h |
| STEP 4 | Suspender → **+6,9%** reganho |

### Pacientes que perdem menos
DM2 · homens · IMC muito elevado · baixa adesão

### Fundoscopia basal
DM2 com retinopatia + queda rápida esperada de HbA1c`,
};

/* Aula 5 — Segurança, efeitos adversos e massa magra */
export const lesson5: RichLesson = {
  slides: [
    { kind: "title", eyebrow: "Módulo 2 · Incretinas", title: "Segurança, efeitos adversos e massa magra", subtitle: "O que é frequente, o que é raro e grave, e como proteger o músculo." },
    { kind: "table", title: "Eventos adversos gastrointestinais", head: ["Evento", "Semaglutida 2,4 mg", "Placebo"], rows: [
      ["Náusea", "44%", "17%"],
      ["Diarreia", "32%", "16%"],
      ["Vômitos", "25%", "7%"],
      ["Constipação", "23%", "10%"],
      ["Descontinuação por EA", "7,0%", "3,1%"],
    ], source: "STEP 1 · Wilding, NEJM 2021" },
    { kind: "table", title: "Raros, porém graves", head: ["Evento", "Evidência", "Conduta"], rows: [
      ["Pancreatite aguda", "Rara; sinal inconsistente em ECRs", "Suspender e não reintroduzir"],
      ["Colelitíase/colecistite", "↑ com perda rápida de peso", "Atenção a dor em HD"],
      ["Carcinoma medular de tireoide", "Roedores; não confirmado em humanos", "Contraindicado se CMT/NEM2"],
      ["Aspiração em anestesia", "Relatos; resíduo gástrico", "Protocolo perioperatório"],
      ["NAION", "Sinal reconhecido pela EMA (2025), muito raro", "Perda visual súbita → suspender, oftalmo"],
      ["Piora de retinopatia", "SUSTAIN-6 em DM2", "Fundoscopia basal"],
    ] },
    { kind: "bars", title: "Composição do peso perdido (DEXA)", unit: "%", bars: [
      { label: "Massa gorda", value: 61, highlight: true },
      { label: "Massa magra", value: 39 },
    ], source: "STEP 1 subestudo DEXA (n=140)", note: "SURMOUNT-1 DEXA: ~25% de massa magra. A proporção de massa magra corporal relativa aumenta, mas a perda absoluta importa em idosos." },
    { kind: "flow", title: "Protocolo Doutiva de preservação muscular", steps: [
      { label: "Basal", detail: "Bioimpedância/DEXA, força de preensão, SARC-F" },
      { label: "Proteína", detail: "1,2–1,6 g/kg peso ajustado/dia (≥ 25–30 g/refeição)" },
      { label: "Treino resistido", detail: "2–3×/sem, progressivo, grandes grupos" },
      { label: "Micronutrientes", detail: "Vit. D, B12 (se metformina), ferro" },
      { label: "Reavaliar", detail: "A cada 3 meses: força e composição" },
    ] },
    { kind: "bullets", title: "Perioperatório (consenso multissocietário 2024)", bullets: [
      "Na maioria dos pacientes, manter o agonista — individualizar.",
      "Maior risco: fase de escalonamento, sintomas GI, dose alta.",
      "Considerar dieta líquida nas 24 h pré-procedimento em alto risco.",
      "Ultrassom gástrico point-of-care quando disponível.",
      "Comunicar o anestesista: é a medida mais simples e mais esquecida.",
    ], note: "A orientação ASA 2023 (suspender 1 semana) foi atualizada; siga o protocolo da sua instituição." },
    { kind: "pearl", title: "Para o consultório", text: "Prescrever agonista de GLP-1 sem prescrever proteína e treino de força é tratar metade do paciente.", source: "Doutiva · Princípio 5" },
  ],
  monograph: `## 1. Visão geral do perfil de segurança

Agonistas de GLP-1 e GIP/GLP-1 têm um dos perfis de segurança mais estudados da farmacologia moderna — centenas de milhares de pacientes em ensaios e milhões em uso real. A maioria dos eventos é **gastrointestinal, dose-dependente e transitória**. A competência do médico está em três tarefas: **prevenir** eventos frequentes com titulação adequada, **reconhecer** eventos raros e graves, e **proteger a massa magra**.

## 2. Eventos gastrointestinais

No STEP 1: náusea 44%, diarreia 32%, vômitos 25%, constipação 23%. Na maioria leves a moderados, concentrados nas semanas de escalonamento. Tirzepatida apresenta perfil semelhante, dose-dependente.

**Manejo prático:**
- Escalonar a cada 4 semanas; se intolerância, **permanecer** ou **retornar** à dose anterior por mais 4 semanas.
- Refeições pequenas, comer devagar, parar ao primeiro sinal de saciedade.
- Evitar gordura e frituras, especialmente nos dias seguintes à aplicação.
- Hidratação ativa (≥ 1,5–2 L/dia), pois a sede também é reduzida.
- Constipação: fibras, água, polietilenoglicol se necessário.
- Antieméticos pontuais podem ser usados; uso contínuo sugere dose inadequada.

**Atenção:** vômitos e diarreia intensos podem precipitar **lesão renal aguda** pré-renal, especialmente com IECA/BRA, diuréticos ou iSGLT2.

## 3. Eventos raros e graves

### 3.1 Pancreatite
Casos foram relatados; metanálises de ECRs não mostram aumento consistente, mas a bula recomenda suspender diante de suspeita e **não reintroduzir** se confirmada. Pancreatite prévia é contraindicação relativa — a maioria dos especialistas evita a classe.

### 3.2 Doença biliar
Colelitíase e colecistite aumentam, em parte pela própria perda ponderal rápida. Dor em hipocôndrio direito exige investigação.

### 3.3 Tireoide
Tumores de células C ocorreram em roedores, cujas células C expressam GLP-1R abundantemente — diferente de humanos. Não há confirmação de risco em humanos, mas a classe é **contraindicada em história pessoal ou familiar de carcinoma medular de tireoide ou NEM2**. Calcitonina de rotina não é recomendada pelas bulas.

### 3.4 Aspiração pulmonar perioperatória
O retardo de esvaziamento gástrico pode resultar em conteúdo gástrico residual mesmo após jejum padrão. A orientação inicial da ASA (2023) de suspender a dose semanal por uma semana foi revisada por um **consenso multissocietário em 2024**, que recomenda na maioria dos casos **manter** o fármaco, identificar pacientes de alto risco (escalonamento, sintomas, doses altas), considerar dieta líquida nas 24 h anteriores e ultrassom gástrico. Siga o protocolo institucional e **sempre informe o anestesista**.

### 3.5 Neuropatia óptica isquêmica anterior não arterítica (NAION)
Estudos observacionais levantaram o sinal; em 2025, o comitê de farmacovigilância da EMA concluiu que NAION é um **efeito adverso muito raro** da semaglutida. Oriente o paciente a procurar atendimento em caso de perda visual súbita.

### 3.6 Retinopatia diabética
SUSTAIN-6 mostrou piora de complicações retinianas (HR 1,76), associada à queda rápida da HbA1c em quem já tinha retinopatia. Faça **fundoscopia basal** em diabéticos e acompanhe.

### 3.7 Saúde mental
Agências regulatórias revisaram sinais de ideação suicida e não encontraram relação causal. Ainda assim, triagem de humor e de transtornos alimentares é boa prática — especialmente para evitar uso em quem tem anorexia ou bulimia.

### 3.8 Hipoglicemia
Rara em monoterapia. Ao associar a sulfonilureia ou insulina, **reduzir proativamente** essas doses (ex.: insulina basal −10–20% se HbA1c < 8%).

## 4. Contraindicações e cautelas

| Situação | Conduta |
|---|---|
| CMT pessoal/familiar, NEM2 | **Contraindicado** |
| Gestação | **Suspender** ≥ 2 meses antes da concepção (semaglutida) |
| Lactação | Evitar |
| Pancreatite prévia | Evitar |
| Gastroparesia grave | Evitar |
| Retinopatia proliferativa não tratada | Tratar e acompanhar antes |
| Transtorno alimentar ativo | Não iniciar |
| Anticoncepcional oral + tirzepatida | Orientar método adicional por 4 semanas após início e a cada escalonamento |

## 5. Massa magra: o tema que define a qualidade do tratamento

Subestudos com DEXA mostram que a massa magra responde por **~25% (SURMOUNT-1) a ~39% (STEP 1)** do peso total perdido. A massa magra inclui água, órgãos e músculo — não é sinônimo de músculo esquelético, e a proporção relativa de massa magra corporal geralmente **melhora**. Porém, em idosos, sarcopênicos e mulheres na pós-menopausa, a perda absoluta pode comprometer força, função e densidade óssea.

**Protocolo de preservação muscular:**
1. **Avaliação basal**: composição corporal (bioimpedância ou DEXA), força de preensão manual, teste de sentar-levantar, SARC-F.
2. **Proteína**: 1,2–1,6 g/kg/dia de peso ajustado, distribuída em ≥ 25–30 g por refeição, priorizando fontes ricas em leucina. Pacientes com DRC exigem individualização.
3. **Treino resistido**: 2–3 vezes por semana, progressivo, envolvendo grandes grupos musculares. É a intervenção com melhor evidência para preservar massa e função durante perda ponderal.
4. **Velocidade**: perdas > 1% do peso por semana de forma sustentada aumentam risco de sarcopenia e colelitíase — considere desacelerar a titulação.
5. **Reavaliar a cada 3 meses**, ajustando dose, dieta e treino.

Moléculas desenhadas para preservar músculo (ex.: anticorpos anti-miostatina/activina como bimagrumabe) estão em investigação em combinação com agonistas incretínicos — ainda sem registro.

## 6. O reganho após suspensão

Os ensaios de retirada (STEP 1 extensão, STEP 4, SURMOUNT-4) mostram que a interrupção leva a recuperação de grande parte do peso em 1 ano. Explique isso **antes** de começar. Estratégias de descontinuação (redução gradual de dose, intervalos maiores) ainda carecem de ensaios robustos.`,
  clinicalCase: {
    title: "A professora de 67 anos",
    vignette: "Mulher de 67 anos, IMC 33, DM2, osteopenia, sedentária, em tirzepatida 10 mg há 7 meses. Perdeu 16 kg e está satisfeita, mas refere cansaço para subir escadas e dificuldade para levantar da cadeira sem apoio. Ingestão proteica estimada em 0,7 g/kg/dia.",
    data: [
      { label: "Perda de peso", value: "−16 kg (17%)" },
      { label: "Preensão manual", value: "15 kg" },
      { label: "Sentar-levantar 5×", value: "17 s" },
      { label: "HbA1c", value: "6,1%" },
      { label: "Vit. D", value: "18 ng/mL" },
      { label: "TFGe", value: "68 mL/min" },
    ],
    question: "Qual a conduta mais completa?",
    options: [
      { label: "Escalonar para 15 mg para atingir IMC < 25.", correct: false, rationale: "Ignora sinais de sarcopenia (preensão < 16 kg e sentar-levantar > 15 s, critérios EWGSOP2). Acelerar perda pioraria a função." },
      { label: "Manter ou reduzir dose, prescrever proteína ~1,2–1,5 g/kg/dia, treino resistido supervisionado, corrigir vitamina D e reavaliar força e composição em 3 meses.", correct: true, rationale: "Critérios de provável sarcopenia presentes. A prioridade passa a ser função muscular e óssea, com o peso como objetivo secundário." },
      { label: "Suspender tirzepatida imediatamente.", correct: false, rationale: "Levaria a reganho de peso e piora glicêmica; a conduta é ajustar, não interromper." },
      { label: "Prescrever suplemento de colágeno e manter.", correct: false, rationale: "Colágeno tem baixo teor de leucina e não substitui proteína de alto valor biológico nem treino resistido." },
    ],
    teaching: `**Sucesso não é só o número na balança.** Em idosos, função muscular define desfecho.

- **EWGSOP2:** preensão < 16 kg (mulher) ou sentar-levantar 5× > 15 s = provável sarcopenia.
- Proteína distribuída + treino resistido é a combinação com melhor evidência.
- Considere DEXA para avaliar massa magra apendicular e densidade óssea.`,
    reward: 50,
  },
  quickRef: `### Contraindicações absolutas
- CMT pessoal/familiar · NEM2
- Gestação (suspender ≥ 2 meses antes — semaglutida)

### Sinais de alarme → suspender e investigar
- Dor abdominal intensa em faixa (pancreatite)
- Dor em HD + febre (colecistite)
- Vômitos persistentes + oligúria (LRA)
- Perda visual súbita (NAION)

### Preservação muscular
- Proteína **1,2–1,6 g/kg/dia**, ≥ 25–30 g/refeição
- Treino resistido **2–3×/sem**
- Perda > 1%/semana sustentada → desacelerar

### Perioperatório
Informar anestesista · alto risco: dieta líquida 24 h · seguir protocolo institucional

### Tirzepatida + ACO
Método adicional 4 sem após início e cada escalonamento`,
};

/* Aula 6 — Secretagogos de GH */
export const lesson6: RichLesson = {
  slides: [
    { kind: "title", eyebrow: "Módulo 3 · Eixo do GH", title: "Secretagogos de GH", subtitle: "Tesamorelina tem evidência. CJC-1295 e ipamorelina têm marketing. Saiba separar." },
    { kind: "flow", title: "Duas vias para o mesmo eixo", steps: [
      { label: "Análogos de GHRH", detail: "Tesamorelina, sermorelina, CJC-1295 → GHRH-R" },
      { label: "GHRPs / grelinomiméticos", detail: "Ipamorelina, GHRP-2/6, hexarelina → GHS-R1a" },
      { label: "Hipófise", detail: "Pulso de GH (sinergia entre as vias)" },
      { label: "Fígado", detail: "IGF-1 (marcador substituto)" },
      { label: "Retroalimentação", detail: "Somatostatina e IGF-1 limitam o eixo" },
    ] },
    { kind: "table", title: "O que cada molécula realmente tem", head: ["Molécula", "Evidência", "Status"], rows: [
      ["Tesamorelina", "ECRs fase 3: ↓ gordura visceral em HIV", "FDA (Egrifta) · sem registro no Brasil"],
      ["Sermorelina", "Uso diagnóstico/pediátrico histórico", "Retirada do mercado nos EUA (2008)"],
      ["CJC-1295 (DAC)", "Fase 1: ↑ GH e IGF-1, t½ ~6–8 dias", "Desenvolvimento interrompido · FDA Cat. 2"],
      ["Ipamorelina", "Fase 2 em íleo pós-operatório (sem eficácia)", "Sem registro · FDA Cat. 2"],
      ["MK-677 (ibutamoren)", "Oral, não peptídico; ↑ IGF-1, ↑ glicemia", "Sem registro"],
    ] },
    { kind: "bars", title: "Tesamorelina: gordura visceral em 26 semanas", unit: "%", bars: [
      { label: "Placebo", value: 5.0 },
      { label: "Tesamorelina 2 mg/dia", value: -15.2, highlight: true },
    ], source: "Falutz et al., NEJM 2007 — lipodistrofia associada ao HIV" },
    { kind: "split", title: "Substituto × desfecho", left: { label: "O que se mede", items: ["↑ GH e IGF-1", "↓ gordura visceral (TC)", "↓ gordura hepática"] }, right: { label: "O que não se demonstrou (fora do HIV)", items: ["Ganho de força ou função", "Longevidade / “anti-aging”", "Redução de eventos clínicos", "Segurança oncológica de longo prazo"] } },
    { kind: "bullets", title: "Riscos de elevar IGF-1 cronicamente", bullets: [
      "Resistência à insulina e hiperglicemia (especialmente MK-677 e GHRPs).",
      "Retenção hídrica, edema, artralgia, síndrome do túnel do carpo.",
      "Hipótese oncológica: IGF-1 elevado associa-se a câncer de próstata, mama e colorretal em coortes.",
      "GHRP-2/6: elevam cortisol e prolactina; GHRP-6 aumenta fome.",
      "Produtos irregulares: pureza, endotoxinas e dose real desconhecidas.",
    ] },
    { kind: "pearl", title: "Para o consultório", text: "Deficiência de GH no adulto se diagnostica com teste de estímulo e se trata com somatropina registrada — não com peptídeo de internet.", source: "Endocrine Society, 2011 · AACE, 2019" },
  ],
  monograph: `## 1. O eixo somatotrófico em uma página

O GH é secretado pela hipófise em **pulsos**, sobretudo no sono de ondas lentas, sob controle de dois estímulos e um freio:

- **GHRH** (hipotálamo) → receptor GHRH-R nos somatotrofos → ↑ síntese e secreção;
- **Grelina** (estômago) e GHRPs sintéticos → receptor **GHS-R1a** → amplificação do pulso e inibição funcional da somatostatina;
- **Somatostatina** → freio inibitório.

O GH age diretamente (lipólise, anti-insulínico) e via **IGF-1** hepático (anabólico, crescimento). O IGF-1 retroalimenta negativamente hipotálamo e hipófise. Com o envelhecimento, a secreção de GH cai cerca de 14% por década após os 30 anos — a chamada **somatopausa**, um fenômeno fisiológico e **não** uma doença a ser tratada rotineiramente.

## 2. Tesamorelina — a molécula com evidência

Análogo estabilizado do GHRH(1-44) com grupo trans-3-hexenoil no N-terminal, resistente à DPP-4. Aprovado pelo FDA em 2010 (Egrifta) para **redução de excesso de gordura abdominal em pacientes com HIV e lipodistrofia**.

**Evidência:**
- Falutz et al. (NEJM 2007): 2 mg/dia SC por 26 semanas, gordura visceral **−15,2% vs +5,0%** no placebo; melhora de triglicerídeos e relação colesterol total/HDL.
- Estudos em esteatose hepática associada ao HIV (Stanley et al., Lancet HIV 2019): redução de gordura hepática e menor progressão de fibrose.
- **Efeito se perde após suspensão**: a gordura visceral retorna.

**Limitações:**
- Indicação estreita (HIV com lipodistrofia).
- Não há evidência de benefício em força, função ou longevidade na população geral.
- Pode elevar glicemia; IGF-1 deve ser monitorado, com ajuste ou suspensão se persistentemente elevado.
- **Não registrada no Brasil.** Importação excepcional exige fundamento clínico robusto.

## 3. CJC-1295 — a promessa interrompida

Análogo de GHRH(1-29) com modificações e, na versão com **DAC** (drug affinity complex), um grupo reativo que se liga covalentemente à albumina, prolongando a meia-vida para **5,8–8,1 dias**.

Teichman et al. (JCEM 2006), fase 1 em adultos saudáveis: aumentos dose-dependentes de GH (2 a 10×, por ≥ 6 dias) e de IGF-1 (1,5 a 3×, por 9–11 dias). Ou seja, demonstrou **farmacologia**, não benefício clínico.

O desenvolvimento para lipodistrofia foi interrompido. Não há ECR de eficácia clínica. Produtos vendidos como “CJC-1295 sem DAC” (mod-GRF 1-29) têm meia-vida de minutos e ainda menos dados. O FDA o incluiu na **Categoria 2** em 2023.

## 4. Ipamorelina e GHRPs

A **ipamorelina** é um pentapeptídeo agonista seletivo do GHS-R1a. Sua seletividade (sem elevação relevante de cortisol e prolactina, ao contrário de GHRP-2 e GHRP-6) é a base do marketing. A evidência clínica, porém, limita-se a estudos de fase 2 em **íleo pós-operatório**, que **não mostraram eficácia** e encerraram o desenvolvimento. Também está na Categoria 2 do FDA.

**GHRP-2 e GHRP-6** elevam cortisol e prolactina; o GHRP-6 aumenta intensamente o apetite. **MK-677 (ibutamoren)** não é peptídeo: é um agonista oral de GHS-R1a que eleva IGF-1 e, em estudos de 1–2 anos, aumentou massa magra sem melhora de força ou função, com **elevação de glicemia, resistência à insulina e insuficiência cardíaca** relatada em idosos frágeis (estudo em fratura de quadril interrompido por sinal de ICC).

## 5. A combinação “CJC + ipa”: anatomia de um protocolo popular

A lógica de combinar análogo de GHRH com GHRP é **fisiologicamente coerente** — há sinergia comprovada sobre o pulso de GH. O problema é tudo o que vem depois:

| Pergunta | Resposta |
|---|---|
| Melhora composição corporal em adultos saudáveis? | Não demonstrado em ECR |
| Melhora força, recuperação, sono, libido? | Não demonstrado em ECR |
| Segurança de longo prazo? | Desconhecida |
| Produto regular? | Não (sem registro, FDA Cat. 2) |
| Permitido no esporte? | Não (WADA S2) |

## 6. A hipótese oncológica

Coortes e estudos de randomização mendeliana associam **IGF-1 cronicamente elevado** a maior risco de câncer de próstata, mama e colorretal. Pacientes com deficiência congênita do receptor de GH (síndrome de Laron) têm incidência muito baixa de câncer. Isso não prova causalidade para secretagogos, mas impõe cautela: **não eleve IGF-1 sem indicação**, e nunca em história de neoplasia ativa.

## 7. Quando o eixo do GH realmente precisa ser tratado

**Deficiência de GH do adulto** é diagnóstico endocrinológico, em geral com doença hipotálamo-hipofisária conhecida, confirmado por **teste de estímulo** (tolerância à insulina, glucagon ou macimorelina). IGF-1 baixo isolado não confirma, e IGF-1 normal não exclui. O tratamento é **somatropina registrada**, titulada para IGF-1 na faixa normal para idade e sexo.

Use a tesamorelina como referência mental: mesmo a molécula com melhor evidência tem indicação estreita, benefício que reverte após suspensão e necessidade de monitoramento. Tudo o que tem menos evidência deve ser tratado com mais cautela, não menos.`,
  clinicalCase: {
    title: "O empresário de 49 anos",
    vignette: "Homem de 49 anos, saudável, treina 4×/semana. Traz exame com IGF-1 de 142 ng/mL (referência para idade 90–250) e um protocolo de clínica de “longevidade”: CJC-1295 sem DAC + ipamorelina 300 mcg à noite, 5×/semana, por 6 meses. Pede sua opinião e prescrição.",
    data: [
      { label: "IGF-1", value: "142 ng/mL (normal)" },
      { label: "Glicemia", value: "98 mg/dL" },
      { label: "HbA1c", value: "5,6%" },
      { label: "PSA", value: "1,1 ng/mL" },
      { label: "Hipófise", value: "Sem doença conhecida" },
      { label: "Pai", value: "Câncer de próstata aos 62" },
    ],
    question: "Qual a conduta mais adequada?",
    options: [
      { label: "Prescrever o protocolo, pois IGF-1 está na metade inferior da faixa e há sinergia entre as vias.", correct: false, rationale: "IGF-1 normal não é indicação; sinergia farmacológica não equivale a benefício clínico. Produtos irregulares e histórico familiar de câncer de próstata agravam a decisão." },
      { label: "Não prescrever: sem deficiência de GH, sem evidência de benefício, produtos sem registro (FDA Cat. 2) e risco teórico com IGF-1 elevado em quem tem pai com câncer de próstata. Focar em sono, treino e nutrição.", correct: true, rationale: "Análise completa nas quatro dimensões: indicação, evidência, regulação e risco individual. Oferecer alternativas efetivas mantém o vínculo." },
      { label: "Prescrever somatropina em dose baixa por ser registrada.", correct: false, rationale: "Somatropina registrada exige diagnóstico de deficiência por teste de estímulo; uso “anti-aging” é fora de indicação e sem benefício demonstrado." },
      { label: "Liberar se ele mantiver IGF-1 abaixo de 300 ng/mL.", correct: false, rationale: "Estabelecer um teto não transforma uso sem indicação em uso indicado, nem resolve a procedência do produto." },
    ],
    teaching: `**IGF-1 é um número, não um diagnóstico.** Somatopausa é fisiológica.

- Deficiência de GH do adulto exige doença hipofisária + teste de estímulo.
- Histórico familiar de câncer de próstata é razão adicional para não elevar IGF-1.
- O que melhora composição corporal neste perfil: sono de qualidade, treino resistido periodizado, proteína adequada.`,
    reward: 50,
  },
  quickRef: `### Status em uma linha
| Molécula | Evidência | Pode prescrever? |
|---|---|---|
| Tesamorelina | A (HIV-lipodistrofia) | Só na indicação; sem registro BR |
| CJC-1295 | C (fase 1) | **Não** |
| Ipamorelina | C (fase 2 negativa) | **Não** |
| GHRP-2/6 | C | **Não** |
| MK-677 | B–C, ↑ glicemia | **Não** |
| Somatropina | A (DGH confirmada) | Sim, com teste de estímulo |

### Diagnóstico de DGH no adulto
Doença hipotálamo-hipofisária + **teste de estímulo** (ITT, glucagon, macimorelina)

### Monitorar se em uso de análogo do eixo
IGF-1 · glicemia/HbA1c · edema/artralgia · PSA (homens)

### Esporte
Todos proibidos — WADA S2`,
};
