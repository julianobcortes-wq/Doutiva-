/**
 * Doutiva — expansão flagship: Hormônios Injetáveis e Implantes com Critério.
 * O curso base (v3, 10 aulas) já cobre diagnóstico/ética. Este arquivo adiciona
 * o Módulo 6–7 de FORMULÁRIO + técnica (o que faltava para ficar “parrudo” operacional).
 */

export const AUDIENCE_HORMONIOS = `Público: endocrinologistas, ginecologistas, urologistas, nutrólogos e clínicos
que manejam hipogonadismo, menopausa e demanda de “otimização” hormonal no Brasil.

Tom Doutiva:
- Diagnóstico antes de frasco. CFM 2.333/2023. Sem protocolo de Instagram.
- Separar registrado · off-label · manipulado · irregular.
- Formulário operacional: substância, concentração, via, local, intervalo, labs.
- Implantes: indicação selecionada, curva, complicações, follow-up — sem hype.
- Independência de farmácia/indústria; Purus ganha na conduta.`;

/** Aulas novas a acrescentar ao curso hormonios-implantes-criterio (positions 11–16). */
export const HORMONIOS_EXTRA_LESSONS = [
  {
    position: 11,
    module_position: 6,
    module_title: "Módulo 6 · Formulário injetável",
    topic: "Painel das formulações hormonais injetáveis e implantes mais usadas no BR",
    extra: `TABELA-MESTRA obrigatória com colunas: substância | forma/concentração típica (industrial e/ou manipulada) | indicação legítima | via (IM/SC/implante) | intervalo | monitoramento-chave | o que NÃO fazer.
Cobrir no mínimo:
- Testosterona cipionato, enantato, undecanoato (quando couber), gel (contraste de via)
- Estradiol valerato / cipionato injetável; estradiol transdérmico (contraste)
- Progesterona oleosa / micronizada VO (contraste)
- Implantes de testosterona e de estradiol (± progesterona) — doses típicas de pellet quando discutidas na literatura, com caveat de variação magistral
- Contraste com “bioidêntico manipulado” sem padronização
Tom: formulário de bolso do prescritor. Sem inventar marca. Destacar CFM/evidência.`,
  },
  {
    position: 12,
    module_position: 6,
    module_title: "Módulo 6 · Formulário injetável",
    topic: "TRT injetável na bancada: cipionato vs enantato vs undecanoato — dose, volume e intervalo",
    extra: `Operacional masculino (hipogonadismo documentado):
- Diferenças PK: cipionato/enantato (ésteres intermediários) vs undecanoato (longa ação).
- Doses típicas de início e ajuste; conversão mg → mL conforme concentração (ex. 100–200 mg/mL).
- Intervalos comuns (semanal, a cada 10–14 dias, esquemas de undecanoato).
- Picos/vales: quando dosar testosterona total/livre, hematócrito, estradiol, PSA conforme idade/risco.
- Fertilidade: quando NÃO iniciar TRT; papel de alternatives (verificar evidência).
Tabelas densas + caso: paciente traz “ciclo” de academia.`,
  },
  {
    position: 13,
    module_position: 6,
    module_title: "Módulo 6 · Formulário injetável",
    topic: "Técnica IM e SC de hormônios oleosos: local, agulha, volume máximo e erros clássicos",
    extra: `Passo a passo de administração:
- Locais IM: ventroglúteo, dorso-glúteo (cuidados com nervo), vasto lateral; SC quando formulação permitir.
- Agulha, ângulo, aspiração (discussão atual), massagem, rotação de sítio.
- Volume máximo por sítio; o que fazer se nódulo/abscesso.
- Cadeia de frio / armazenamento do frasco oleoso; prazo após abertura.
- Educação do paciente para autoaplicação segura vs aplicação em consultório.
Flow de técnica + red flags (embolia oleosa rara, infecção, hematócrito alto).`,
  },
  {
    position: 14,
    module_position: 7,
    module_title: "Módulo 7 · Implantes e mulher",
    topic: "Implantes de testosterona: seleção do paciente, curva, técnica conceitual e follow-up",
    extra: `Foco operacional em pellets/implantes masculinos:
- Quem é candidato (após falha/intolerância a outras vias ou preferência documentada) vs quem não é.
- Farmacocinética: platô, duração típica, quando reinseriir.
- Complicações: extrusão, infecção, fibrose, dose excessiva.
- Labs no ciclo do implante; o que ajustar na próxima carga.
- Consentimento e documentação. Sem vender “implante para todo homem 40+”.`,
  },
  {
    position: 15,
    module_position: 7,
    module_title: "Módulo 7 · Implantes e mulher",
    topic: "THM injetável e implantes femininos: estradiol ± progesterona — como combinar com critério",
    extra: `Menopausa / deficiência estrogênica documentada:
- Quando via injetável ou implante entra vs transdérmico/oral regulado.
- Estradiol injetável: intervalos, doses típicas discutidas, sintomas de escape.
- Proteção endometrial: progesterona/progestágeno — esquemas; risco de implante de E2 isolado em útero presente.
- “Bioidêntico” magistral: o que a evidência e sociedades dizem; conversa com a paciente.
- Mama, trombo, idade, janela de oportunidade — checklist pré-prescrição.
Tabela: cenário clínico → via preferencial → monitoramento.`,
  },
  {
    position: 16,
    module_position: 7,
    module_title: "Módulo 7 · Implantes e mulher",
    topic: "Guia de bolso: calendário de labs, red flags e descontinuação em hormonioterapia injetável/implante",
    extra: `Quick_ref mestre do curso expandido:
- Calendário 0–3–6–12 meses (homem e mulher) — o que pedir e por quê.
- Metas laboratoriais sem “otimizar para o topo da faixa” cosmética.
- Quando reduzir dose, trocar via, pausar ou descontinuar.
- Red flags: Hct alto, PSA, sangramento irregular, cefaleia/visão, nódulo mamário, EA local grave.
- Ponte com o curso de Manipulados (qualidade da magistral) sem repetir microbiologia inteira.
Caso integrado final: pedido de implante “anti-aging” sem deficiência — condução correta.`,
  },
];

export const HORMONIOS_COURSE_META = {
  slug: "hormonios-implantes-criterio",
  title: "Hormônios Injetáveis e Implantes com Critério",
  subtitle: "Diagnóstico, formulário operacional, técnica e ética — sem protocolo de Instagram",
  category: "Endocrinologia",
  level: "Avançado",
  description:
    "Flagship Doutiva de hormonioterapia: hipogonadismo e menopausa com diagnóstico rigoroso, formulário das vias injetáveis e implantes (dose, intervalo, técnica, labs), limites (GH/secretagogos), CFM e monitorização completa — 16 aulas para o prescritor que recusa atalho cosmético.",
  instructor_name: "Conselho editorial Doutiva",
  instructor_title: "Endocrinologia · Ginecologia · Hormonioterapia ética",
};
