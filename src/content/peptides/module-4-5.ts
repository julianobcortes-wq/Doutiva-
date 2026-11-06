import type { RichLesson } from "../lesson-types";

/* Aula 7 — BPC-157, TB-500 e GHK-Cu */
export const lesson7: RichLesson = {
  slides: [
    { kind: "title", eyebrow: "Módulo 4 · Reparo tecidual", title: "Peptídeos regenerativos", subtitle: "BPC-157, TB-500 e GHK-Cu: leitura crítica da evidência que alimenta as redes sociais." },
    { kind: "bars", title: "Onde está a evidência do BPC-157", unit: "", bars: [
      { label: "Estudos pré-clínicos", value: 100, highlight: true },
      { label: "ECRs em humanos", value: 0 },
    ], source: "Revisões sistemáticas 2023–2025", note: "Escala ilustrativa: literatura pré-clínica numerosa (majoritariamente de um único grupo), estudos humanos limitados a séries pequenas e piloto de segurança." },
    { kind: "table", title: "As três moléculas", head: ["", "BPC-157", "TB-500", "GHK-Cu"], rows: [
      ["Estrutura", "15 aa (fragmento de proteína gástrica)", "Fragmento sintético da timosina β4", "Tripeptídeo Gly-His-Lys + Cu²⁺"],
      ["Mecanismo proposto", "Angiogênese (VEGFR2), NO, FAK-paxilina", "Actina G, migração celular", "Síntese de colágeno, remodelamento"],
      ["Melhor evidência", "Roedores", "Timosina β4 completa: tópico/oftálmico", "Tópico: estudos pequenos em pele"],
      ["Status", "Sem registro · FDA Cat. 2 · WADA S0", "Sem registro · FDA Cat. 2 · WADA S2", "Cosmético tópico; injetável sem dados"],
    ] },
    { kind: "split", title: "O que os roedores mostram × o que falta", left: { label: "Pré-clínico", items: ["Cicatrização de tendão, músculo e ligamento", "Proteção de mucosa gastrointestinal", "Efeitos vasculares e sobre NO"] }, right: { label: "Lacunas em humanos", items: ["Sem ECR controlado em lesão musculoesquelética", "Farmacocinética humana mal descrita", "Replicação independente escassa", "Segurança oncológica (angiogênese) desconhecida"] } },
    { kind: "bullets", title: "Por que viralizaram", bullets: [
      "Relatos de recuperação rápida de tendinopatias por atletas e influenciadores.",
      "Acesso fácil a frascos “research use only” por preços baixos.",
      "Narrativa de “peptídeo natural do próprio corpo”.",
      "Efeito placebo e história natural favorável de lesões tendíneas.",
    ], note: "Tendinopatias melhoram espontaneamente em boa parte dos casos em semanas a meses — o que confunde relatos sem controle." },
    { kind: "flow", title: "Roteiro de conversa com o paciente", steps: [
      { label: "Escutar", detail: "O que ele leu, o que espera" },
      { label: "Informar", detail: "Evidência D, produto irregular" },
      { label: "Riscos", detail: "Contaminação, angiogênese, doping" },
      { label: "Alternativa", detail: "Carga progressiva, fisioterapia, PRP com critério" },
      { label: "Documentar", detail: "Prontuário com orientação" },
    ] },
    { kind: "pearl", title: "Para o consultório", text: "Seu papel não é ser contra o peptídeo. É ser a voz mais bem informada da conversa.", source: "Doutiva · Princípio 7" },
  ],
  monograph: `## 1. O fenômeno

Nenhuma classe de peptídeos cresceu tanto em redes sociais com tão pouca evidência humana quanto os chamados **peptídeos regenerativos**. Pacientes chegam ao consultório com protocolos prontos, frascos comprados online e expectativas de recuperação de lesões em poucas semanas. O médico precisa dominar esta literatura justamente para **conversar com autoridade** — sem desdém e sem complacência.

## 2. BPC-157

### Origem e química
Pentadecapeptídeo (15 aminoácidos) derivado de uma sequência de uma proteína do suco gástrico humano (“body protection compound”). É notavelmente estável em suco gástrico, o que motivou estudos por via oral em animais.

### Mecanismos propostos (pré-clínico)
- Ativação de **VEGFR2** e angiogênese;
- Modulação do sistema do **óxido nítrico**;
- Ativação da via **FAK-paxilina** e migração de fibroblastos tendíneos;
- Aumento da expressão de receptores de GH em fibroblastos de tendão.

### Evidência
- **Centenas de estudos em roedores**: cicatrização de tendão, ligamento, músculo, osso, mucosa gastrointestinal, efeitos vasculares e neuroprotetores.
- A grande maioria vem de **um único grupo de pesquisa** (Zagreb, Croácia), com pouca replicação independente — fragilidade metodológica relevante.
- **Humanos**: uma série retrospectiva pequena de injeção intra-articular em dor de joelho, sem grupo controle; um piloto de segurança intravenosa com pouquíssimos participantes; estudos de fase 1/2 iniciados para colite que não resultaram em publicações de eficácia robustas.
- **Não há ensaio clínico randomizado controlado publicado** demonstrando eficácia em lesão musculoesquelética em humanos.

### Riscos e incertezas
- **Angiogênese é faca de dois gumes**: em paciente com neoplasia oculta, estimular VEGFR2 é teoricamente indesejável. Não há dados de segurança oncológica.
- **Farmacocinética humana mal caracterizada** — dose, via e intervalo dos protocolos populares são extrapolações de roedores.
- **Qualidade do produto**: frascos “research use only” sem garantia de identidade, pureza, esterilidade e endotoxinas.
- **Regulatório**: sem registro na ANVISA; FDA Categoria 2 (2023); WADA classe **S0** (substância não aprovada), proibido em qualquer momento.

## 3. TB-500

### O que é
Comercialmente, “TB-500” designa um **fragmento sintético** da **timosina β4** (Tβ4), uma proteína de 43 aminoácidos que sequestra actina G e regula migração celular, angiogênese e inflamação. Frequentemente o fragmento corresponde à região ativa de ligação à actina (sequência LKKTETQ).

### Evidência
- **Timosina β4 completa** foi estudada em humanos em formulações **tópica e oftálmica** (feridas, úlceras, olho seco/ceratopatia neurotrófica), com resultados modestos e programas que não levaram a registro amplo.
- Para o **fragmento TB-500 injetável sistêmico**, não há ensaios clínicos humanos de eficácia publicados.
- Uso disseminado em **medicina veterinária equina** — e detecções em controles antidopagem de cavalos de corrida e atletas.

### Status
Sem registro; FDA Categoria 2; **WADA S2**.

## 4. GHK-Cu

### O que é
Tripeptídeo **glicil-histidil-lisina** com alta afinidade por cobre (Cu²⁺), identificado no plasma humano por Pickart em 1973. Níveis plasmáticos caem com a idade.

### Evidência
- **Tópico**: estudos pequenos e alguns controlados em dermatologia cosmética sugerem melhora de textura, firmeza, linhas finas e cicatrização — magnitude modesta, frequentemente financiados pela indústria cosmética. É, entre as três moléculas, a de **melhor base**, e restrita ao uso **tópico**.
- **In vitro**: modula expressão de grande número de genes relacionados a remodelamento tecidual, síntese de colágeno e elastina, e antioxidantes.
- **Injetável**: não há estudos clínicos de eficácia e segurança. Cobre livre em excesso tem toxicidade conhecida.

## 5. Por que relatos enganam

1. **História natural**: tendinopatias e lesões musculares melhoram espontaneamente em grande proporção de casos ao longo de semanas a meses.
2. **Regressão à média**: pacientes procuram tratamento no pico dos sintomas.
3. **Cointervenções**: quem usa BPC-157 geralmente também reduz carga, faz fisioterapia e repouso.
4. **Viés de publicação social**: quem não melhorou não posta.
5. **Placebo em dor**: efeito substancial, especialmente com procedimentos injetáveis.

## 6. Como conduzir a conversa

O médico que ridiculariza o paciente o perde para o influenciador. O médico que prescreve perde a credibilidade técnica e se expõe juridicamente. O caminho Doutiva:

1. **Escute** o que ele leu e o que espera.
2. **Informe com precisão**: “há muitos estudos em animais, mas nenhum ensaio controlado em humanos para sua lesão”.
3. **Explique o risco do produto**: procedência, contaminação, dose real desconhecida, doping.
4. **Ofereça o que tem evidência**: para tendinopatia, **carga progressiva** (excêntrica/isométrica/pesada lenta) é a base; ondas de choque e PRP em indicações selecionadas, com evidência variável; correção de fatores de risco.
5. **Documente** a orientação em prontuário.

## 7. Perspectiva honesta

A biologia desses peptídeos é **interessante** e pode, no futuro, resultar em terapias reais. A postura científica correta é: **hipótese promissora, evidência insuficiente, produto irregular**. Quando ECRs forem publicados, a Doutiva atualizará esta aula.`,
  clinicalCase: {
    title: "O corredor e a tendinopatia",
    vignette: "Homem de 36 anos, maratonista amador que corre provas com controle antidopagem, com tendinopatia de Aquiles média há 10 semanas. Já comprou BPC-157 e TB-500 online e quer que você aplique no tendão no consultório “para fazer do jeito certo”.",
    data: [
      { label: "Dor (EVA)", value: "6/10 ao correr" },
      { label: "VISA-A", value: "52/100" },
      { label: "USG", value: "Espessamento, sem ruptura" },
      { label: "Tratamento prévio", value: "Repouso e AINE" },
      { label: "Fisioterapia", value: "Nunca fez" },
      { label: "Produtos", value: "“Research use only”" },
    ],
    question: "Qual a conduta mais adequada?",
    options: [
      { label: "Aplicar os peptídeos peritendíneos guiados por ultrassom, pois a técnica reduz riscos.", correct: false, rationale: "Técnica correta não resolve produto irregular, ausência de evidência e violação antidopagem. Aplicar no consultório torna o médico corresponsável." },
      { label: "Recusar a aplicação, explicar evidência D, riscos do produto e status WADA; iniciar programa de carga progressiva supervisionado de 12 semanas e documentar.", correct: true, rationale: "Carga progressiva é o tratamento de primeira linha para tendinopatia de Aquiles. A recusa fundamentada e documentada protege paciente e médico." },
      { label: "Infiltrar corticoide no tendão para alívio rápido.", correct: false, rationale: "Corticoide intratendíneo aumenta risco de ruptura do Aquiles e não é recomendado." },
      { label: "Orientar autoaplicação subcutânea, sem aplicar no consultório.", correct: false, rationale: "Orientar a aplicação é participar do uso. Também expõe o atleta a sanção antidopagem." },
    ],
    teaching: `**Tendinopatia de Aquiles: carga é tratamento.**

- Protocolos excêntricos (Alfredson) ou carga pesada lenta por 12 semanas têm a melhor evidência.
- Ajuste de volume de corrida, calçado e fatores de risco.
- BPC-157 = **WADA S0**; TB-500 = **WADA S2** — risco real de suspensão.`,
    reward: 40,
  },
  quickRef: `### Resumo honesto
| | BPC-157 | TB-500 | GHK-Cu |
|---|---|---|---|
| Evidência | D | D (fragmento) | B–C tópico |
| Humanos | Séries pequenas | Tβ4 tópica | Cosmético |
| Registro BR | Não | Não | Cosmético tópico |
| FDA | Cat. 2 | Cat. 2 | — |
| WADA | S0 | S2 | — |

### Frase-chave para o paciente
“Há muitos estudos em animais, mas nenhum ensaio controlado em humanos para a sua lesão — e o produto não tem garantia de pureza.”

### Alternativas com evidência (tendão)
Carga progressiva 12 sem · controle de volume · ondas de choque (selecionados) · PRP (evidência variável)

### Nunca
Corticoide intratendíneo em Aquiles/patelar`,
};

/* Aula 8 — Protocolo de incretina no consultório */
export const lesson8: RichLesson = {
  slides: [
    { kind: "title", eyebrow: "Módulo 5 · Prática clínica", title: "O protocolo de incretina no consultório", subtitle: "Da primeira consulta ao seguimento de longo prazo: seleção, titulação, metas e exames." },
    { kind: "flow", title: "Primeira consulta", steps: [
      { label: "Indicação", detail: "IMC ≥ 30 ou ≥ 27 + comorbidade" },
      { label: "Exclusões", detail: "CMT/NEM2, gestação, pancreatite, TA" },
      { label: "Basal", detail: "Exames + composição corporal" },
      { label: "Escolha", detail: "Molécula conforme perfil e evidência" },
      { label: "TCLE e metas", detail: "Expectativas e plano crônico" },
    ] },
    { kind: "table", title: "Escalonamento — semaglutida SC (obesidade)", head: ["Semanas", "Dose semanal"], rows: [
      ["1–4", "0,25 mg"],
      ["5–8", "0,5 mg"],
      ["9–12", "1,0 mg"],
      ["13–16", "1,7 mg"],
      ["17+", "2,4 mg (manutenção)"],
    ], source: "Bula Wegovy — confirmar versão vigente" },
    { kind: "table", title: "Escalonamento — tirzepatida SC", head: ["Semanas", "Dose semanal"], rows: [
      ["1–4", "2,5 mg (iniciação, não terapêutica)"],
      ["5–8", "5 mg"],
      ["9–12", "7,5 mg (opcional)"],
      ["13–16", "10 mg"],
      ["17–20", "12,5 mg (opcional)"],
      ["21+", "15 mg (máxima)"],
    ], source: "Bula Mounjaro — incrementos de 2,5 mg a cada ≥ 4 semanas" },
    { kind: "table", title: "Qual molécula para qual paciente", head: ["Perfil", "Preferência baseada em evidência"], rows: [
      ["DCV estabelecida sem DM", "Semaglutida 2,4 mg (SELECT)"],
      ["DM2 + DRC", "Semaglutida 1,0 mg (FLOW)"],
      ["Maior magnitude de perda", "Tirzepatida (SURMOUNT-5)"],
      ["AOS moderada-grave", "Tirzepatida (SURMOUNT-OSA)"],
      ["ICFEp + obesidade", "Semaglutida (STEP-HFpEF) ou tirzepatida (SUMMIT)"],
      ["Aversão a injetável", "Semaglutida oral"],
    ] },
    { kind: "bullets", title: "Metas e critérios de resposta", bullets: [
      "Resposta adequada: ≥ 5% de perda em 12 semanas na dose de manutenção.",
      "Meta clínica: 10–15% para remissão de comorbidades; ≥ 15% em AOS, MASH e DM2 recente.",
      "Não respondedor: revisar adesão, dose, medicamentos obesogênicos, ingestão; considerar troca.",
      "Manutenção: tratamento crônico; discutir reganho antes de suspender.",
    ] },
    { kind: "pearl", title: "Para o consultório", text: "O protocolo não é a dose. É indicação, metas, preservação muscular, monitoramento e plano de longo prazo — escritos em prontuário.", source: "Doutiva · Princípio 8" },
  ],
  monograph: `## 1. Objetivo desta aula

Transformar a evidência dos módulos anteriores em um **protocolo reprodutível** de consultório, com documentação que resista a auditoria clínica e jurídica.

## 2. Seleção do paciente

### Indicação (bulas para obesidade)
- **IMC ≥ 30 kg/m²**, ou
- **IMC ≥ 27 kg/m²** com ao menos uma comorbidade relacionada ao peso (hipertensão, dislipidemia, pré-diabetes/DM2, AOS, DCV, esteatose, OA).

Considere também adiposidade central (circunferência abdominal, relação cintura/estatura > 0,5) e o conceito de **obesidade clínica** proposto pela comissão do Lancet (2025), que valoriza disfunção orgânica e limitação funcional além do IMC.

### Exclusões e cautelas — checklist
- [ ] Carcinoma medular de tireoide pessoal/familiar ou NEM2
- [ ] Gestação, planejamento de gestação ou lactação
- [ ] Pancreatite prévia
- [ ] Gastroparesia grave
- [ ] Retinopatia diabética proliferativa não tratada
- [ ] Transtorno alimentar ativo (anorexia, bulimia)
- [ ] Uso de sulfonilureia/insulina (ajustar dose)
- [ ] Anticoncepcional oral (tirzepatida: método adicional)
- [ ] Procedimento com sedação programado

## 3. Avaliação basal

| Domínio | Exames/medidas |
|---|---|
| Antropometria | Peso, IMC, circunferência abdominal, PA, FC |
| Composição corporal | Bioimpedância ou DEXA; força de preensão; sentar-levantar |
| Glicemia | Glicemia de jejum, HbA1c |
| Lipídios | Perfil lipídico |
| Rim | Creatinina/TFGe, relação albumina/creatinina urinária |
| Fígado | TGO, TGP, GGT; FIB-4 se esteatose |
| Outros | TSH, vitamina B12 (se metformina), vitamina D, ferritina |
| Diabéticos | Fundoscopia |
| Comorbidades | Rastreio de AOS (STOP-Bang), humor (PHQ-9), comportamento alimentar |

Calcitonina e lipase de rotina **não são recomendadas** pelas bulas; solicite conforme contexto clínico.

## 4. Escolha da molécula

A escolha deve partir do **desfecho mais relevante para o paciente**:

- **Prevenção cardiovascular secundária sem DM**: semaglutida 2,4 mg (SELECT).
- **DM2 com doença renal crônica**: semaglutida 1,0 mg (FLOW) — associada a iSGLT2 conforme diretrizes.
- **Maior perda ponderal**: tirzepatida (SURMOUNT-1 e -5).
- **Apneia obstrutiva moderada-grave**: tirzepatida (SURMOUNT-OSA).
- **ICFEp com obesidade**: semaglutida (STEP-HFpEF) ou tirzepatida (SUMMIT).
- **Preferência por via oral**: semaglutida oral, com regras rígidas de administração.

Custo, disponibilidade e cobertura devem ser discutidos — tratamento que o paciente não sustenta não produz resultado.

## 5. Titulação

### Semaglutida SC (obesidade)
0,25 → 0,5 → 1,0 → 1,7 → **2,4 mg/semana**, a cada 4 semanas.

### Tirzepatida SC
**2,5 mg** por 4 semanas (dose de iniciação), depois aumentos de **2,5 mg a cada ≥ 4 semanas** até 5–15 mg conforme resposta e tolerância.

### Regras de titulação
- Não escalonar se houver intolerância relevante: manter a dose por mais 4 semanas.
- Se intolerância persistir, retornar à dose anterior; muitos pacientes respondem bem em doses intermediárias.
- **Doses esquecidas**: semaglutida — aplicar se faltarem > 2 dias para a próxima; tirzepatida — aplicar em até 4 dias após a data. Após **≥ 2 semanas** sem uso, considerar reiniciar em dose menor.
- Aplicação no mesmo dia da semana, abdome, coxa ou braço, com rodízio.

### Ajuste de medicamentos concomitantes
- **Sulfonilureia**: reduzir ou suspender.
- **Insulina basal**: reduzir 10–20% se HbA1c < 8%.
- **Anti-hipertensivos**: reavaliar com a perda de peso.
- **Levotiroxina**: monitorar TSH (absorção e peso).

## 6. Intervenção não farmacológica obrigatória

1. **Proteína**: 1,2–1,6 g/kg/dia de peso ajustado, distribuída.
2. **Treino resistido**: 2–3×/semana; aeróbico conforme tolerância.
3. **Hidratação e fibras**.
4. **Sono e saúde mental**.
5. **Nutricionista** e, quando possível, educador físico na equipe.

## 7. Seguimento

| Momento | Avaliar |
|---|---|
| Cada escalonamento (4 sem) | Tolerância, adesão, peso, PA, FC, sinais de alarme |
| 12 semanas na dose de manutenção | Critério de resposta (≥ 5%) |
| A cada 3 meses | Composição corporal, força, exames metabólicos |
| Anual | Exames completos, fundoscopia (DM), reavaliação de metas |

**Não respondedor** (< 5% em 12 semanas na dose de manutenção): revisar adesão, técnica de aplicação, ingestão, medicamentos obesogênicos (antipsicóticos, corticoides, alguns antidepressivos), condições endócrinas; considerar troca de molécula ou associação com outras estratégias, incluindo avaliação para cirurgia metabólica.

## 8. Documentação e consentimento

O prontuário deve conter: indicação, exclusões verificadas, molécula e racional, metas, plano de titulação, orientações nutricionais e de treino, riscos discutidos e **TCLE** (obrigatório se off-label, recomendável sempre). Lembre-se da **retenção de receita** exigida pela ANVISA para agonistas de GLP-1.

## 9. Ética e modelo de clínica

- Preço do acompanhamento deve refletir consultas, equipe e monitoramento — não “pacotes de dose”.
- É vedado ao médico vender medicamento ou ter vínculo comercial com farmácia que comprometa a autonomia do paciente.
- Publicidade deve seguir as regras do CFM: sem antes/depois sensacionalista, sem promessa de resultado.

Um protocolo bem documentado é, ao mesmo tempo, **melhor medicina** e **melhor proteção profissional**.`,
  clinicalCase: {
    title: "A não respondedora",
    vignette: "Mulher de 39 anos, IMC 36, SOP, em semaglutida 2,4 mg há 16 semanas (12 na dose de manutenção). Perdeu 3,2% do peso. Usa quetiapina 100 mg à noite para insônia há 2 anos, prescrita por outro colega. Aplica corretamente; relata beliscar à noite.",
    data: [
      { label: "Peso inicial", value: "98 kg" },
      { label: "Peso atual", value: "94,9 kg (−3,2%)" },
      { label: "HbA1c", value: "5,9%" },
      { label: "TSH", value: "2,1 mUI/L" },
      { label: "Sono", value: "Insônia de manutenção" },
      { label: "Medicação", value: "Quetiapina 100 mg" },
    ],
    question: "Qual o próximo passo mais adequado?",
    options: [
      { label: "Dobrar a dose de semaglutida para 4,8 mg.", correct: false, rationale: "Dose acima da bula, sem amparo regulatório no Brasil; não aborda a causa provável da baixa resposta." },
      { label: "Considerá-la não respondedora, revisar com o prescritor a quetiapina (fármaco obesogênico) e o manejo da insônia, abordar comportamento alimentar noturno e considerar troca para tirzepatida.", correct: true, rationale: "< 5% em 12 semanas na dose de manutenção define baixa resposta. Medicamentos obesogênicos e comportamento alimentar devem ser revisados antes ou junto da troca de molécula." },
      { label: "Suspender o tratamento: obesidade dela não responde a fármacos.", correct: false, rationale: "Há fatores modificáveis e alternativa farmacológica com maior magnitude de efeito." },
      { label: "Associar BPC-157 para potencializar.", correct: false, rationale: "Sem evidência, sem registro e sem racional para perda ponderal." },
    ],
    teaching: `**Baixa resposta = investigar antes de trocar.**

1. Adesão e técnica
2. **Fármacos obesogênicos** (antipsicóticos, corticoides, alguns antidepressivos, insulina)
3. Comportamento alimentar e sono
4. Condições endócrinas
5. Troca de molécula ou cirurgia metabólica

Coordene com o colega que prescreveu a quetiapina — insônia tem alternativas (TCC-I, por exemplo).`,
    reward: 50,
  },
  quickRef: `### Indicação
IMC ≥ 30 **ou** ≥ 27 + comorbidade

### Titulação
**Semaglutida:** 0,25 → 0,5 → 1,0 → 1,7 → 2,4 mg (4/4 sem)
**Tirzepatida:** 2,5 → 5 → 7,5 → 10 → 12,5 → 15 mg (≥ 4/4 sem)

### Basal
Peso · CA · PA · FC · bioimpedância/DEXA · preensão · glicemia · HbA1c · lipídios · TFGe · RAC · TGO/TGP · TSH · B12 · vit D · fundoscopia (DM)

### Resposta
≥ 5% em 12 sem na manutenção · meta 10–15%

### Ajustar
Sulfonilureia ↓ · insulina basal −10–20% · anti-hipertensivos

### Doses esquecidas
Sema: > 2 dias até a próxima → aplicar · Tirz: até 4 dias → aplicar · ≥ 2 sem → reiniciar menor

### Prontuário
Indicação · exclusões · racional · metas · TCLE · receita retida`,
};

/* Aula 9 — Casos clínicos integrados */
export const lesson9: RichLesson = {
  slides: [
    { kind: "title", eyebrow: "Módulo 5 · Prática clínica", title: "Casos clínicos integrados", subtitle: "Raciocínio completo: indicação, evidência, regulação, segurança e plano de longo prazo." },
    { kind: "flow", title: "O método Doutiva de decisão", steps: [
      { label: "Indicação", detail: "Há doença? Há critério?" },
      { label: "Evidência", detail: "Nível A, B, C ou D?" },
      { label: "Regulação", detail: "Registro, off-label, irregular?" },
      { label: "Segurança", detail: "Contraindicações e riscos individuais" },
      { label: "Plano", detail: "Metas, monitoramento, prontuário" },
    ] },
    { kind: "table", title: "Os casos desta aula", head: ["Caso", "Tema central"], rows: [
      ["1. Executivo pós-IAM", "Prevenção CV secundária (SELECT)"],
      ["2. Mulher com DM2 + DRC", "Proteção renal (FLOW) + iSGLT2"],
      ["3. Planejamento de gestação", "Suspensão e contracepção"],
      ["4. Pedido de “stack” de peptídeos", "Classificação e recusa fundamentada"],
    ] },
    { kind: "bullets", title: "Erros que derrubam o médico", bullets: [
      "Iniciar sem checar CMT/NEM2 e gestação.",
      "Escalonar rápido demais e perder o paciente por intolerância.",
      "Esquecer de reduzir sulfonilureia/insulina.",
      "Não prescrever proteína e treino de força.",
      "Prescrever ou orientar produto “research use only”.",
      "Não documentar TCLE e orientações.",
    ] },
    { kind: "pearl", title: "Encerramento", text: "Excelência em medicina de peptídeos é dizer sim com rigor e não com elegância.", source: "Doutiva" },
  ],
  monograph: `## Como usar esta aula

Cada caso abaixo aplica o **método Doutiva em cinco passos**: indicação → evidência → regulação → segurança → plano. Leia o caso, tente decidir antes de ler a discussão e use o **Tutor IA** para explorar variações (“e se ela tivesse TFG de 25?”). O caso interativo da aba ao lado testa a sua decisão final.

---

## Caso 1 — O executivo pós-infarto

**Homem, 58 anos**, IAM há 8 meses, stent em DA, IMC 31, sem diabetes, LDL 52 mg/dL em estatina de alta potência, FEVE 52%.

**Indicação:** IMC ≥ 27 com DCV estabelecida.
**Evidência:** SELECT — MACE-3 HR 0,80 neste perfil exato. **Nível A**.
**Regulação:** semaglutida 2,4 mg registrada; a indicação cardiovascular foi incorporada à bula em diversas agências — confirme a versão brasileira vigente.
**Segurança:** betabloqueado (FC sobe 2–4 bpm, geralmente sem impacto); dupla antiagregação não interage; atenção a desidratação com IECA.
**Plano:** escalonamento padrão em 16 semanas; proteína e reabilitação cardíaca com treino resistido; reavaliar em 12 semanas na dose de manutenção; explicar caráter crônico.

---

## Caso 2 — DM2 com doença renal crônica

**Mulher, 63 anos**, DM2 há 14 anos, TFGe 42 mL/min, RAC 380 mg/g, HbA1c 8,4%, em metformina 1 g/dia, gliclazida 60 mg e insulina NPH 20 UI à noite. IMC 30.

**Indicação:** DM2 com DRC e controle inadequado.
**Evidência:** **FLOW** — semaglutida 1,0 mg reduziu desfecho renal composto (HR 0,76), MACE e mortalidade. Diretrizes (KDIGO 2024, ADA) recomendam **iSGLT2** como base na DRC com DM2 e agonista de GLP-1 com benefício comprovado como adição.
**Regulação:** uso registrado em DM2.
**Segurança:**
- Suspender ou reduzir **gliclazida**; reduzir insulina NPH 10–20% e monitorar glicemia capilar — risco de hipoglicemia.
- Metformina: dose adequada para TFG 30–45 (máximo 1 g/dia).
- **Fundoscopia antes de iniciar** (retinopatia + queda de HbA1c).
- Orientar hidratação: vômitos podem precipitar LRA.
**Plano:** iSGLT2 + semaglutida com escalonamento até 1,0 mg; RAC e TFGe em 3 meses.

---

## Caso 3 — Planejamento de gestação

**Mulher, 32 anos**, IMC 35, SOP, em tirzepatida 7,5 mg há 5 meses, perdeu 13%. Ciclos voltaram a ser regulares. Usa anticoncepcional oral e deseja engravidar em 6 meses.

**Ponto crítico 1 — fertilidade:** a perda de peso em SOP frequentemente restaura ovulação. Há relatos crescentes de gestações não planejadas em usuárias de agonistas incretínicos.
**Ponto crítico 2 — contracepção:** a tirzepatida pode reduzir a eficácia de **contraceptivos orais** (retardo de esvaziamento gástrico), sobretudo no início e após cada escalonamento. Orientar método adicional ou não oral.
**Ponto crítico 3 — suspensão:** não há dados de segurança na gestação. Para semaglutida, a bula recomenda suspender **pelo menos 2 meses** antes da concepção planejada; para tirzepatida, recomenda-se suspender antes da tentativa, considerando a meia-vida (~5 dias) e dados disponíveis.
**Plano:** manter até ~2 meses antes da tentativa; reforçar contracepção até lá; ácido fólico; planejar manutenção do peso com nutrição e exercício; discutir risco de reganho e diabetes gestacional; retomar após lactação se indicado.

---

## Caso 4 — O pedido de “stack”

**Homem, 44 anos**, saudável, IMC 27,5 sem comorbidades, traz protocolo de clínica: “retatrutida 2 mg + CJC-1295/ipamorelina + BPC-157 para recuperação”. Diz que “todo mundo está usando”.

| Item | Evidência | Regulação | Decisão |
|---|---|---|---|
| Retatrutida | B (fase 2) | **Sem registro — investigacional** | Não |
| CJC-1295 + ipamorelina | C | Sem registro · FDA Cat. 2 | Não |
| BPC-157 | D | Sem registro · FDA Cat. 2 | Não |
| Indicação para antiobesidade | IMC 27,5 sem comorbidade | Fora do critério | Não há |

**Conduta:** recusa fundamentada, sem desdém; explicar categoria a categoria; oferecer avaliação de composição corporal, plano de treino e nutrição, e reavaliação se surgir comorbidade. **Documentar** em prontuário.

**Por que este caso importa:** é o paciente que mais testa a integridade do médico — e o que mais propaga, nas redes, a reputação de quem o atendeu.

---

## Síntese do curso

1. **Classifique antes de dosar.**
2. **Desfecho duro vence substituto.**
3. **Titule devagar; proteja o músculo.**
4. **Tratamento de obesidade é crônico.**
5. **Produto irregular não se prescreve, não se orienta, não se aplica.**
6. **Documente tudo.**`,
  clinicalCase: {
    title: "DM2, DRC e três remédios para ajustar",
    vignette: "Mulher de 63 anos, DM2 há 14 anos, em metformina 1 g/dia, gliclazida MR 60 mg e NPH 20 UI à noite. TFGe 42 mL/min, RAC 380 mg/g, HbA1c 8,4%, IMC 30. Retinopatia não proliferativa leve no último exame, há 2 anos. Você decide iniciar semaglutida.",
    data: [
      { label: "TFGe", value: "42 mL/min" },
      { label: "RAC", value: "380 mg/g" },
      { label: "HbA1c", value: "8,4%" },
      { label: "Retinopatia", value: "NP leve (2 anos)" },
      { label: "iSGLT2", value: "Não usa" },
      { label: "Hipoglicemias", value: "1 leve/mês" },
    ],
    question: "Qual plano é o mais completo e seguro?",
    options: [
      { label: "Iniciar semaglutida 1,0 mg direto, manter os demais medicamentos.", correct: false, rationale: "Dose inicial alta aumenta intolerância e LRA; manter sulfonilureia e insulina sem ajuste eleva o risco de hipoglicemia." },
      { label: "Adicionar iSGLT2, iniciar semaglutida 0,25 mg com escalonamento até 1,0 mg, suspender gliclazida, reduzir NPH 10–20% com monitorização capilar, solicitar fundoscopia antes, orientar hidratação.", correct: true, rationale: "Integra FLOW e diretrizes KDIGO/ADA (iSGLT2 + GLP-1 RA), previne hipoglicemia, rastreia retinopatia antes da queda de HbA1c e protege o rim." },
      { label: "Trocar tudo por tirzepatida 15 mg pela maior redução de HbA1c.", correct: false, rationale: "Nunca se inicia em dose máxima, e FLOW é a evidência de desfecho renal específica deste perfil." },
      { label: "Não iniciar agonista de GLP-1 porque a TFGe é < 45.", correct: false, rationale: "Semaglutida não exige ajuste por função renal e mostrou benefício justamente em DRC (FLOW)." },
    ],
    teaching: `**Pacientes complexos exigem plano integrado, não só um fármaco novo.**

- **FLOW**: desfecho renal HR 0,76.
- **KDIGO 2024**: iSGLT2 como base na DRC com DM2; GLP-1 RA com benefício comprovado como adição.
- Hipoglicemia: suspenda sulfonilureia, reduza insulina.
- Fundoscopia antes de quedas rápidas de HbA1c.`,
    reward: 60,
  },
  quickRef: `### Método Doutiva (5 passos)
1. **Indicação**
2. **Evidência** (A/B/C/D)
3. **Regulação** (registrado · off-label · irregular)
4. **Segurança** (contraindicações · interações · ajustes)
5. **Plano** (metas · monitoramento · prontuário)

### Gestação
Semaglutida: suspender **≥ 2 meses** antes · Tirzepatida: método contraceptivo adicional (ACO)

### DRC + DM2
iSGLT2 + semaglutida (FLOW) · sem ajuste renal · hidratar

### Pedido de “stack”
Classificar item a item · recusa fundamentada · documentar · oferecer alternativa`,
};
