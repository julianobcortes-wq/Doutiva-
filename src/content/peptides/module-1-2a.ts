import type { RichLesson } from "../lesson-types";

/* Aula 1 — O que é um peptídeo terapêutico */
export const lesson1: RichLesson = {
  slides: [
    { kind: "title", eyebrow: "Módulo 1 · Fundamentos", title: "O peptídeo terapêutico", subtitle: "Entre a pequena molécula e o biológico: por que esta classe redefine a farmacologia da próxima década." },
    { kind: "table", title: "Três espaços farmacológicos", head: ["Atributo", "Pequena molécula", "Peptídeo", "Biológico (mAb)"], rows: [
      ["Massa", "< 0,9 kDa", "0,5–5 kDa", "~150 kDa"],
      ["Seletividade", "Moderada", "Alta", "Muito alta"],
      ["Via oral", "Sim", "Rara (SNAC)", "Não"],
      ["Meia-vida nativa", "Horas", "Minutos", "Dias–semanas"],
      ["Toxicidade off-target", "Mais frequente", "Baixa", "Baixa"],
      ["Imunogenicidade", "Rara", "Baixa", "Variável"],
    ], source: "Muttenthaler et al., Nat Rev Drug Discov 2021" },
    { kind: "bullets", title: "As quatro fraquezas do peptídeo nativo", bullets: [
      "Proteólise rápida — GLP-1 nativo tem meia-vida de ~2 min (DPP-4 e NEP 24.11).",
      "Filtração renal — moléculas < 60 kDa são depuradas rapidamente.",
      "Biodisponibilidade oral < 1–2% — ácido gástrico, pepsina e baixa permeabilidade epitelial.",
      "Baixa estabilidade física — agregação, oxidação de Met/Trp, desamidação de Asn.",
    ] },
    { kind: "table", title: "Engenharia que transformou minutos em dias", head: ["Estratégia", "Mecanismo", "Exemplo"], rows: [
      ["Substituição por aminoácido não natural", "Bloqueia sítio de DPP-4", "Aib8 na semaglutida"],
      ["Lipidação (ácido graxo)", "Ligação reversível à albumina", "Semaglutida (C18), tirzepatida (C20)"],
      ["Fusão a Fc / albumina", "Reciclagem via FcRn", "Dulaglutida"],
      ["PEGilação", "Aumenta raio hidrodinâmico", "Pegvisomanto"],
      ["Ciclização", "Rigidez conformacional, resistência", "Octreotida"],
      ["Potenciador de absorção", "SNAC eleva pH local gástrico", "Semaglutida oral"],
    ] },
    { kind: "bars", title: "Meia-vida: o efeito da engenharia", unit: " h", bars: [
      { label: "GLP-1 nativo", value: 0.03 },
      { label: "Exenatida", value: 2.4 },
      { label: "Liraglutida", value: 13 },
      { label: "Tirzepatida", value: 116 },
      { label: "Semaglutida", value: 165, highlight: true },
    ], source: "Bulas FDA/EMA", note: "Meia-vida > 100 h permite dose semanal e níveis estáveis em ~4–5 semanas." },
    { kind: "flow", title: "Do aminoácido ao frasco", steps: [
      { label: "Síntese", detail: "SPPS (fase sólida) ou DNA recombinante" },
      { label: "Purificação", detail: "HPLC; pureza ≥ 98% para uso humano" },
      { label: "Caracterização", detail: "Espectrometria de massas, endotoxinas, esterilidade" },
      { label: "Formulação", detail: "Tampão, conservante, liofilização" },
      { label: "Cadeia fria", detail: "2–8 °C; estabilidade validada" },
    ], note: "Cada etapa é onde produtos “research use only” falham — e onde o risco ao paciente nasce." },
    { kind: "pearl", title: "Para o consultório", text: "Peptídeo não é sinônimo de natural nem de seguro. É uma molécula com farmacocinética, pureza e evidência próprias — avalie cada uma.", source: "Doutiva · Princípio 1" },
  ],
  monograph: `## 1. Definição operacional

Peptídeos terapêuticos são cadeias de **2 a ~50 aminoácidos** unidos por ligações amida, com atividade farmacológica definida. Acima de ~50 resíduos, com estrutura terciária estável, convencionou-se falar em **proteína** — a insulina (51 resíduos, duas cadeias) está exatamente na fronteira. A distinção não é apenas semântica: altera via regulatória, exigências de imunogenicidade e estratégia de fabricação.

Há hoje **mais de 80 peptídeos aprovados** no mundo e centenas em desenvolvimento clínico (Muttenthaler, 2021). A classe ocupa um nicho farmacológico singular:

- **Seletividade de biológico** — superfícies de contato grandes permitem modular receptores acoplados à proteína G (GPCR) e interações proteína–proteína que pequenas moléculas não alcançam.
- **Toxicidade de metabólito mínima** — a degradação gera aminoácidos, não metabólitos reativos hepáticos.
- **Custo de produção intermediário** — síntese química em fase sólida (SPPS) é escalável e reprodutível.

A contrapartida é farmacocinética hostil. Entender essa contrapartida é o que separa o médico que *prescreve peptídeos* do médico que *entende peptídeos*.

## 2. Os quatro obstáculos farmacocinéticos

### 2.1 Proteólise
Peptidases plasmáticas e de membrana reconhecem sequências específicas. O GLP-1(7-36)amida nativo é clivado pela **dipeptidil peptidase-4 (DPP-4)** entre Ala8 e Glu9 em cerca de **2 minutos**, gerando GLP-1(9-36), praticamente inativo no receptor. A endopeptidase neutra 24.11 completa a degradação.

### 2.2 Depuração renal
Moléculas abaixo de ~60 kDa atravessam a barreira de filtração glomerular. Mesmo um peptídeo resistente a proteases desaparece em horas se não houver um mecanismo de “retenção”.

### 2.3 Absorção oral
A biodisponibilidade oral típica é **< 1–2%**: pH gástrico, pepsina, tripsina, quimotripsina e baixa permeabilidade transcelular. A semaglutida oral só é viável graças ao **SNAC** (salcaprozato de sódio), que eleva o pH local, protege da pepsina e favorece absorção transcelular no estômago — e ainda assim a biodisponibilidade fica em torno de **0,4–1%**, por isso a dose oral (até 14 mg/dia em DM2; formulações de maior dose estudadas para obesidade) é ordens de grandeza maior que a semanal subcutânea. Exige jejum e no máximo 120 mL de água, com 30 minutos antes de alimentos — regra que, se ignorada, anula a absorção.

### 2.4 Instabilidade física e química
Agregação (formação de fibrilas), oxidação de metionina e triptofano, desamidação de asparagina e racemização. Isso explica a **cadeia fria** obrigatória e por que reconstituição, agitação e armazenamento inadequados degradam o produto — tema crítico quando se discute preparações manipuladas ou “de pesquisa”.

## 3. Engenharia molecular: o caso semaglutida

A semaglutida é um estudo de caso perfeito, porque cada modificação resolve um obstáculo:

| Modificação | Problema resolvido | Consequência clínica |
|---|---|---|
| **Aib** (ácido α-aminoisobutírico) na posição 8 | Clivagem por DPP-4 | Molécula estável no plasma |
| **Arg34** substituindo Lys | Direciona a acilação a um único sítio (Lys26) | Produto homogêneo |
| **Ácido graxo C18 diácido + espaçador** em Lys26 | Depuração renal | Ligação à albumina (> 99%), meia-vida ~165 h |
| Homologia de **94%** com GLP-1 humano | Imunogenicidade | Anticorpos raros e clinicamente irrelevantes |

A tirzepatida segue a mesma lógica: 39 aminoácidos, esqueleto baseado na sequência de GIP, dois resíduos Aib e uma cadeia **C20 diácida**, com meia-vida de ~5 dias. Ela é um **agonista desbalanceado**: afinidade pelo receptor de GIP comparável à do GIP nativo, e afinidade pelo receptor de GLP-1 cerca de 5 vezes menor que a do GLP-1 nativo, com viés de sinalização para cAMP em detrimento do recrutamento de β-arrestina — o que reduz internalização do receptor e pode contribuir para a magnitude do efeito.

## 4. Classificação funcional útil para a prática

1. **Análogos hormonais de reposição** — insulina, calcitonina, PTH(1-34) teriparatida, desmopressina.
2. **Agonistas metabólicos de longa ação** — GLP-1, GIP/GLP-1, triagonistas (retatrutida, em investigação), amilina (cagrilintida, em investigação).
3. **Moduladores de eixo hipotálamo-hipófise** — análogos de GnRH (leuprorrelina), somatostatina (octreotida, lanreotida), GHRH (tesamorelina).
4. **Peptídeos antimicrobianos e imunomoduladores** — daptomicina, timalfasina.
5. **Peptídeos “regenerativos” e cosméticos** — BPC-157, TB-500, GHK-Cu: categoria com **evidência predominantemente pré-clínica**, tratada no Módulo 4 com leitura crítica.

Essa classificação separa imediatamente o que tem farmacologia regulada e ensaios de fase 3 do que circula principalmente em redes sociais.

## 5. Qualidade de fabricação: a variável invisível

Para um peptídeo registrado, o médico tem garantias de **identidade, pureza, potência, esterilidade e ausência de endotoxinas**. Fora desse ambiente, análises independentes de produtos vendidos online como “research use only” mostram com frequência:

- conteúdo diferente do rotulado (sub ou superdosagem);
- impurezas de síntese (sequências truncadas, resíduos de TFA);
- contaminação microbiológica e endotoxinas;
- ausência de dados de estabilidade.

O FDA, ao incluir diversos peptídeos na **Categoria 2** para manipulação (2023), citou justamente riscos de imunogenicidade, impurezas e falta de dados de segurança. Discutiremos o enquadramento na próxima aula.

## 6. Como o médico deve ler um peptídeo novo

Antes de considerar qualquer peptídeo, responda a cinco perguntas:

1. **Qual o alvo e o mecanismo?** Receptor definido, via de sinalização conhecida?
2. **Qual a farmacocinética em humanos?** Meia-vida, via, biodisponibilidade — ou só dados em roedor?
3. **Qual a melhor evidência clínica?** ECR fase 3 com desfecho duro, fase 2, série de casos, ou apenas pré-clínico?
4. **Qual o status regulatório no Brasil?** Registrado na ANVISA para essa indicação? Off-label? Manipulável? Proibido?
5. **Qual a procedência do produto?** Indústria registrada, farmácia de manipulação com boas práticas (RDC 67/2007), ou fornecedor “de pesquisa”?

Se qualquer resposta for “não sei”, a conduta é **não prescrever até saber**.`,
  clinicalCase: {
    title: "O frasco da academia",
    vignette: "Engenheiro de 41 anos, ciclista amador, chega à consulta com um frasco liofilizado comprado online, rotulado “Semaglutide 5 mg — for research use only”. Quer que você oriente reconstituição e dose para perder 6 kg antes de uma prova. Sem comorbidades.",
    data: [
      { label: "IMC", value: "26,8 kg/m²" },
      { label: "Circunferência abdominal", value: "96 cm" },
      { label: "HbA1c", value: "5,4%" },
      { label: "PA", value: "124/78 mmHg" },
      { label: "Produto", value: "Sem registro ANVISA" },
      { label: "Laudo de pureza", value: "Ausente" },
    ],
    question: "Qual a conduta mais adequada?",
    options: [
      { label: "Orientar reconstituição com água bacteriostática e iniciar 0,25 mg/semana, já que a molécula é a mesma do produto registrado.", correct: false, rationale: "A molécula declarada não garante identidade, pureza nem esterilidade. Orientar o uso torna o médico corresponsável por produto sem registro e sem controle de qualidade." },
      { label: "Recusar orientar o uso do produto, explicar os riscos de procedência e reavaliar indicação: IMC 26,8 sem comorbidade não preenche critério de bula para tratamento farmacológico da obesidade.", correct: true, rationale: "Dupla correção: produto irregular e ausência de indicação (bula exige IMC ≥ 30 ou ≥ 27 com comorbidade). A conduta é educar, documentar e oferecer plano não farmacológico e de performance." },
      { label: "Prescrever semaglutida registrada 2,4 mg já que o paciente vai usar de qualquer forma — redução de danos.", correct: false, rationale: "Redução de danos não justifica prescrição fora de indicação sem benefício demonstrado. Além disso, perda ponderal rápida pré-prova reduz massa magra e performance." },
      { label: "Solicitar que ele traga um laudo do fornecedor; se pureza > 98%, liberar uso.", correct: false, rationale: "Laudos de fornecedores “research only” não são auditados, não comprovam esterilidade/endotoxinas e não mudam o status regulatório do produto." },
    ],
    teaching: `**Raciocínio Doutiva:** (1) indicação → (2) evidência → (3) regulação → (4) procedência.

- O paciente **não tem indicação de bula** (IMC < 27 sem comorbidade).
- O produto é **irregular** — sem registro, sem rastreabilidade.
- Documente em prontuário a orientação contrária ao uso.
- Ofereça o que funciona para o objetivo real dele: periodização nutricional, déficit moderado com proteína 1,6–2,2 g/kg/dia, preservação de potência.`,
    reward: 40,
  },
  quickRef: `### 5 perguntas antes de qualquer peptídeo
1. **Alvo/mecanismo** definido em humanos?
2. **Farmacocinética humana** conhecida?
3. **Melhor evidência:** fase 3? fase 2? só roedor?
4. **Status ANVISA** para esta indicação?
5. **Procedência:** indústria · manipulação RDC 67/2007 · “research only” (não usar)

### Meias-vidas de referência
| Molécula | t½ | Posologia |
|---|---|---|
| Liraglutida | ~13 h | Diária |
| Tirzepatida | ~5 dias | Semanal |
| Semaglutida SC | ~7 dias | Semanal |
| Semaglutida oral | ~7 dias | Diária, jejum, ≤ 120 mL água, 30 min antes |

### Alertas vermelhos
- Frasco “for research use only”
- Ausência de laudo de esterilidade/endotoxinas
- Promessa de efeito sem ensaio em humanos`,
};

/* Aula 2 — Hierarquia de evidência e enquadramento regulatório */
export const lesson2: RichLesson = {
  slides: [
    { kind: "title", eyebrow: "Módulo 1 · Fundamentos", title: "Evidência e regulação", subtitle: "Antes da dose, a categoria. O enquadramento define a responsabilidade do médico." },
    { kind: "flow", title: "Hierarquia de evidência (simplificada)", steps: [
      { label: "Pré-clínico", detail: "In vitro, roedores — gera hipóteses" },
      { label: "Série de casos", detail: "Sem controle — viés máximo" },
      { label: "Observacional", detail: "Coorte, caso-controle" },
      { label: "ECR", detail: "Randomizado, cego, desfecho definido" },
      { label: "Metanálise de ECRs", detail: "Com avaliação GRADE" },
    ], note: "Desfecho duro (morte, IAM, diálise) > desfecho substituto (peso, IGF-1, HbA1c)." },
    { kind: "table", title: "As quatro categorias do peptídeo no Brasil", head: ["Categoria", "Exemplo", "Responsabilidade"], rows: [
      ["1. Registrado na indicação", "Semaglutida 2,4 mg na obesidade", "Bula ampara"],
      ["2. Registrado, off-label", "Agonista GLP-1 em indicação não prevista", "Fundamentação + TCLE"],
      ["3. Manipulado", "Formulações magistrais sob RDC 67/2007", "Prescritor + farmácia"],
      ["4. Sem registro / “pesquisa”", "BPC-157, TB-500, CJC-1295", "Não prescrever fora de pesquisa"],
    ] },
    { kind: "split", title: "Off-label legítimo × uso irregular", left: { label: "Off-label defensável", items: ["Molécula registrada no Brasil", "Racional fisiopatológico e evidência publicada", "Ausência de alternativa melhor", "TCLE documentado e seguimento"] }, right: { label: "Uso irregular", items: ["Produto sem registro ou “research use only”", "Evidência apenas em roedores", "Fim estético/performance sem base", "Ausência de consentimento e de prontuário"] } },
    { kind: "table", title: "Marcos regulatórios que você precisa conhecer", head: ["Órgão", "Instrumento", "O que importa"], rows: [
      ["ANVISA", "RDC 67/2007", "Boas práticas de manipulação magistral"],
      ["ANVISA", "Retenção de receita (2025)", "Agonistas de GLP-1 passaram a exigir retenção"],
      ["CFM", "Res. 2.217/2018 (CEM)", "Vedação a procedimento sem reconhecimento científico"],
      ["CFM", "Res. 2.333/2023", "Veda hormônios anabolizantes para estética/performance"],
      ["FDA", "Categoria 2 (503A, 2023)", "BPC-157, TB-500, CJC-1295, ipamorelina e outros"],
      ["WADA", "Lista proibida (S0/S2)", "BPC-157, GHRPs, GHRH, TB-500 vetados no esporte"],
    ], source: "Confira sempre a versão vigente de cada norma" },
    { kind: "pearl", title: "Responsabilidade", text: "A pergunta não é “funciona?”. É “com que evidência, com que produto e com que consentimento?”.", source: "Doutiva · Princípio 2" },
  ],
  monograph: `## 1. Por que a categoria vem antes da dose

Na medicina de peptídeos convivem moléculas com **ensaios de fase 3 envolvendo dezenas de milhares de pacientes** e moléculas cuja evidência humana se resume a poucos relatos. Tratar ambas com a mesma linguagem é o erro central que este curso pretende eliminar. A primeira decisão clínica é sempre **classificar**.

## 2. Hierarquia de evidência aplicada

Utilizamos uma adaptação prática dos sistemas Oxford CEBM e GRADE:

| Nível Doutiva | Base | Exemplo em peptídeos |
|---|---|---|
| **A** | ECRs fase 3 com desfecho clínico | SELECT (semaglutida, MACE), FLOW (rim), SURMOUNT-1 |
| **B** | ECRs menores, fase 2, desfechos substitutos | Retatrutida fase 2; tesamorelina em esteatose |
| **C** | Farmacologia humana, estudos abertos, observacionais | CJC-1295 (fase 1, GH/IGF-1) |
| **D** | Pré-clínico, séries de casos | BPC-157, TB-500, GHK-Cu injetável |

Dois alertas metodológicos recorrentes:

- **Desfecho substituto engana.** Elevar IGF-1 não equivale a melhorar composição corporal, função ou sobrevida. Reduzir peso não equivale automaticamente a reduzir eventos — por isso o SELECT foi tão importante.
- **Grupo único de pesquisa.** Quando quase toda a literatura de um composto vem de um mesmo laboratório (caso do BPC-157), a ausência de replicação independente rebaixa a confiança.

## 3. As quatro categorias regulatórias

### 3.1 Registrado para a indicação
Máxima segurança jurídica: bula, farmacovigilância, fabricação controlada. Ex.: semaglutida 2,4 mg (Wegovy) e liraglutida 3 mg para obesidade; semaglutida e tirzepatida para DM2. **Verifique sempre a bula vigente**, pois indicações têm sido ampliadas com frequência (doença cardiovascular, apneia obstrutiva do sono, doença renal).

### 3.2 Registrado, uso off-label
O uso fora da bula **não é ilegal** no Brasil, mas transfere ao médico o ônus de justificar. Requisitos práticos:
- racional fisiopatológico e evidência publicada;
- inexistência de alternativa registrada mais adequada;
- **Termo de Consentimento Livre e Esclarecido** específico, com riscos e incertezas;
- registro detalhado em prontuário e plano de seguimento.

### 3.3 Manipulado
A RDC 67/2007 estabelece boas práticas de manipulação. A farmácia responde pela qualidade; o prescritor responde pela indicação. Observe: manipular **não cria evidência** — um peptídeo sem respaldo clínico continua sem respaldo quando manipulado. A ANVISA tem emitido alertas sobre produtos irregulares de agonistas de GLP-1 e, desde 2025, exige **retenção de receita** para essa classe.

### 3.4 Sem registro / “research use only”
Produtos rotulados para pesquisa **não são destinados a humanos**. Prescrevê-los, orientar sua aplicação ou administrá-los no consultório expõe o médico a responsabilização ética, civil e sanitária. No exterior, o FDA incluiu em 2023 diversos peptídeos — BPC-157, TB-500 (fragmento de timosina β4), CJC-1295, ipamorelina, GHRP-2, GHRP-6, entre outros — na **Categoria 2**, de substâncias com preocupações de segurança significativas para manipulação.

## 4. Ética médica

O **Código de Ética Médica** (Res. CFM 2.217/2018) veda ao médico utilizar procedimentos sem reconhecimento científico e exige informação clara ao paciente. A **Res. CFM 2.333/2023** vedou a prescrição de terapias hormonais com esteroides androgênicos e anabolizantes para fins estéticos, ganho de massa muscular ou melhora de desempenho — e sinaliza a postura do Conselho diante de terapias de “performance” sem evidência, contexto em que secretagogos de GH frequentemente são oferecidos.

Também é vedada publicidade sensacionalista ou promessa de resultado. Postagens que prometem “regeneração em 2 semanas com BPC-157” violam simultaneamente evidência e ética publicitária.

## 5. Esporte

A **WADA** proíbe, em qualquer momento, substâncias não aprovadas para uso humano (classe **S0**, onde se enquadra o BPC-157) e hormônios peptídicos, fatores de crescimento e moduladores (classe **S2**: GHRH e análogos, GHRPs/secretagogos, TB-500). Atleta federado, inclusive amador em competições com controle, deve ser informado de que o uso pode resultar em suspensão.

## 6. Modelo mental para o consultório

Para cada peptídeo, construa uma linha:

> **Molécula** · nível de evidência · categoria regulatória · indicação · TCLE necessário? · contraindicações · plano de monitoramento.

Essa linha, registrada em prontuário, é a sua melhor proteção clínica e jurídica — e é exatamente o que o Tutor IA da Doutiva foi treinado para ajudar a montar.`,
  clinicalCase: {
    title: "Off-label ou irregular?",
    vignette: "Médica de 52 anos, ortopedista, pergunta como montar protocolo para três pacientes: (1) mulher de 58 anos com obesidade grau I e osteoartrite de joelho que deseja semaglutida; (2) atleta de jiu-jítsu federado querendo BPC-157 para tendinopatia patelar; (3) homem de 47 anos pedindo CJC-1295 + ipamorelina “anti-aging”.",
    data: [
      { label: "Paciente 1", value: "IMC 32, OA joelho" },
      { label: "Paciente 2", value: "Atleta federado" },
      { label: "Paciente 3", value: "IGF-1 normal" },
      { label: "Semaglutida 2,4 mg", value: "Registrada" },
      { label: "BPC-157", value: "Sem registro" },
      { label: "CJC-1295", value: "Sem registro" },
    ],
    question: "Qual classificação está correta?",
    options: [
      { label: "Os três podem ser manipulados com TCLE, pois todos são peptídeos.", correct: false, rationale: "Manipulação não cria evidência nem registro. BPC-157 e CJC-1295 não têm respaldo clínico e estão na Categoria 2 do FDA." },
      { label: "Paciente 1: uso registrado (IMC ≥ 30), com benefício também na dor da OA (STEP 9). Pacientes 2 e 3: não prescrever — evidência D/C, produtos sem registro e, no atleta, violação WADA.", correct: true, rationale: "STEP 9 mostrou redução de peso e de dor no WOMAC em OA de joelho com obesidade. Os outros dois casos não têm indicação nem produto regular." },
      { label: "Paciente 2 pode usar BPC-157 porque tendinopatia é off-label legítimo.", correct: false, rationale: "Off-label pressupõe produto registrado. BPC-157 não é registrado e é proibido pela WADA (S0)." },
      { label: "Paciente 3 pode usar desde que IGF-1 seja monitorado a cada 3 meses.", correct: false, rationale: "Monitorar não legitima uso sem indicação e sem produto regular. Deficiência de GH no adulto tem diagnóstico por teste de estímulo e tratamento com somatropina registrada." },
    ],
    teaching: `**Classifique antes de dosar.** A mesma consulta pode conter um uso plenamente amparado e dois usos indefensáveis.

- **STEP 9** (Bliddal, NEJM 2024): semaglutida 2,4 mg em OA de joelho + obesidade reduziu peso e dor (WOMAC) vs placebo.
- Recusa documentada protege o médico — e educa o paciente.`,
    reward: 40,
  },
  quickRef: `### Classificação em 10 segundos
| Categoria | Pode prescrever? | Exige |
|---|---|---|
| Registrado na indicação | Sim | Bula |
| Registrado off-label | Sim, com cautela | Evidência + TCLE + prontuário |
| Manipulado | Depende da molécula | RDC 67/2007 + evidência |
| “Research use only” | **Não** | — |

### Níveis de evidência Doutiva
- **A** ECR fase 3, desfecho clínico
- **B** Fase 2 / substituto
- **C** Farmacologia humana / observacional
- **D** Pré-clínico / série de casos

### Esporte (WADA)
- **S0:** BPC-157 (não aprovado)
- **S2:** GHRH/análogos, GHRPs, TB-500

### TCLE off-label deve conter
Indicação · evidência disponível · alternativas · riscos conhecidos e desconhecidos · custo · plano de suspensão`,
};

/* Aula 3 — Fisiologia de GLP-1 e GIP */
export const lesson3: RichLesson = {
  slides: [
    { kind: "title", eyebrow: "Módulo 2 · Incretinas", title: "Fisiologia de GLP-1 e GIP", subtitle: "Do intestino ao hipotálamo: por que um hormônio intestinal virou o fármaco mais transformador da década." },
    { kind: "bars", title: "O efeito incretina", unit: "%", bars: [
      { label: "Normoglicêmico", value: 70, highlight: true },
      { label: "DM2", value: 30 },
    ], source: "Nauck & Meier, Lancet Diabetes Endocrinol 2016", note: "Fração aproximada da resposta insulínica pós-prandial atribuível às incretinas." },
    { kind: "table", title: "GLP-1 × GIP", head: ["", "GLP-1", "GIP"], rows: [
      ["Origem", "Células L (íleo, cólon)", "Células K (duodeno, jejuno)"],
      ["Tamanho", "30 aa (7-36 amida)", "42 aa"],
      ["Insulina glicose-dependente", "Sim", "Sim"],
      ["Glucagon", "Suprime", "Estimula (em glicemia baixa)"],
      ["Esvaziamento gástrico", "Retarda", "Mínimo"],
      ["SNC", "Saciedade (ARC, NTS, área postrema)", "Antiemético? Saciedade (hipotálamo)"],
      ["Tecido adiposo", "Indireto", "Receptor direto — tamponamento lipídico"],
    ] },
    { kind: "flow", title: "Sinalização no receptor de GLP-1", steps: [
      { label: "GLP-1R (GPCR classe B)", detail: "Ligação do agonista" },
      { label: "Gαs → adenilato ciclase", detail: "↑ cAMP" },
      { label: "PKA e Epac2", detail: "Fechamento K-ATP, influxo Ca²⁺" },
      { label: "Exocitose de insulina", detail: "Apenas com glicose elevada" },
      { label: "β-arrestina", detail: "Internalização e dessensibilização" },
    ], note: "Por ser glicose-dependente, o risco de hipoglicemia em monoterapia é baixo." },
    { kind: "bullets", title: "Mecanismos centrais da perda de peso", bullets: [
      "Núcleo arqueado: ativa neurônios POMC/CART e inibe NPY/AgRP.",
      "Tronco encefálico (NTS, área postrema): saciedade e náusea — mesmos circuitos.",
      "Sistema de recompensa (área tegmentar ventral, núcleo accumbens): reduz “food noise” e valor hedônico.",
      "Esvaziamento gástrico: efeito agudo que sofre taquifilaxia com uso contínuo.",
    ] },
    { kind: "split", title: "O paradoxo GIP", left: { label: "Agonismo (tirzepatida)", items: ["Potencializa perda de peso com GLP-1", "Possível efeito antiemético central", "Melhora sensibilidade à insulina no adipócito"] }, right: { label: "Antagonismo (em estudo)", items: ["Camundongos sem GIPR resistem à obesidade", "Maridebart cafraglutida: anti-GIPR + agonista GLP-1", "Hipótese: agonismo crônico causa dessensibilização funcional"] } },
    { kind: "pearl", title: "Para o consultório", text: "Náusea e saciedade compartilham circuitos. Titular devagar não é detalhe: é farmacologia.", source: "Doutiva · Princípio 3" },
  ],
  monograph: `## 1. O efeito incretina

Em 1964, observou-se que a glicose oral provoca resposta insulínica muito maior do que a mesma glicemia obtida por via intravenosa. Essa diferença — o **efeito incretina** — responde por até ~70% da secreção de insulina pós-prandial em indivíduos saudáveis e está **acentuadamente reduzido no DM2**, principalmente por perda de resposta ao GIP. Os dois hormônios responsáveis são:

- **GLP-1** (glucagon-like peptide-1), secretado pelas células L do íleo distal e cólon, derivado do pró-glucagon por clivagem pela pró-hormônio convertase 1/3;
- **GIP** (glucose-dependent insulinotropic polypeptide), secretado pelas células K do duodeno e jejuno proximal.

Ambos têm meia-vida de poucos minutos por degradação pela **DPP-4** — base racional para os inibidores de DPP-4 (gliptinas) e, depois, para os agonistas resistentes.

## 2. Receptores e sinalização

GLP-1R e GIPR são **receptores acoplados à proteína G da classe B**. A ativação de Gαs eleva cAMP, que via **PKA** e **Epac2** promove fechamento de canais K-ATP, despolarização, influxo de cálcio e exocitose de grânulos de insulina — **somente quando a glicose está elevada**. Essa dependência de glicose explica o baixo risco de hipoglicemia em monoterapia; o risco reaparece quando associados a sulfonilureia ou insulina.

O recrutamento de **β-arrestina** promove internalização do receptor. Agonistas com viés para cAMP e menor recrutamento de β-arrestina (como a tirzepatida no GLP-1R) mantêm mais receptores na superfície — uma hipótese para sua eficácia superior.

Efeitos tróficos sobre células β (proliferação, menor apoptose) são robustos em roedores, mas **não foram demonstrados de forma convincente em humanos**.

## 3. Ações periféricas do GLP-1

| Órgão | Efeito | Relevância clínica |
|---|---|---|
| Pâncreas α | ↓ glucagon (glicose-dependente) | Controle glicêmico pós-prandial |
| Estômago | ↓ esvaziamento gástrico | Saciedade; atenuado com uso crônico; relevância anestésica |
| Coração/vasos | ↓ PA, ↑ FC (2–4 bpm), efeitos anti-inflamatórios | Benefício cardiovascular (SELECT, SUSTAIN-6) |
| Rim | Natriurese, ↓ inflamação, ↓ albuminúria | FLOW |
| Fígado | ↓ esteatose (efeito majoritariamente indireto via perda de peso) | MASH: semaglutida aprovada pelo FDA em 2025 |

## 4. O cérebro: onde a perda de peso realmente acontece

O GLP-1 endógeno circulante pouco atravessa a barreira hematoencefálica, mas agonistas acessam regiões com barreira fenestrada (**área postrema**, **eminência mediana**) e atuam em:

- **Núcleo arqueado do hipotálamo**: ativação de neurônios anorexígenos POMC/CART e inibição indireta de neurônios orexígenos NPY/AgRP;
- **Núcleo do trato solitário** e **área postrema**: saciedade, aversão e náusea — por isso náusea e saciedade são faces do mesmo mecanismo;
- **Circuitos mesolímbicos**: redução da recompensa alimentar, relatada pelos pacientes como diminuição do “food noise”. Esse mesmo mecanismo motiva estudos em transtorno por uso de álcool e outras adições.

A redução do esvaziamento gástrico contribui no início, mas sofre **taquifilaxia** com agonistas de longa ação — a perda de peso sustentada é primariamente **central**.

## 5. GIP: de vilão a parceiro

Por anos, o GIP foi considerado irrelevante ou até obesogênico: estimula lipogênese no adipócito e camundongos sem GIPR resistem à obesidade induzida por dieta. A tirzepatida inverteu a narrativa. Hipóteses para o benefício do agonismo GIP:

1. **Ação central sinérgica** com GLP-1 sobre a ingestão alimentar;
2. **Efeito antiemético**: GIPR é expresso em neurônios GABAérgicos do tronco que inibem circuitos de náusea — potencialmente permitindo doses mais eficazes de agonismo GLP-1;
3. **Tamponamento lipídico** no tecido adiposo subcutâneo, reduzindo deposição ectópica e melhorando sensibilidade à insulina.

Paradoxalmente, o **antagonismo** de GIPR combinado a agonismo GLP-1 (maridebart cafraglutida, em fase 3) também produz perda de peso expressiva. A explicação mais aceita é que agonismo crônico dessensibiliza o receptor, gerando funcionalmente um antagonismo. Para a prática: o mecanismo exato **ainda está em aberto**, e o médico deve comunicar isso com honestidade.

## 6. Glucagon: a terceira via

Agonismo do receptor de glucagon aumenta **gasto energético**, oxidação lipídica hepática e reduz gordura hepática, ao custo de potencial hiperglicemia — neutralizada pelo agonismo GLP-1/GIP. É a racional da **retatrutida** (triagonista GIP/GLP-1/glucagon), que na fase 2 produziu perda de **24,2%** em 48 semanas na dose de 12 mg (Jastreboff, NEJM 2023). Permanece **investigacional**.

## 7. Implicações práticas

- **Titulação lenta** reduz eventos gastrointestinais porque permite adaptação dos circuitos do tronco.
- **Frequência cardíaca** sobe discretamente — monitore em arritmias.
- **Anestesia e endoscopia**: o retardo de esvaziamento, mesmo atenuado, mantém risco de conteúdo gástrico residual, especialmente na fase de escalonamento ou com sintomas.
- A perda de peso depende de **uso contínuo**; ao suspender, o drive hipotalâmico retorna (STEP 1 extensão; STEP 4).`,
  clinicalCase: {
    title: "Náusea na semana 6",
    vignette: "Mulher de 44 anos, IMC 34, com pré-diabetes, em semaglutida 2,4 mg — mas chegou à dose máxima em 5 semanas, por conta própria, “para acelerar”. Relata náusea diária, dois vômitos por semana e aversão a alimentos gordurosos.",
    data: [
      { label: "Peso", value: "−4,8 kg em 6 sem" },
      { label: "Dose atual", value: "2,4 mg/semana" },
      { label: "Diurese", value: "Preservada" },
      { label: "Dor abdominal", value: "Ausente" },
      { label: "Creatinina", value: "0,8 mg/dL" },
      { label: "Lipase", value: "Normal" },
    ],
    question: "Qual a melhor conduta?",
    options: [
      { label: "Manter 2,4 mg e prescrever ondansetrona contínua.", correct: false, rationale: "Trata o sintoma mantendo a causa (escalonamento inadequado) e expõe a desidratação e piora de adesão." },
      { label: "Retornar à dose tolerada (ex.: 1,0 mg), orientar refeições pequenas, pobres em gordura, hidratação, e reescalonar a cada 4 semanas conforme tolerância.", correct: true, rationale: "Os circuitos do tronco encefálico precisam de tempo para adaptação. Reduzir e reescalonar é a conduta fisiológica e preserva a adesão de longo prazo." },
      { label: "Suspender definitivamente: a paciente é intolerante a agonistas de GLP-1.", correct: false, rationale: "A intolerância é decorrente da velocidade, não da classe. A maioria tolera com escalonamento padrão." },
      { label: "Trocar imediatamente para tirzepatida 10 mg.", correct: false, rationale: "Troca para dose alta sem escalonamento reproduz o problema. Se houver troca, inicia-se com dose baixa e titulação." },
    ],
    teaching: `**Náusea é farmacologia, não alergia.** O escalonamento a cada 4 semanas existe porque a adaptação dos neurônios da área postrema/NTS é tempo-dependente.

- Exclua sinais de alarme (dor abdominal intensa, desidratação, lipase elevada).
- Reduza para a última dose tolerada; reescalone mais lentamente se necessário.
- Eduque: velocidade de perda de peso não deve ser a meta — a meta é dose sustentável.`,
    reward: 40,
  },
  quickRef: `### Ações por órgão (GLP-1)
- **Ilhota:** ↑ insulina e ↓ glucagon, *glicose-dependente*
- **Estômago:** ↓ esvaziamento (taquifilaxia)
- **Hipotálamo:** POMC/CART ↑, NPY/AgRP ↓
- **Tronco:** saciedade **e** náusea
- **Coração:** FC +2–4 bpm, PA ↓

### GIP
- Insulinotrópico; glucagon ↑ em glicemia baixa
- Agonismo + GLP-1 = efeito aditivo (tirzepatida)

### Hipoglicemia
Baixa em monoterapia → **reduzir sulfonilureia/insulina** ao iniciar

### Lembrar
- Peso depende de **uso contínuo**
- Retatrutida (triagonista) = **investigacional**`,
};
