/**
 * Doutiva — 5 cursos de negócios para médicos.
 * Tom: consultório real BR, ética CFM, sem folder de indústria.
 * Consumido por bootstrap + deepen business.
 */

export const AUDIENCE_BUSINESS = `Público: médicos com consultório próprio, clínicas e especialistas
(endocrino, nutro, clínica geral, longevidade) que querem profissionalizar o negócio
sem virar “influencer vazio”.

Tom Doutiva:
- Direto, números, planilhas mentais, scripts de conversa.
- Ética: independência de indústria; nunca empurrar marca de farmácia.
- Objetivo: EAD como porta → hábito → agenda cheia → escada (evento/imersão/mentoria)
  e prescritor com critério (Purus ganha na conduta, não no marketing).
- Casos brasileiros realistas (ticket, WhatsApp, equipe pequena).`;

export const BUSINESS_COURSES = [
  {
    slug: "precificacao-margem-consultorio",
    title: "Precificação e Margem no Consultório",
    subtitle: "Do preço por hora ao programa que paga a clínica",
    category: "Negócios",
    level: "Intermediário",
    accent: "gold",
    description:
      "Como precificar consulta, protocolo e programa de 3–12 meses com margem real: custo oculto, ticket, inadimplência e conversa de valor sem parecer vendedor. Playbook para médico que ainda cobra “por atendimento”.",
    instructor_name: "Conselho editorial Doutiva",
    instructor_title: "Gestão clínica · Economia da prática médica",
    lessons: [
      {
        position: 1,
        module_position: 1,
        module_title: "Módulo 1 · Custo real",
        topic: "O custo oculto da sua consulta: tempo, risco e overhead",
        extra:
          "Mapear custo por hora produtiva (aluguel, equipe, impostos, marketing, tempo clínico + administrativo). Separar receita bruta de margem. Exercício: calcular o preço mínimo ético da sua consulta.",
      },
      {
        position: 2,
        module_position: 1,
        module_title: "Módulo 1 · Custo real",
        topic: "Ticket vs volume: a armadilha de encher a agenda barato",
        extra:
          "Quando volume destrói qualidade e margem. Capacidade semanal real. Tabela: 4 cenários de ticket × ocupação. Quando dizer não.",
      },
      {
        position: 3,
        module_position: 2,
        module_title: "Módulo 2 · Produtos",
        topic: "Da consulta avulsa ao programa de 3, 6 e 12 meses",
        extra:
          "Desenhar oferta: avaliação → protocolo → follow-ups. O que entra no pacote. Como precificar programa sem desconto predatório. Modelo de proposta em uma página.",
      },
      {
        position: 4,
        module_position: 2,
        module_title: "Módulo 2 · Produtos",
        topic: "Conversa de preço: script ético que fecha sem pressão",
        extra:
          "Scripts para WhatsApp e consultório. Objeções (caro, vou pensar, concorrente). Como ancorar valor clínico. O que nunca falar.",
      },
      {
        position: 5,
        module_position: 3,
        module_title: "Módulo 3 · Margem viva",
        topic: "Inadimplência, reajuste e manutenção da carteira",
        extra:
          "Política de pagamento, inadimplência, reajuste anual, renovação de programa. Indicadores mensais de margem. Caso: clínica com ticket baixo e agenda cheia.",
      },
      {
        position: 6,
        module_position: 3,
        module_title: "Módulo 3 · Margem viva",
        topic: "Caso integrado: reprecificar um consultório de longevidade em 90 dias",
        extra:
          "Vinheta completa: médico endócrino/nutro, ticket atual, custos, novo menu de ofertas, meta de margem. Plano semana a semana.",
      },
    ],
  },
  {
    slug: "funil-clinico-agenda",
    title: "Funil Clínico que Enche a Agenda",
    subtitle: "Do interesse ao protocolo — sem parecer vendedor",
    category: "Negócios",
    level: "Intermediário",
    accent: "teal",
    description:
      "Funil completo para clínica médica: origem do lead, qualificação, Raio-X/avaliação, proposta de protocolo e retenção. Scripts, WhatsApp, lista de espera e métricas de conversão.",
    instructor_name: "Conselho editorial Doutiva",
    instructor_title: "Aquisição ética · Operação de agenda",
    lessons: [
      {
        position: 1,
        module_position: 1,
        module_title: "Módulo 1 · Entrada",
        topic: "De onde vem o paciente certo (e como parar de atrair o errado)",
        extra:
          "Canais: indicação, conteúdo, Google, parceiros. Qualificar perfil clínico e capacidade de pagamento. Filtros educados. Lista de espera ativa.",
      },
      {
        position: 2,
        module_position: 1,
        module_title: "Módulo 1 · Entrada",
        topic: "WhatsApp clínico: primeiros 10 minutos que decidem a consulta",
        extra:
          "Templates de resposta, triagem, o que pedir antes de agendar, quando oferecer avaliação vs consulta. Evitar spam e tom comercial agressivo.",
      },
      {
        position: 3,
        module_position: 2,
        module_title: "Módulo 2 · Conversão",
        topic: "Raio-X / avaliação: o ritual que prepara a venda do protocolo",
        extra:
          "Estrutura de 20–40 min: história, labs, objetivos, gap. Como a avaliação vira proposta natural. Checklist e prontuário mínimo.",
      },
      {
        position: 4,
        module_position: 2,
        module_title: "Módulo 2 · Conversão",
        topic: "Da avaliação ao sim: proposta de protocolo em uma página",
        extra:
          "Modelo visual de proposta (problema → plano → investimento → próximos passos). Follow-up em 48h/7 dias. Taxa de conversão alvo.",
      },
      {
        position: 5,
        module_position: 3,
        module_title: "Módulo 3 · Retenção",
        topic: "Retenção e reativação: o funil depois da primeira consulta",
        extra:
          "No-show, cancelamento, reativação de inativos, NPS clínico. Sequência de mensagens pós-consulta. Métricas semanais do funil.",
      },
      {
        position: 6,
        module_position: 3,
        module_title: "Módulo 3 · Retenção",
        topic: "Caso integrado: encher 12 slots/semana em 60 dias",
        extra:
          "Clínica com agenda oca. Diagnóstico do funil, mudanças de script, meta por etapa, o que medir toda segunda-feira.",
      },
    ],
  },
  {
    slug: "gestao-clinica-uma-pagina",
    title: "Gestão da Clínica em Uma Página",
    subtitle: "Os números que o médico olha toda segunda",
    category: "Negócios",
    level: "Intermediário",
    accent: "ink",
    description:
      "Painel enxuto de gestão: ocupação, CAC, LTV, ticket médio, margem, inadimplência e meta semanal. Sem ERP pesado — uma página que cabe na rotina do médico-dono.",
    instructor_name: "Conselho editorial Doutiva",
    instructor_title: "Indicadores · Operação enxuta",
    lessons: [
      {
        position: 1,
        module_position: 1,
        module_title: "Módulo 1 · Números",
        topic: "Os 8 indicadores que bastam (e os 40 que você pode ignorar)",
        extra:
          "Ocupação, ticket, margem, CAC, LTV, no-show, inadimplência, NPS. Definições simples. Planilha-mãe em uma aba.",
      },
      {
        position: 2,
        module_position: 1,
        module_title: "Módulo 1 · Números",
        topic: "CAC e LTV na clínica pequena: calcular sem ilusão",
        extra:
          "Como estimar CAC com marketing + tempo. LTV de programa vs avulso. Quando um canal ‘barato’ é caro. Exercício numérico.",
      },
      {
        position: 3,
        module_position: 2,
        module_title: "Módulo 2 · Rotina",
        topic: "Ritual de segunda: 25 minutos que governam a semana",
        extra:
          "Agenda do dono: revisar números, gaps de agenda, cobranças, equipe. Template de reunião solo ou com secretária.",
      },
      {
        position: 4,
        module_position: 2,
        module_title: "Módulo 2 · Rotina",
        topic: "Equipe mínima: quem faz o quê até R$ X de faturamento",
        extra:
          "Secretária, enfermagem, parceiro administrativo. Quando contratar. Briefs e SLAs internos. Erros caros de delegação.",
      },
      {
        position: 5,
        module_position: 3,
        module_title: "Módulo 3 · Decisão",
        topic: "Decisões com número: cortar, investir ou esperar",
        extra:
          "Framework: impacto × esforço × caixa. Casos: contratar marketing, subir preço, abrir segundo turno, comprar equipamento.",
      },
      {
        position: 6,
        module_position: 3,
        module_title: "Módulo 3 · Decisão",
        topic: "Caso integrado: clínica no vermelho com agenda ‘cheia’",
        extra:
          "Diagnóstico pelos 8 indicadores, plano de 90 dias, o que mudar na semana 1. Teaching denso com tabela.",
      },
    ],
  },
  {
    slug: "posicionamento-autoridade-digital",
    title: "Posicionamento e Autoridade Digital",
    subtitle: "Conteúdo que gera consulta — sem virar influencer vazio",
    category: "Negócios",
    level: "Intermediário",
    accent: "sage",
    description:
      "Como o médico constrói autoridade ética no digital: posicionamento, pilares de conteúdo, LinkedIn/Instagram/YouTube com critério, prova social e limites CFM — gerando consulta qualificada.",
    instructor_name: "Conselho editorial Doutiva",
    instructor_title: "Marca pessoal · Comunicação médica",
    lessons: [
      {
        position: 1,
        module_position: 1,
        module_title: "Módulo 1 · Posição",
        topic: "Posicionamento em uma frase: para quem você é a óbvia escolha",
        extra:
          "Nicho clínico + problema + prova. Exemplos bons e ruins. Exercício: escrever e testar a frase com 5 colegas.",
      },
      {
        position: 2,
        module_position: 1,
        module_title: "Módulo 1 · Posição",
        topic: "Ética e CFM no digital: o que pode, o que não pode, o que é zona cinzenta",
        extra:
          "Publicidade médica, antes/depois, promessas, depoimentos, marca de produto. Checklist de publicação. Independência de indústria.",
      },
      {
        position: 3,
        module_position: 2,
        module_title: "Módulo 2 · Conteúdo",
        topic: "Pilares de conteúdo clínico que convertem (sem clickbait)",
        extra:
          "Educação, mito vs evidência, caso anonimizado, bastidores de método. Calendário 3 posts/semana sustentável.",
      },
      {
        position: 4,
        module_position: 2,
        module_title: "Módulo 2 · Conteúdo",
        topic: "Do post à consulta: CTA, bio, landing e mensagens",
        extra:
          "Bio que filtra. CTA para avaliação/lista. Como responder comentários e DMs. Métricas: alcance vs consultas geradas.",
      },
      {
        position: 5,
        module_position: 3,
        module_title: "Módulo 3 · Autoridade",
        topic: "Prova social e reputação: reviews, indicações e presença em eventos",
        extra:
          "Como pedir indicação eticamente. Reviews. Papel do evento Doutiva (A Origem) e da universidade no posicionamento.",
      },
      {
        position: 6,
        module_position: 3,
        module_title: "Módulo 3 · Autoridade",
        topic: "Caso integrado: de zero a 8 consultas/mês vindas do digital em 90 dias",
        extra:
          "Plano editorial, canais, meta de conversão, o que medir. Anti-padrões de médico-influencer.",
      },
    ],
  },
  {
    slug: "escala-equipe-mentoria-produtos",
    title: "Escala: Equipe, Mentoria e Produtos",
    subtitle: "Quando crescer — e como não quebrar a clínica",
    category: "Negócios",
    level: "Avançado",
    accent: "copper",
    description:
      "Do consultório solo à operação com equipe e ofertas premium: quando contratar, como desenhar mentoria/imersão/clube, take rate, parcerias éticas e o papel da Doutiva na escada — sem misturar marca de indústria.",
    instructor_name: "Conselho editorial Doutiva",
    instructor_title: "Escala · Produtos premium",
    lessons: [
      {
        position: 1,
        module_position: 1,
        module_title: "Módulo 1 · Pronto para escalar?",
        topic: "Sinais de que você deve (ou não) crescer agora",
        extra:
          "Checklist: margem, ocupação, processos, energia do dono. Crescimento prematuro. Quando estabilizar preço antes de volume.",
      },
      {
        position: 2,
        module_position: 1,
        module_title: "Módulo 1 · Pronto para escalar?",
        topic: "Primeira contratação que multiplica (e a que só multiplica dor)",
        extra:
          "Perfil, remuneração, onboarding, métricas da pessoa. Erros clássicos. Modelo de 30-60-90 dias.",
      },
      {
        position: 3,
        module_position: 2,
        module_title: "Módulo 2 · Produtos caros",
        topic: "Desenhar mentoria, imersão e clube sem diluir o consultório",
        extra:
          "Diferença de job-to-be-done. Capacidade. Preço. Take rate em marketplaces. Como a Doutiva encaixa mentores parceiros.",
      },
      {
        position: 4,
        module_position: 2,
        module_title: "Módulo 2 · Produtos caros",
        topic: "Parcerias (lab, farmácia, eventos) com independência editorial",
        extra:
          "Contratos, conflito de interesse, disclosure. Como educação gera prescritor com critério sem virar folder. Linha vermelha Doutiva.",
      },
      {
        position: 5,
        module_position: 3,
        module_title: "Módulo 3 · Sistema",
        topic: "Operar a escada: EAD → evento → imersão → mentoria",
        extra:
          "Funil de produtos. Quem sobe de degrau. Métricas por oferta. Papel do Caso do Dia e do mapa como porta.",
      },
      {
        position: 6,
        module_position: 3,
        module_title: "Módulo 3 · Sistema",
        topic: "Caso integrado: do solo a 3 ofertas em 12 meses",
        extra:
          "Cronograma trimestral, hiring, lançamento de mentoria, primeiro evento, riscos e contorno. Teaching com tabela de P&L simplificado.",
      },
    ],
  },
];
