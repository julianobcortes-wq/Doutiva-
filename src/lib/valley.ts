import {
  Sprout, HeartPulse, Users, Compass, Sparkles,
  BookOpen, HandHeart, Globe2, Star, Clock,
  type LucideIcon,
} from "lucide-react";

/** Classe do habitante. Nunca muda com nível, plano ou tempo de casa. */
export type UserClass = "lifer" | "valley_expert";

export const classInfo: Record<UserClass, { name: string; tagline: string; desc: string }> = {
  lifer: {
    name: "Médico Aluno",
    tagline: "Formação contínua",
    desc: "O médico que estuda na Doutiva para dominar a ciência de ponta e construir uma carreira à frente do seu tempo.",
  },
  valley_expert: {
    name: "Médico Mentor",
    tagline: "Ensino e mentoria",
    desc: "O médico que ensina, orienta e compartilha método — professores, mentores e referências da medicina do futuro.",
  },
};

export type AttributeKey =
  | "fundacao" | "vitalidade" | "conexao" | "expansao" | "realizacao"
  | "conhecimento" | "contribuicao" | "impacto" | "reputacao" | "experiencia";

export type AttributeDef = {
  key: AttributeKey;
  label: string;
  desc: string;
  icon: LucideIcon;
};

/** Atributos do Médico Aluno — o Mapa de Evolução Humana. */
export const lifeAttributes: AttributeDef[] = [
  { key: "fundacao", label: "Base científica", desc: "Fisiologia, evidência e raciocínio clínico afiado.", icon: Sprout },
  { key: "vitalidade", label: "Biotecnologia", desc: "Terapias, diagnósticos e ferramentas de ponta.", icon: HeartPulse },
  { key: "conexao", label: "Rede médica", desc: "Pares, mentores e colaboração entre especialidades.", icon: Users },
  { key: "expansao", label: "Carreira", desc: "Especialização, posicionamento e autoridade.", icon: Compass },
  { key: "realizacao", label: "Negócio médico", desc: "Gestão, consultório e empreendedorismo em saúde.", icon: Sparkles },
];

/** Atributos do Médico Mentor — a Trilha de Contribuição. */
export const expertAttributes: AttributeDef[] = [
  { key: "conhecimento", label: "Conhecimento", desc: "Profundidade técnica e domínio da sua área.", icon: BookOpen },
  { key: "contribuicao", label: "Contribuição", desc: "O quanto você entrega para a formação de outros médicos.", icon: HandHeart },
  { key: "impacto", label: "Impacto", desc: "Alcance real do que você faz dentro da Doutiva.", icon: Globe2 },
  { key: "reputacao", label: "Reputação", desc: "Confiança construída ao longo do tempo.", icon: Star },
  { key: "experiencia", label: "Experiência", desc: "Maturidade, história e consistência.", icon: Clock },
];

export function attributesFor(userClass: UserClass) {
  return userClass === "valley_expert" ? expertAttributes : lifeAttributes;
}

export type Attributes = Partial<Record<AttributeKey, number>>;

export const defaultLifeAttributes: Attributes = {
  fundacao: 42, vitalidade: 38, conexao: 30, expansao: 46, realizacao: 34,
};

export const defaultExpertAttributes: Attributes = {
  conhecimento: 58, contribuicao: 36, impacto: 28, reputacao: 44, experiencia: 50,
};

/** Estágios de evolução — narrativa, não hierarquia social. */
export const lifeStages = [
  { level: 1, name: "Despertar", desc: "Você decidiu ser o médico do futuro." },
  { level: 5, name: "Fundação", desc: "Você está consolidando sua base científica." },
  { level: 12, name: "Movimento", desc: "O estudo virou rotina de prática clínica." },
  { level: 22, name: "Integração", desc: "Ciência, carreira e negócio caminham juntos." },
  { level: 35, name: "Expansão", desc: "Você vira referência na sua área." },
  { level: 50, name: "Plenitude", desc: "Você pratica a medicina que ajudou a criar." },
];

export const expertStages = [
  { level: 1, name: "Presença", desc: "Você chegou e mostrou quem é." },
  { level: 5, name: "Prática", desc: "Sua atuação começa a ser reconhecida." },
  { level: 12, name: "Autoridade", desc: "Sua voz orienta decisões." },
  { level: 22, name: "Referência", desc: "Pessoas procuram você pelo nome." },
  { level: 35, name: "Legado", desc: "Sua contribuição sustenta outras jornadas." },
  { level: 50, name: "Mestre da Doutiva", desc: "Você forma quem forma." },
];

export function stageFor(userClass: UserClass, level: number) {
  const list = userClass === "valley_expert" ? expertStages : lifeStages;
  return [...list].reverse().find((s) => level >= s.level) ?? list[0];
}

/** Skill tree — ramos por atributo, desbloqueio por nível. */
export type Skill = {
  id: string;
  name: string;
  desc: string;
  attribute: AttributeKey;
  requiredLevel: number;
};

export const lifeSkills: Skill[] = [
  { id: "ritmo", name: "Ritmo de sono", desc: "Consolide horários e qualidade de descanso.", attribute: "fundacao", requiredLevel: 1 },
  { id: "rotina", name: "Rotina âncora", desc: "Três hábitos fixos que sustentam o dia.", attribute: "fundacao", requiredLevel: 6 },
  { id: "movimento", name: "Movimento diário", desc: "Corpo em uso todos os dias, sem exceção.", attribute: "vitalidade", requiredLevel: 1 },
  { id: "nutricao", name: "Nutrição consciente", desc: "Comer com atenção e intenção.", attribute: "vitalidade", requiredLevel: 8 },
  { id: "presenca", name: "Presença real", desc: "Conversas sem tela, atenção inteira.", attribute: "conexao", requiredLevel: 4 },
  { id: "circulo", name: "Círculo de apoio", desc: "Pessoas que puxam você para cima.", attribute: "conexao", requiredLevel: 14 },
  { id: "leitura", name: "Mente em expansão", desc: "Estudo contínuo dentro da Universidade.", attribute: "expansao", requiredLevel: 3 },
  { id: "longevidade", name: "Visão de longevidade", desc: "Decisões pensando em 30 anos à frente.", attribute: "expansao", requiredLevel: 18 },
  { id: "proposito", name: "Propósito nomeado", desc: "Você sabe dizer para onde está indo.", attribute: "realizacao", requiredLevel: 10 },
  { id: "entrega", name: "Entrega consistente", desc: "O que você promete, você cumpre.", attribute: "realizacao", requiredLevel: 24 },
];

export const expertSkills: Skill[] = [
  { id: "dominio", name: "Domínio declarado", desc: "Sua especialidade clara para a cidade.", attribute: "conhecimento", requiredLevel: 1 },
  { id: "metodo", name: "Método próprio", desc: "Uma forma de trabalhar reconhecível.", attribute: "conhecimento", requiredLevel: 12 },
  { id: "conteudo", name: "Conteúdo publicado", desc: "Você ensina o que sabe.", attribute: "contribuicao", requiredLevel: 3 },
  { id: "mentoria", name: "Mentoria ativa", desc: "Sessões que mudam trajetórias.", attribute: "contribuicao", requiredLevel: 10 },
  { id: "audiencia", name: "Audiência viva", desc: "Pessoas acompanham seu trabalho.", attribute: "impacto", requiredLevel: 6 },
  { id: "programa", name: "Programa próprio", desc: "Uma jornada completa assinada por você.", attribute: "impacto", requiredLevel: 20 },
  { id: "avaliacoes", name: "Avaliações consistentes", desc: "Confiança validada por quem foi atendido.", attribute: "reputacao", requiredLevel: 8 },
  { id: "circulo-expert", name: "Círculo Premium", desc: "Presença entre as referências da Doutiva.", attribute: "reputacao", requiredLevel: 26 },
  { id: "historico", name: "Histórico consolidado", desc: "Anos de atuação registrados.", attribute: "experiencia", requiredLevel: 5 },
  { id: "legado", name: "Legado formador", desc: "Você forma outros experts.", attribute: "experiencia", requiredLevel: 32 },
];

export function skillsFor(userClass: UserClass) {
  return userClass === "valley_expert" ? expertSkills : lifeSkills;
}

/** Missões — ações pequenas que movem atributos. */
export type ValleyMission = {
  id: string;
  title: string;
  desc: string;
  xp: number;
  attribute: AttributeKey;
};

export const lifeMissions: ValleyMission[] = [
  { id: "sono", title: "Registrar o sono de ontem", desc: "Consciência antes de mudança.", xp: 20, attribute: "fundacao" },
  { id: "movimento", title: "Mover o corpo por 30 minutos", desc: "Qualquer movimento conta.", xp: 40, attribute: "vitalidade" },
  { id: "agua", title: "Beber 2L de água", desc: "O básico bem feito.", xp: 10, attribute: "vitalidade" },
  { id: "conversa", title: "Uma conversa sem pressa", desc: "Presença com alguém que importa.", xp: 25, attribute: "conexao" },
  { id: "aula", title: "Concluir uma aula", desc: "Expansão diária na Universidade.", xp: 50, attribute: "expansao" },
  { id: "reflexao", title: "Escrever uma reflexão", desc: "Três linhas sobre o seu dia.", xp: 15, attribute: "realizacao" },
];

export const expertMissions: ValleyMission[] = [
  { id: "post", title: "Compartilhar um aprendizado", desc: "Publique algo na Praça Central.", xp: 30, attribute: "contribuicao" },
  { id: "responder", title: "Responder uma dúvida", desc: "Ajude um Médico Aluno hoje.", xp: 25, attribute: "contribuicao" },
  { id: "estudo", title: "Estudar 30 minutos", desc: "Atualize seu domínio técnico.", xp: 40, attribute: "conhecimento" },
  { id: "perfil", title: "Aprimorar seu perfil", desc: "Clareza atrai as pessoas certas.", xp: 20, attribute: "reputacao" },
  { id: "sessao", title: "Conduzir uma sessão", desc: "Impacto direto em uma jornada.", xp: 60, attribute: "impacto" },
  { id: "caso", title: "Registrar um caso", desc: "Sua experiência vira acervo.", xp: 35, attribute: "experiencia" },
];

export function missionsFor(userClass: UserClass) {
  return userClass === "valley_expert" ? expertMissions : lifeMissions;
}

/** Conquistas — marcos simbólicos da jornada. */
export type ValleyAchievement = { id: string; name: string; desc: string; scope: UserClass | "all" };

export const valleyAchievements: ValleyAchievement[] = [
  { id: "chegada", name: "Chegada à Doutiva", desc: "Você deu o primeiro passo.", scope: "all" },
  { id: "sete-dias", name: "Sete dias seguidos", desc: "Constância começa aqui.", scope: "all" },
  { id: "mapa-aberto", name: "Mapa aberto", desc: "Você conheceu suas cinco dimensões.", scope: "lifer" },
  { id: "primeira-habilidade", name: "Primeira habilidade", desc: "Um ramo da sua árvore desbloqueado.", scope: "all" },
  { id: "corpo-em-movimento", name: "Corpo em movimento", desc: "30 dias de vitalidade ativa.", scope: "lifer" },
  { id: "mente-expandida", name: "Mente expandida", desc: "Uma jornada completa na Universidade.", scope: "lifer" },
  { id: "primeira-contribuicao", name: "Primeira contribuição", desc: "Você ajudou alguém a evoluir.", scope: "valley_expert" },
  { id: "voz-reconhecida", name: "Voz reconhecida", desc: "Seu conteúdo alcançou a cidade.", scope: "valley_expert" },
  { id: "referencia", name: "Referência", desc: "Avaliações consistentes ao longo do tempo.", scope: "valley_expert" },
];

export function achievementsFor(userClass: UserClass) {
  return valleyAchievements.filter((a) => a.scope === "all" || a.scope === userClass);
}

/** Ambientes da Doutiva — antes chamados de distritos. */
export const environments = [
  { to: "/academy", name: "Universidade", desc: "Onde o conhecimento vira prática." },
  { to: "/community", name: "Praça Central", desc: "Onde as pessoas se encontram." },
  { to: "/mentors", name: "Médicos Mentores", desc: "Onde a experiência é compartilhada." },
  { to: "/events", name: "Eventos", desc: "Onde a cidade se reúne." },
  { to: "/marketplace", name: "Marketplace", desc: "Cursos, mentorias e serviços entre médicos." },
] as const;

/** Ambientes vistos pelo Médico Aluno — consumo, cuidado e evolução pessoal. */
export const liferEnvironments = [
  { to: "/academy", name: "Universidade", desc: "Trilhas de ciência e carreira no seu ritmo." },
  { to: "/mentors", name: "Encontrar um mentor", desc: "Médicos que já trilharam o caminho." },
  { to: "/community", name: "Praça Central", desc: "Médicos discutindo casos, ciência e carreira." },
  { to: "/events", name: "Experiências", desc: "Encontros e imersões para participar." },
  { to: "/caso-do-dia", name: "Caso do Dia", desc: "Um desafio clínico curto, todos os dias." },
  { to: "/library", name: "Minha biblioteca", desc: "O que você salvou para voltar depois." },
] as const;

/** Ambientes vistos pelo Médico Mentor — produção, atendimento e presença. */
export const expertEnvironments = [
  { to: "/mentors", name: "Meu perfil público", desc: "Como a cidade encontra você." },
  { to: "/community", name: "Praça Central", desc: "Onde sua voz alcança médicos alunos." },
  { to: "/academy", name: "Ensinar na Universidade", desc: "Transforme método em trilha." },
  { to: "/events", name: "Conduzir experiências", desc: "Aulas abertas, summits e imersões." },
  { to: "/editor", name: "Estúdio de Cursos", desc: "Crie aulas profundas ancoradas em estudos." },
  { to: "/marketplace", name: "Marketplace", desc: "Venda cursos, mentorias e serviços." },
] as const;

export function environmentsFor(userClass: UserClass) {
  return userClass === "valley_expert" ? expertEnvironments : liferEnvironments;
}

/** Configuração de experiência por classe — muda linguagem, métricas e painéis. */
export type ClassExperience = {
  kicker: string;
  headlinePrefix: string;
  subtitle: string;
  primaryGroupLabel: string;
  secondaryGroupLabel: string;
  environmentsLabel: string;
  environmentsHint: string;
  mapTitle: string;
  missionsTitle: string;
  missionsHint: string;
  metrics: { key: "score" | "level" | "streak" | "points"; label: string; hint: string }[];
  focusPanel: { title: string; hint: string; rows: { label: string; value: string }[] };
  cta: { title: string; desc: string; to: string; action: string };
};

export const classExperience: Record<UserClass, ClassExperience> = {
  lifer: {
    kicker: "Seu momento hoje",
    headlinePrefix: "você está em",
    subtitle:
      "Sua evolução aqui é medida pelo que sustenta a sua vida: base, corpo, relações, aprendizado e sentido.",
    primaryGroupLabel: "Minha Evolução",
    secondaryGroupLabel: "Minha Vida na Doutiva",
    environmentsLabel: "Onde evoluir agora",
    environmentsHint: "Ambientes abertos para o seu momento.",
    mapTitle: "Mapa de Evolução Humana",
    missionsTitle: "Ações de hoje",
    missionsHint: "Pequenos movimentos que mudam uma dimensão.",
    metrics: [
      { key: "score", label: "Índice de vida", hint: "leitura pessoal" },
      { key: "level", label: "Nível", hint: "" },
      { key: "streak", label: "Constância", hint: "sequência ativa" },
      { key: "points", label: "Pontos Doutiva", hint: "disponíveis" },
    ],
    focusPanel: {
      title: "Sua rotina desta semana",
      hint: "Como o seu dia a dia está se comportando.",
      rows: [
        { label: "Sono registrado", value: "5 de 7 dias" },
        { label: "Movimento", value: "4 sessões" },
        { label: "Aulas concluídas", value: "3 aulas" },
        { label: "Conversas com presença", value: "2 encontros" },
      ],
    },
    cta: {
      title: "Encontre um Médico Mentor",
      desc: "Alguém que já atravessou o que você está atravessando.",
      to: "/mentors",
      action: "Ver experts",
    },
  },
  valley_expert: {
    kicker: "Sua atuação hoje",
    headlinePrefix: "sua atuação está em",
    subtitle:
      "Sua evolução aqui é medida pelo que você sustenta em outras pessoas: conhecimento, contribuição, impacto, reputação e experiência.",
    primaryGroupLabel: "Minha Atuação",
    secondaryGroupLabel: "Minha Operação",
    environmentsLabel: "Onde você atua",
    environmentsHint: "Frentes de contribuição abertas para você.",
    mapTitle: "Mapa de Contribuição",
    missionsTitle: "Entregas de hoje",
    missionsHint: "Ações que ampliam o seu alcance na cidade.",
    metrics: [
      { key: "score", label: "Índice de impacto", hint: "alcance consolidado" },
      { key: "level", label: "Nível", hint: "" },
      { key: "streak", label: "Presença", hint: "dias ativos" },
      { key: "points", label: "Créditos", hint: "disponíveis" },
    ],
    focusPanel: {
      title: "Sua operação desta semana",
      hint: "O que passou pelas suas mãos.",
      rows: [
        { label: "Sessões conduzidas", value: "6 atendimentos" },
        { label: "Dúvidas respondidas", value: "12 respostas" },
        { label: "Conteúdos publicados", value: "2 publicações" },
        { label: "Novos seguidores", value: "+38 médicos alunos" },
      ],
    },
    cta: {
      title: "Amplie sua presença",
      desc: "Perfil completo e conteúdo constante multiplicam convites.",
      to: "/ranking",
      action: "Ver reputação",
    },
  },
};

export function experienceFor(userClass: UserClass) {
  return classExperience[userClass];
}

export const VALLEY_DISCLAIMER =
  "Atributos, mapas e pontuações são recursos de acompanhamento educacional. Não substituem certificação, residência ou título de especialista.";