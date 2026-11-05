/**
 * Doutiva curriculum catalog v3 — six premium courses for endo/nutro,
 * Premium clinical curricula for endo/nutro (sterile injectables literacy, incretins, hormones, IV).
 * Consumed by bootstrap + deepen scripts. No commercial partner branding.
 */

export const AUDIENCE = `Público: endocrinologistas, nutrólogos e clínicos exigentes.
Contexto Doutiva: educação médica independente que qualifica prescrição ética (tirzepatida/incretinas, hormônios/implantes, soroterapia e injetáveis estéreis) — jamais empurrar research-peptide, GH anti-aging ou drip sem critério.
Tom: tratado clínico premium, números reais, regulatório BR explícito. Sem menção a marcas de farmácia ou parceiros comerciais.`;

export const COURSES = [
  {
    slug: "tirzepatida-incretinas-consultorio",
    title: "Tirzepatida e Incretinas no Consultório",
    subtitle: "Da indicação ao frasco · playbook operacional",
    category: "Metabolismo",
    level: "Avançado",
    description:
      "Curso operacional premium para quem já entende incretinas e precisa fechar a conduta no Brasil: seleção, titulação, falha, switch, composição corporal, documentação e parceria com manipulação estéril de qualidade. Complementa o tratado de Peptídeos com o playbook da receita recorrente.",
    lessons: [
      {
        position: 1,
        module_position: 1,
        module_title: "Módulo 1 · Decisão de iniciar",
        topic: "Fenotipagem do candidato à incretina: quem inicia, quem espera, quem não deve",
        extra:
          "IMC, comorbidades (DM2, DCV, DRC, AOS, MASLD, HFpEF), motivação, custo, contraindições (MTC/MEN2, gestação). Checklist de triagem de 10 minutos. Separar desejo estético de indicação clínica.",
      },
      {
        position: 2,
        module_position: 1,
        module_title: "Módulo 1 · Decisão de iniciar",
        topic: "Semaglutida vs tirzepatida: como escolher no mundo real brasileiro",
        extra:
          "Comparar eficácia, GI, acesso, custo, indicação CV/renal, preferência do paciente. Tabela decisória. Quando começar direto em tirze vs sema. Status de registro/manipulação — sem inventar aprovação.",
      },
      {
        position: 3,
        module_position: 2,
        module_title: "Módulo 2 · Titulação e frasco",
        topic: "Titulação prática de tirzepatida e semaglutida: degraus, pausas e antiemese",
        extra:
          "Esquemas semana a semana, quando não subir dose, antieméticos, refeições, hidratação. Tabela de degraus. Erros comuns que geram abandono.",
      },
      {
        position: 4,
        module_position: 2,
        module_title: "Módulo 2 · Titulação e frasco",
        topic: "Manipulação estéril, estabilidade, armazenamento e qualidade do frasco",
        extra:
          "Por que esterilidade importa; cadeia de frio; o que perguntar à farmácia; diferença indústria vs manipulado; documentação mínima na receita; sinais de red flag de qualidade. Critérios objetivos de farmácia estéril, sem citar marcas.",
      },
      {
        position: 5,
        module_position: 3,
        module_title: "Módulo 3 · Acompanhamento",
        topic: "Monitoramento clínico e laboratorial sob incretina: visitas, labs e adesão",
        extra:
          "Agenda de retornos, HbA1c, lipídios, função renal/hepática, sintomas GI, humor, visão em DM. Métricas de sucesso 5/10/15%. Prontuário mínimo.",
      },
      {
        position: 6,
        module_position: 3,
        module_title: "Módulo 3 · Acompanhamento",
        topic: "Falha terapêutica, plateau e switch semaglutida ↔ tirzepatida",
        extra:
          "Definir falha vs não-adesão vs dose insuficiente. Protocolo de switch, washout prático, expectativas. Casos de reganho.",
      },
      {
        position: 7,
        module_position: 4,
        module_title: "Módulo 4 · Segurança operacional",
        topic: "Segurança no dia a dia: GI, vesícula, perioperatório, gestação e comunicação de risco",
        extra:
          "Script de consentimento, quando pausar, anestesia/esvaziamento gástrico, washout pré-concepção, colelitíase. Checklist de segurança para a clínica.",
      },
      {
        position: 8,
        module_position: 4,
        module_title: "Módulo 4 · Segurança operacional",
        topic: "Massa magra sob incretina: o que medir e como preservar na prática",
        extra:
          "DEXA/BIA, proteína, treino, quando suspeitar sarcopenia iatrogênica. Ponte para o curso de sarcopenia sem duplicar o tratado inteiro — foco operacional.",
      },
      {
        position: 9,
        module_position: 5,
        module_title: "Módulo 5 · Clínica e negócio ético",
        topic: "Documentação, TCLE, custo-benefício e proposta de valor da terapia contínua",
        extra:
          "Modelo de TCLE, conversa de custo mensal, manutenção vs ciclo curto, ética de recorrência. Como documentar e sustentar prescrição responsável no longo prazo.",
      },
      {
        position: 10,
        module_position: 5,
        module_title: "Módulo 5 · Clínica e negócio ético",
        topic: "Casos clínicos operacionais: início, intolerância, falha, DCV e pedido estético",
        extra:
          "Cinco vinhetas densas no teaching; clinical_case principal = candidato SELECT-like. Incluir o que documentar e como orientar a farmácia.",
      },
    ],
  },
  {
    slug: "hormonios-implantes-criterio",
    title: "Hormônios e Implantes com Critério",
    subtitle: "Indicação real vs anti-aging · ética e monitorização",
    category: "Endocrinologia",
    level: "Avançado",
    description:
      "Tratado clínico sobre terapia hormonal e implantes para médicos que atendem queixas de longevidade e performance: diagnóstico rigoroso, evidência, CFM, monitorização e manipulação responsável — sem protocolos de Instagram.",
    lessons: [
      {
        position: 1,
        module_position: 1,
        module_title: "Módulo 1 · Fundamentos",
        topic: "Eixo hormonal no adulto: o que é deficiência, o que é otimização cosmética",
        extra:
          "Fisiologia, ritmos, binding proteins, interpretação de labs. Distinção deficiência vs desejo de performance. CFM 2.333/2023.",
      },
      {
        position: 2,
        module_position: 1,
        module_title: "Módulo 1 · Fundamentos",
        topic: "Avaliação laboratorial e clínica antes de qualquer hormônio: o mínimo inegociável",
        extra:
          "Painel por sexo/idade, repetições, interferências, SHBG, sintomas vs números. Checklist pré-prescrição.",
      },
      {
        position: 3,
        module_position: 2,
        module_title: "Módulo 2 · Homem",
        topic: "Hipogonadismo masculino: diagnóstico, TRT, vias (gel, injetável, implante) e riscos",
        extra:
          "Critérios Endocrine Society/consensos, hematócrito, PSA, fertilidade, apneia, CV. Comparar vias e papel da manipulação. Nunca TRT ‘anti-aging’ sem diagnóstico.",
      },
      {
        position: 4,
        module_position: 2,
        module_title: "Módulo 2 · Homem",
        topic: "Implantes de testosterona: técnica conceitual, farmacocinética, picos/vales e follow-up",
        extra:
          "Indicações selecionadas, curvas, complicações locais, monitoramento. Separar hype de clínica.",
      },
      {
        position: 5,
        module_position: 3,
        module_title: "Módulo 3 · Mulher",
        topic: "THM na menopausa: evidência pós-WHI, janela de oportunidade e vias",
        extra:
          "Benefícios/riscos, estradiol/progesterona, transdérmico vs oral, implantes — cautela e evidência. Mama, trombo, idade.",
      },
      {
        position: 6,
        module_position: 3,
        module_title: "Módulo 3 · Mulher",
        topic: "Implantes hormonais femininos e ‘bioidênticos’: o que a evidência sustenta",
        extra:
          "Compounded bioidentical vs regulado; ACOG/Endocrine statements; riscos de dose não padronizada. Como conversar com a paciente.",
      },
      {
        position: 7,
        module_position: 4,
        module_title: "Módulo 4 · Limites",
        topic: "GH, secretagogos, DHEA, pregnenolona e cocktails ‘longevidade’: leitura crítica",
        extra:
          "O que tem indicação, o que é extrapolação, WADA, CFM. Script de recusa ética. Ponte com Peptídeos sem repetir monografia inteira.",
      },
      {
        position: 8,
        module_position: 4,
        module_title: "Módulo 4 · Limites",
        topic: "Segurança, farmacovigilância e responsabilidade do prescritor + farmácia",
        extra:
          "Eventos adversos, rastreabilidade do lote, consentimento, publicidade. Papel da farmácia estéril de qualidade.",
      },
      {
        position: 9,
        module_position: 5,
        module_title: "Módulo 5 · Prática",
        topic: "Protocolos de monitorização e descontinuação: o ciclo completo do cuidado",
        extra:
          "Calendário de labs, metas, quando reduzir/parar, fertilidade futura. Tabelas práticas.",
      },
      {
        position: 10,
        module_position: 5,
        module_title: "Módulo 5 · Prática",
        topic: "Casos: hipogonadismo real, pedido anti-aging, menopausa sintomática, implante complicado",
        extra:
          "Quatro vinhetas; clinical_case = homem com sintomas + labs limítrofes exigindo rigor diagnóstico.",
      },
    ],
  },
  {
    slug: "soroterapia-injetaveis-estereis",
    title: "Soroterapia e Injetáveis Estéreis com Critério",
    subtitle: "Segurança, evidência e qualidade da manipulação",
    category: "Terapêutica",
    level: "Intermediário–Avançado",
    description:
      "Curso para médicos que prescrevem ou querem prescrever terapia intravenosa e injetáveis: bases de esterilidade, estabilidade, indicações com respaldo, mitos de drip bars e como escolher farmácia de manipulação séria.",
    lessons: [
      {
        position: 1,
        module_position: 1,
        module_title: "Módulo 1 · Bases",
        topic: "Por que esterilidade e qualidade mudam o risco: microbiologia prática para o prescritor",
        extra:
          "Contaminação, endotoxina, sala limpa, ISO, validação. Casos históricos de surtos ligados a compounding. Sem alarmismo — com responsabilidade.",
      },
      {
        position: 2,
        module_position: 1,
        module_title: "Módulo 1 · Bases",
        topic: "Farmacotécnica que o médico precisa entender: osmolaridade, pH, compatibilidade e estabilidade",
        extra:
          "Tabela de conceitos; o que pode e não pode misturar; fotossensibilidade; prazo de uso. Como ler um laudo/rótulo de manipulado.",
      },
      {
        position: 3,
        module_position: 2,
        module_title: "Módulo 2 · Evidência",
        topic: "O que a evidência sustenta em reposição IV: deficiências documentadas vs moda",
        extra:
          "Vitamina C, complexo B, magnésio, ferro IV (quando indicado), hidratação. Separar deficiência laboratorial de wellness drip.",
      },
      {
        position: 4,
        module_position: 2,
        module_title: "Módulo 2 · Evidência",
        topic: "Myers cocktail, NAD+, alta dose de vitamina C e outras modas: leitura crítica",
        extra:
          "Nível de evidência, riscos, marketing. Tom Doutiva: educar sem ridicularizar o paciente.",
      },
      {
        position: 5,
        module_position: 3,
        module_title: "Módulo 3 · Segurança clínica",
        topic: "Seleção de paciente, acesso venoso, monitoramento e manejo de reações",
        extra:
          "Contraindicações, extravasamento, anafilaxia, sobrecarga hídrica, eletrólitos. Checklist pré-infusão.",
      },
      {
        position: 6,
        module_position: 3,
        module_title: "Módulo 3 · Segurança clínica",
        topic: "Ambiente de infusão: consultório vs day clinic vs drip bar — padrões mínimos",
        extra:
          "Estrutura, equipe, emergências, descarte, registro. Quando NÃO infundir fora de ambiente adequado.",
      },
      {
        position: 7,
        module_position: 4,
        module_title: "Módulo 4 · Prescrição e qualidade",
        topic: "Como prescrever injetável manipulado com qualidade: receita, justificativa e rastreio",
        extra:
          "Elementos da prescrição, CID/justificativa clínica, lote, farmacovigilância. Critérios objetivos para escolher farmácia de manipulação estéril (sem citar marcas).",
      },
      {
        position: 8,
        module_position: 4,
        module_title: "Módulo 4 · Prescrição e qualidade",
        topic: "Regulatório BR: ANVISA, responsabilidade compartilhada médico–farmácia",
        extra:
          "Marcos regulatórios de manipulação, publicidade, limites éticos. O que o prescritor deve exigir em contrato/qualidade.",
      },
      {
        position: 9,
        module_position: 5,
        module_title: "Módulo 5 · Integração",
        topic: "Encaixe com obesidade, hormônios e performance: quando IV agrega e quando atrapalha",
        extra:
          "Integração ao plano terapêutico; evitar IV como substituto de conduta. Casos de uso legítimos.",
      },
      {
        position: 10,
        module_position: 5,
        module_title: "Módulo 5 · Integração",
        topic: "Casos: deficiência real, pedido de drip ‘detox’, reação adversa, escolha de farmácia",
        extra:
          "Clinical_case = paciente pedindo Myers sem deficiência; teaching com recusa fundamentada + alternativa.",
      },
    ],
  },
  {
    slug: "obesidade-precisao-consultorio",
    title: "Obesidade de Precisão no Consultório",
    subtitle: "Fenótipos, multimodalidade e realidade brasileira",
    category: "Metabolismo",
    level: "Avançado",
    description:
      "Abordagem completa da obesidade para endócrino e nutrólogo: fenótipos, anti-obesidade oral e injetável, comportamento, cirurgia, pós-bariátrica e manutenção — com foco em desfecho e acesso no Brasil.",
    lessons: [
      {
        position: 1,
        module_position: 1,
        module_title: "Módulo 1 · Bases",
        topic: "Obesidade como doença crônica: fisiopatologia, set point e estigma no consultório",
        extra:
          "Adiposidade, inflamação, recompensa alimentar, linguagem não estigmatizante. Epidemiologia BR.",
      },
      {
        position: 2,
        module_position: 1,
        module_title: "Módulo 1 · Bases",
        topic: "Fenotipagem prática: fome, saciedade, emocional, sarcopênico, metabolicamente doente",
        extra:
          "Ferramentas clínicas simples; como o fenótipo muda farmacoterapia e estilo de vida.",
      },
      {
        position: 3,
        module_position: 2,
        module_title: "Módulo 2 · Avaliação",
        topic: "Avaliação inicial completa: história, exames, composição, sono, humor e metas",
        extra:
          "Checklist de 1ª consulta; labs; quando pedir DEXA/polissonografia/psiquiatria.",
      },
      {
        position: 4,
        module_position: 2,
        module_title: "Módulo 2 · Avaliação",
        topic: "Metas SMART e contrato terapêutico: o que é sucesso além da balança",
        extra:
          "Metas % peso, cintura, labs, função; evitar metas mágicas; manutenção como fase.",
      },
      {
        position: 5,
        module_position: 3,
        module_title: "Módulo 3 · Tratamento",
        topic: "Farmacoterapia anti-obesidade oral no Brasil: evidência, doses e combinação",
        extra:
          "Agentes disponíveis/relevantes (sibutramina se aplicável ao contexto BR com cautela regulatória, naltrexona/bupropiona, orlistate, etc.) — verificar status; não inventar. Tabela risco-benefício.",
      },
      {
        position: 6,
        module_position: 3,
        module_title: "Módulo 3 · Tratamento",
        topic: "Incretinas na obesidade multimodal: encaixe com dieta, exercício e comportamento",
        extra:
          "Não repetir tratado de Peptídeos: foco em integração multimodal e timing. Ponte para curso tirzepatida.",
      },
      {
        position: 7,
        module_position: 4,
        module_title: "Módulo 4 · Cirurgia e especial",
        topic: "Indicação cirúrgica, preparo clínico e cuidado pós-bariátrica no consultório clínico",
        extra:
          "Critérios, deficiências, dumping, farmacoterapia adjuvante, quando incretina pós-cirurgia.",
      },
      {
        position: 8,
        module_position: 4,
        module_title: "Módulo 4 · Cirurgia e especial",
        topic: "Transtorno alimentar, compulsão e quando NÃO empurrar só farmacoterapia",
        extra:
          "Screening, red flags, encaminhamento, risco de medicalizar TEA. Ética.",
      },
      {
        position: 9,
        module_position: 5,
        module_title: "Módulo 5 · Manutenção",
        topic: "Manutenção do peso e prevenção de reganho: o jogo longo",
        extra:
          "Estratégias, farmacoterapia contínua, recaída, custo. Dados STEP de retirada.",
      },
      {
        position: 10,
        module_position: 5,
        module_title: "Módulo 5 · Manutenção",
        topic: "Casos integrados: fenótipo emocional, sarcopênico, pós-bariátrica e DCV",
        extra:
          "Clinical_case principal = obesidade + DCV + escolha multimodal. Teaching com plano de 12 meses.",
      },
    ],
  },
  {
    slug: "sarcopenia-composicao-performance",
    title: "Sarcopenia, Composição Corporal e Performance",
    subtitle: "Magra, força e longevidade clínica",
    category: "Composição corporal",
    level: "Avançado",
    description:
      "Curso para preservar e reconstruir massa magra em emagrecimento, envelhecimento e performance clínica: diagnóstico, DEXA, proteína, treino, hormônios com critério e mitos de performance.",
    lessons: [
      {
        position: 1,
        module_position: 1,
        module_title: "Módulo 1 · Diagnóstico",
        topic: "Sarcopenia e dinapenia: definições EWGSOP2/AWGS e relevância clínica",
        extra:
          "Critérios, cutoffs, diferença de baixa massa vs baixa força. Epidemiologia.",
      },
      {
        position: 2,
        module_position: 1,
        module_title: "Módulo 1 · Diagnóstico",
        topic: "Como medir: DEXA, BIA, ultrassom, force plate, testes funcionais — prós e limites",
        extra:
          "Tabela comparativa; o que pedir no consultório BR; erros de interpretação.",
      },
      {
        position: 3,
        module_position: 2,
        module_title: "Módulo 2 · Nutrição",
        topic: "Proteína, energia e timing: alvos práticos por idade e sob déficit calórico",
        extra:
          "g/kg, distribuição/refeições, whey vs comida, idosos, restrição sob GLP-1.",
      },
      {
        position: 4,
        module_position: 2,
        module_title: "Módulo 2 · Nutrição",
        topic: "Micronutrientes e adjuvantes: creatina, vitamina D, ômega-3 — evidência sóbria",
        extra:
          "O que tem suporte, doses, o que é hype. Sem checklist de 30 suplementos.",
      },
      {
        position: 5,
        module_position: 3,
        module_title: "Módulo 3 · Treino",
        topic: "Treino de força como prescrição médica: princípios para o clínico prescrever/encaminhar",
        extra:
          "Frequência, progressão, segurança, articulação com personal/fisio. Modelo de prescrição textual.",
      },
      {
        position: 6,
        module_position: 3,
        module_title: "Módulo 3 · Treino",
        topic: "Emagrecimento com preservação de magra: protocolo sob incretina e déficit",
        extra:
          "Integração com tirzepatida/sema; plateaus; ‘Ozempic face’. Ponte aos outros cursos.",
      },
      {
        position: 7,
        module_position: 4,
        module_title: "Módulo 4 · Hormônio e limites",
        topic: "Testosterona, menopausa e massa magra: quando hormônio entra na equação",
        extra:
          "Critérios; não usar hormônio como atalho esportivo. Remeter ao curso de hormônios.",
      },
      {
        position: 8,
        module_position: 4,
        module_title: "Módulo 4 · Hormônio e limites",
        topic: "GH, secretagogos, SARMs e atalhos de performance: recusa fundamentada",
        extra:
          "Riscos, WADA, CFM. Script para atleta/executivo. Evidência D vs marketing.",
      },
      {
        position: 9,
        module_position: 5,
        module_title: "Módulo 5 · Populações",
        topic: "Idoso frágil, mulher perimenopausa e recuperacão pós-emagrecimento acentuado",
        extra:
          "Protocolos diferenciados; metas funcionais; segurança.",
      },
      {
        position: 10,
        module_position: 5,
        module_title: "Módulo 5 · Populações",
        topic: "Casos: sarcopenia + obesidade, GLP-1 com perda magra, executivo pedindo GH",
        extra:
          "Clinical_case = obesidade sarcopênica iniciando incretina. Plano de 16 semanas.",
      },
    ],
  },
  {
    slug: "ia-pratica-medica",
    title: "IA na Prática Médica",
    subtitle: "Evidência, ética, LGPD e fluxo clínico",
    category: "Prática digital",
    level: "Intermediário–Avançado",
    description:
      "Curso para médicos que querem usar IA com rigor: fundamentos, evidência de desempenho, vieses, LGPD, responsabilidade, prontuário, educação médica e o modelo Doutiva (Tutor com citação e gate de fidelidade).",
    lessons: [
      {
        position: 1,
        module_position: 1,
        module_title: "Módulo 1 · Fundamentos",
        topic: "O que o médico precisa entender de modelos generativos sem virar engenheiro",
        extra:
          "LLM vs ML clássico, alucinação, temperatura, contexto, RAG. Analogias clínicas. Limites.",
      },
      {
        position: 2,
        module_position: 1,
        module_title: "Módulo 1 · Fundamentos",
        topic: "Evidência de desempenho de IA em tarefas clínicas: o que já foi medido",
        extra:
          "Diagnóstico diferencial, imagem, documentação — citar estudos reais conhecidos com cautela; níveis de evidência; vieses de benchmark.",
      },
      {
        position: 3,
        module_position: 2,
        module_title: "Módulo 2 · Risco",
        topic: "Alucinações, vieses, inequidade e erros silenciosos: como auditar na prática",
        extra:
          "Framework de verificação; quando a IA erra com confiança; populações sub-representadas.",
      },
      {
        position: 4,
        module_position: 2,
        module_title: "Módulo 2 · Risco",
        topic: "LGPD, sigilo e dados de saúde: o mínimo legal para usar ferramentas de IA",
        extra:
          "Base legal, operadores, dados sensíveis, ferramentas consumer vs enterprise, consentimento. Checklist do consultório.",
      },
      {
        position: 5,
        module_position: 3,
        module_title: "Módulo 3 · Fluxos",
        topic: "IA na documentação clínica: SOAP, sumários e risco de ‘nota bonita e errada’",
        extra:
          "Boas práticas de ambient scribe; revisão humana obrigatória; responsabilidade.",
      },
      {
        position: 6,
        module_position: 3,
        module_title: "Módulo 3 · Fluxos",
        topic: "IA na decisão clínica: apoio vs automação — fronteiras éticas do CFM e do bom senso",
        extra:
          "A IA não substitui o médico; documentação de uso; segunda opinião. Evitar dependência.",
      },
      {
        position: 7,
        module_position: 4,
        module_title: "Módulo 4 · Educação e Doutiva",
        topic: "IA na educação médica: Tutores, citação obrigatória e fidelidade claim↔fonte",
        extra:
          "Como a Doutiva ancora respostas em biblioteca com [S#] e gates; por que isso importa vs ChatGPT genérico. Modelo a copiar na clínica educacional.",
      },
      {
        position: 8,
        module_position: 4,
        module_title: "Módulo 4 · Educação e Doutiva",
        topic: "Desinformação médica amplificada por IA e redes: defesa do prescritor",
        extra:
          "Paciente chega com protocolo de peptídeo/hormônio gerado por IA; como responder com evidência. Script.",
      },
      {
        position: 9,
        module_position: 5,
        module_title: "Módulo 5 · Implantação",
        topic: "Como implantar IA no consultório/clínica em 90 dias com governança mínima",
        extra:
          "Política interna, fornecedores, treinamento da equipe, métricas, incidentes. Tabela de maturidade.",
      },
      {
        position: 10,
        module_position: 5,
        module_title: "Módulo 5 · Implantação",
        topic: "Casos: alucinação em conduta, vazamento de dado, Tutor bem usado, hype de paciente",
        extra:
          "Clinical_case = médico quase aceita dose errada sugerida por LLM. Teaching de verificação.",
      },
    ],
  },
];

export function allLessonSpecs() {
  const out = [];
  for (const c of COURSES) {
    for (const L of c.lessons) {
      out.push({
        courseSlug: c.slug,
        courseTitle: c.title,
        ...L,
      });
    }
  }
  return out;
}
