/**
 * Doutiva — expansão flagship: Emagrecimento / Obesidade de Precisão.
 * Base v3 (10 aulas) cobre fenótipos e multimodalidade. Extras 11–16 =
 * formulário do armamentário + titulação + massa magra + manutenção operacional.
 */

export const AUDIENCE_EMAGRECIMENTO = `Público: endocrinologistas, nutrólogos e clínicos que tratam obesidade
e emagrecimento no Brasil com farmacoterapia, estilo de vida e, quando couber, cirurgia.

Tom Doutiva:
- Obesidade = doença crônica. Sem estigma, sem “detox”, sem protocolo de influencer.
- Formulário: fármaco | dose | titulação | via | indicação | red flags | monitoramento.
- Incretinas com critério (semaglutida/tirzepatida): industrial preferencial; manipulado só com justificativa (ponte ao curso Manipulados).
- Preservar massa magra. Manutenção > pico de perda.
- Independência de indústria; Purus ganha na conduta.`;

export const EMAGRECIMENTO_EXTRA_LESSONS = [
  {
    position: 11,
    module_position: 6,
    module_title: "Módulo 6 · Formulário do emagrecimento",
    topic: "Painel do armamentário anti-obesidade no Brasil: orais e injetáveis",
    extra: `TABELA-MESTRA: fármaco | status regulatório BR (quando souber com segurança) | dose usual | via | perda média esperada (faixa de literatura, sem inventar) | para quem | quando NÃO usar.
Cobrir: orlistat, sibutramina (contexto BR/restrições), topiramato (off-label quando discutido), bupropiona±naltrexona, liraglutida, semaglutida, tirzepatida.
Separar registrado na obesidade vs off-label vs manipulado.
Contraste com “emagrecedores” de farmácia de manipulação sem evidência.`,
  },
  {
    position: 12,
    module_position: 6,
    module_title: "Módulo 6 · Formulário do emagrecimento",
    topic: "Fármacos orais na prática: quem inicia, como titular, o que monitorar",
    extra: `Operacional dos orais mais usados no consultório BR:
- Critérios de escolha por fenótipo (fome, compulsão, SONO, contraindicações CV/psiquiátricas).
- Titulação, horários, interações, duração do tratamento.
- Tabela dose → efeito esperado → labs/sinais de alarme.
- Quando migrar para incretina ou combinação multimodal.
Caso: paciente pede “remédio da manipulação pra secar”.`,
  },
  {
    position: 13,
    module_position: 6,
    module_title: "Módulo 6 · Formulário do emagrecimento",
    topic: "Incretinas no emagrecimento: titulação SC, o que esperar semana a semana e falha",
    extra: `Playbook operacional semaglutida e tirzepatida para obesidade:
- Dose inicial, escada de titulação, manejo de GI, quando segurar dose.
- Técnica SC (locais, rotação) — ponte curta ao Manipulados sem repetir magistral.
- Semana a semana: náusea, saciedade, peso, adesão.
- Plateau e switch. Documentação e TCLE.
Tabelas densas + flow de titulação.`,
  },
  {
    position: 14,
    module_position: 7,
    module_title: "Módulo 7 · Composição e manutenção",
    topic: "Preservar massa magra sob perda de peso: proteína, treino, DEXA/BIA e armadilhas",
    extra: `Operacional:
- Metas de proteína g/kg, treino de força, quando pedir DEXA vs BIA.
- Sinais de perda excessiva de magra; ajuste de ritmo de emagrecimento e dose de fármaco.
- Conversas com o paciente sobre “peso na balança vs composição”.
Tabela: cenário → meta proteica → exame → conduta.`,
  },
  {
    position: 15,
    module_position: 7,
    module_title: "Módulo 7 · Composição e manutenção",
    topic: "Manutenção, descontinuação e reganho: o protocolo depois do nadir",
    extra: `O jogo longo:
- Quando reduzir dose vs manter vs descontinuar.
- Plano de transição 90 dias pós-nadir; gatilhos de reganho.
- Reintrodução de fármaco; papel do estilo de vida e follow-up.
- Red flags comportamentais / transtorno alimentar.
Quick_ref de manutenção.`,
  },
  {
    position: 16,
    module_position: 7,
    module_title: "Módulo 7 · Composição e manutenção",
    topic: "Guia de bolso: protocolo 90 dias de emagrecimento no consultório Doutiva",
    extra: `Checklist integrado dia 0 → 30 → 60 → 90:
- Avaliação, fenótipo, escolha de via farmacológica, labs, metas SMART.
- Tabela-resumo orais vs incretinas vs cirurgia (quando encaminhar).
- O que documentar; o que nunca prometer.
Caso final: IMC 34, tentativa prévia, orçamento limitado, pressão por manipulado — conduta correta.`,
  },
];

export const EMAGRECIMENTO_COURSE_META = {
  slug: "obesidade-precisao-consultorio",
  title: "Emagrecimento e Obesidade de Precisão",
  subtitle: "Fenótipos, formulário farmacológico e manutenção — sem protocolo de influencer",
  category: "Metabolismo",
  level: "Avançado",
  description:
    "Flagship Doutiva de emagrecimento: obesidade como doença crônica, fenótipos, armamentário oral e incretinas com titulação operacional, preservação de massa magra, manutenção e protocolo 90 dias — 16 aulas para o prescritor que recusa atalho de Instagram.",
  instructor_name: "Conselho editorial Doutiva",
  instructor_title: "Metabolismo · Obesidade · Farmacoterapia ética",
};
