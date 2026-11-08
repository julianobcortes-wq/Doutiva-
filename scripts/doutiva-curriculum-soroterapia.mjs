/**
 * Doutiva — expansão flagship: Soroterapia com Critério (formulário IV operacional).
 * Base v3 (10 aulas) cobre esterilidade/evidência/ambiente. Extras 11–16 = o que falta:
 * formulações comuns, para que servem, como administrar (taxa, via, monitoramento).
 */

export const AUDIENCE_SOROTERAPIA = `Público: médicos que prescrevem ou supervisionam terapia intravenosa
e reposição injetável no consultório/day clinic brasileiro (endócrino, nutro, clínico, longevidade).

Tom Doutiva:
- Deficiência documentada e indicação clínica > wellness drip.
- Separar registrado · off-label · manipulado · irregular / drip bar sem estrutura.
- Formulário operacional: substância, dose, diluição, taxa de infusão, via, monitoramento.
- Ambiente adequado, kit de emergência, rastreio de lote.
- Independência de farmácia; Purus ganha na conduta, não no “soro da moda”.`;

export const SOROTERAPIA_EXTRA_LESSONS = [
  {
    position: 11,
    module_position: 6,
    module_title: "Módulo 6 · Formulário IV",
    topic: "Painel das formulações de soroterapia mais comuns no consultório BR",
    extra: `TABELA-MESTRA obrigatória: substância | concentração/diluição típica | indicação legítima | via (IV periférica/central) | taxa/tempo de infusão | monitoramento | o que NÃO fazer.
Cobrir no mínimo:
- SF 0,9% e Ringer lactato (hidratação)
- Glicose 5–10% (contexto)
- Magnésio sulfato IV
- Potássio cloreto (cuidados extremos de taxa)
- Complexo B / tiamina / B12 IV ou IM (contraste de via)
- Ácido ascórbico (vitamina C) IV
- “Myers cocktail” (leitura crítica dos componentes)
- Ferro IV (sacarato/isomaltosídeo/carboximaltose — nomes genéricos)
- Aminoácidos / glutamina IV quando couber com critério
Contraste com pedido de “detox drip” sem lab.`,
  },
  {
    position: 12,
    module_position: 6,
    module_title: "Módulo 6 · Formulário IV",
    topic: "Hidratação e eletrólitos IV: SF, Ringer, magnésio e potássio — indicação e taxa segura",
    extra: `Operacional:
- Quando hidratar IV vs VO; volume, ritmo, risco de sobrecarga.
- Magnésio: indicações (deficiência, enxaqueca selecionada — com evidência), diluição, taxa, sinais de toxicidade.
- Potássio IV: só com indicação e ambiente adequado; NUNCA bolo; taxa máxima; monitor cardíaco quando indicado.
- Tabelas: solução | volume | taxa | red flags.
Caso: paciente pede “soro pra ressaca” — condução ética.`,
  },
  {
    position: 13,
    module_position: 6,
    module_title: "Módulo 6 · Formulário IV",
    topic: "Vitaminas IV na bancada: C, complexo B e Myers — doses, diluição e quando faz sentido",
    extra: `Formulário:
- Vitamina C IV: doses discutidas na literatura vs megadose wellness; osmolaridade, taxa, risco de oxalato/G6PD.
- Tiamina, complexo B: contextos (alcoolismo, deficiência); ordem de infusão.
- Myers cocktail: origem, evidência fraca, componentes típicos, como recusar ou redesenhar com critério.
- Tabela dose → diluente → tempo de infusão → o que checar antes (labs, alergia, acesso).
Flow de preparo e administração passo a passo no consultório apto.`,
  },
  {
    position: 14,
    module_position: 7,
    module_title: "Módulo 7 · Casos especiais e setup",
    topic: "Ferro e minerais IV: indicação laboratorial, protocolo de infusão e reações",
    extra: `Operacional ferro IV (e contraste com IM quando ainda citado):
- Indicações: anemia ferropriva com má absorção/intolerância VO, necessidade rápida — sempre com lab.
- Formas genéricas e diferenças de taxa/pré-medicação (sem empurrar marca).
- Reação de hipersensibilidade: reconhecimento e conduta.
- Outros minerais (Zn, Se) — quase nunca IV cosmético; critério estrito.
Tabela: ferritina/Hb → decisão → esquema → monitoramento.
Caso: ferritina baixa sem anemia + pedido de ferro IV “pra cansaço”.`,
  },
  {
    position: 15,
    module_position: 7,
    module_title: "Módulo 7 · Casos especiais e setup",
    topic: "NAD+, alta dose de C e drips da moda: o que a evidência não sustenta e como recusar",
    extra: `Leitura crítica densa:
- NAD+ IV, alta dose C “antiviral/anticâncer” em consultório, drips detox/emagrecimento.
- Nível de evidência, riscos, custo, marketing.
- Script de recusa + alternativa baseada em evidência.
- Quando um componente isolado ainda tem nicho legítimo (ex. deficiência) vs cocktail Instagram.
Split: hype vs conduta Doutiva.`,
  },
  {
    position: 16,
    module_position: 7,
    module_title: "Módulo 7 · Casos especiais e setup",
    topic: "Guia de bolso: setup de infusão, checklist pré/pós, taxas e emergências na soroterapia",
    extra: `Quick_ref mestre:
- Checklist pré-infusão (indicação, labs, consentimento, acesso, kit emergência, lote).
- Tabela rápida substância → diluição → taxa → tempo → sinais de alarme.
- Monitoramento durante/após; critérios de interrupção.
- Documentação no prontuário; ponte com Manipulados (qualidade da magistral) e ambiente (consultório vs day clinic).
Caso integrado: drip bar pede protocolo “assinado” sem estrutura — resposta correta.`,
  },
];

export const SOROTERAPIA_COURSE_META = {
  slug: "soroterapia-injetaveis-estereis",
  title: "Soroterapia com Critério",
  subtitle: "Formulações IV, indicação real, taxa segura e ambiente — sem drip de Instagram",
  category: "Terapêutica",
  level: "Avançado",
  description:
    "Flagship Doutiva de soroterapia: esterilidade e evidência + formulário das IVs mais comuns (hidratação, eletrólitos, vitaminas, ferro), como administrar com taxa segura, o que recusar (NAD+/detox), setup de infusão e emergências — 16 aulas para o prescritor que não assina protocolo de drip bar.",
  instructor_name: "Conselho editorial Doutiva",
  instructor_title: "Terapêutica · Infusão clínica · Segurança do prescritor",
};
