import type { AttributeKey, UserClass } from "@/lib/valley";

/* ────────────────────────────────────────────────────────────
   Arquitetura tipada da economia, itens, lojas, temporadas e
   jornadas da Doutiva. Dados mockados — persistência futura.
   ──────────────────────────────────────────────────────────── */

/** Curva de nível: começa rápida, endurece com o tempo. */
export function xpForLevel(level: number) {
  return Math.round(120 * Math.pow(level, 1.45));
}

export function levelFromXp(xp: number) {
  let level = 1;
  let acc = 0;
  while (acc + xpForLevel(level) <= xp && level < 60) {
    acc += xpForLevel(level);
    level += 1;
  }
  return { level, xpInLevel: xp - acc, xpToNext: xpForLevel(level) };
}

/* ── Economia ─────────────────────────────────────────────── */

export type LifePointsSource = "earned" | "purchased" | "promotional";

export type Wallet = {
  earned_life_points: number;
  purchased_life_points: number;
  promotional_life_points: number;
};

export type Transaction = {
  id: string;
  label: string;
  detail: string;
  amount: number;
  source: LifePointsSource;
  created_at: string;
  refund_status?: "none" | "requested" | "refunded";
  expires_at?: string;
};

export const emptyWallet: Wallet = {
  earned_life_points: 0,
  purchased_life_points: 0,
  promotional_life_points: 0,
};

export function walletTotal(w: Wallet) {
  return w.earned_life_points + w.purchased_life_points + w.promotional_life_points;
}

export const sourceLabel: Record<LifePointsSource, string> = {
  earned: "Conquistado",
  purchased: "Adquirido",
  promotional: "Promocional",
};

export const mockTransactions: Transaction[] = [
  { id: "t1", label: "Missão concluída — Movimento diário", detail: "Ciclo diário", amount: 40, source: "earned", created_at: "hoje" },
  { id: "t2", label: "Sequência de 7 dias", detail: "Recompensa de consistência", amount: 120, source: "earned", created_at: "há 2 dias" },
  { id: "t3", label: "Pacote de Pontos Doutiva", detail: "Compra transparente · R$ 79", amount: 800, source: "purchased", created_at: "há 6 dias", refund_status: "none" },
  { id: "t4", label: "Boas-vindas à Doutiva", detail: "Válido por 90 dias", amount: 200, source: "promotional", created_at: "há 21 dias", expires_at: "em 69 dias" },
  { id: "t5", label: "Moldura Aurora", detail: "Loja de Personalização", amount: -150, source: "purchased", created_at: "há 3 dias" },
];

/* ── Itens, raridade e inventário ─────────────────────────── */

export type Rarity = "essencial" | "distinto" | "raro" | "excepcional" | "iconico";

export const rarityLabel: Record<Rarity, string> = {
  essencial: "Essencial",
  distinto: "Distinto",
  raro: "Raro",
  excepcional: "Excepcional",
  iconico: "Icônico",
};

export const rarityClass: Record<Rarity, string> = {
  essencial: "border-border/70 text-muted-foreground",
  distinto: "border-sage/40 text-sage",
  raro: "border-gold/40 text-gold",
  excepcional: "border-gold/60 text-gold",
  iconico: "border-gold bg-gold/10 text-gold",
};

export type ItemType =
  | "personalizacao" | "conteudo" | "experiencia" | "servico"
  | "beneficio" | "colecionavel" | "acesso" | "espaco";

export type ValleyItem = {
  id: string;
  name: string;
  desc: string;
  type: ItemType;
  rarity: Rarity;
  price_money_cents?: number;
  price_life_points?: number;
  requirement?: string;
  benefit?: string;
  seller?: string;
  transferable: boolean;
  consumable?: boolean;
  expires_in_days?: number;
  attribute?: AttributeKey;
  scope: UserClass | "all";
};

export type InventoryState = "em_uso" | "disponivel" | "consumivel" | "permanente" | "colecionavel" | "expirado" | "bloqueado";

export const inventoryStateLabel: Record<InventoryState, string> = {
  em_uso: "Em uso",
  disponivel: "Disponível",
  consumivel: "Consumível",
  permanente: "Permanente",
  colecionavel: "Colecionável",
  expirado: "Expirado",
  bloqueado: "Bloqueado",
};

export type InventoryEntry = {
  item_id: string;
  quantity: number;
  acquired_at: string;
  acquisition_source: "missao" | "compra" | "evento" | "presente" | "temporada";
  state: InventoryState;
  expires_at?: string;
};

/* ── Lojas ────────────────────────────────────────────────── */

export type StoreId = "conhecimento" | "experiencias" | "evolucao" | "personalizacao" | "tecnologia" | "experts";

export type Store = {
  id: StoreId;
  name: string;
  tagline: string;
  desc: string;
  scope: UserClass | "all";
};

export const stores: Store[] = [
  { id: "conhecimento", name: "Loja de Conhecimento", tagline: "Autonomia", desc: "Cursos, trilhas, livros e programas conduzidos por Médicos Mentores.", scope: "all" },
  { id: "experiencias", name: "Loja de Experiências", tagline: "Vida real", desc: "Eventos, imersões, retiros e encontros presenciais.", scope: "all" },
  { id: "evolucao", name: "Loja de Evolução", tagline: "Direção", desc: "Avaliações, jornadas guiadas e recursos de acompanhamento.", scope: "all" },
  { id: "personalizacao", name: "Loja de Personalização", tagline: "Identidade", desc: "Temas, molduras, cards e elementos do seu espaço.", scope: "all" },
  { id: "tecnologia", name: "Loja de Tecnologia", tagline: "Suporte", desc: "Integrações, wearables e serviços digitais.", scope: "all" },
  { id: "experts", name: "Loja de Médicos Mentores", tagline: "Julgamento humano", desc: "Consultas, mentorias e acompanhamentos assinados.", scope: "all" },
];

export type StoreProduct = ValleyItem & { store: StoreId };

export const storeProducts: StoreProduct[] = [
  { store: "conhecimento", id: "trilha-sono", name: "Trilha do Sono Profundo", desc: "6 capítulos sobre arquitetura do sono e recuperação.", type: "conteudo", rarity: "distinto", price_money_cents: 24900, price_life_points: 1200, seller: "Dra. Helena Vasques", benefit: "Acesso vitalício + material de apoio", transferable: false, attribute: "fundacao", scope: "all" },
  { store: "conhecimento", id: "biblioteca-longevidade", name: "Acervo de Longevidade", desc: "Curadoria de leituras e sínteses semanais.", type: "conteudo", rarity: "essencial", price_life_points: 400, seller: "Universidade Doutiva", benefit: "12 meses de acesso", transferable: false, attribute: "expansao", scope: "all" },
  { store: "experiencias", id: "imersao-serra", name: "Imersão Serra · 3 dias", desc: "Retiro de recuperação, movimento e silêncio.", type: "experiencia", rarity: "excepcional", price_money_cents: 489000, requirement: "Nível 8+", seller: "Doutiva Experiences", benefit: "Vagas limitadas por edição", transferable: true, scope: "all" },
  { store: "experiencias", id: "jantar-valley", name: "Jantar da Doutiva", desc: "Encontro presencial com alunos e mentores da sua cidade.", type: "experiencia", rarity: "raro", price_money_cents: 39000, price_life_points: 2500, seller: "Doutiva Experiences", transferable: true, scope: "all" },
  { store: "evolucao", id: "avaliacao-inicial", name: "Avaliação Humana Completa", desc: "Leitura das cinco dimensões com devolutiva de um Expert.", type: "servico", rarity: "distinto", price_money_cents: 59000, seller: "Rede Doutiva", benefit: "Atualiza seu Mapa de Evolução", transferable: false, scope: "lifer" },
  { store: "evolucao", id: "jornada-guiada", name: "Jornada guiada de 12 semanas", desc: "Campanha com capítulos, marcos e acompanhamento.", type: "servico", rarity: "raro", price_money_cents: 129000, requirement: "Leitura inicial concluída", seller: "Rede Doutiva", transferable: false, scope: "lifer" },
  { store: "personalizacao", id: "moldura-aurora", name: "Moldura Aurora", desc: "Moldura de perfil em ouro suave.", type: "personalizacao", rarity: "raro", price_life_points: 150, benefit: "Aplicável ao avatar", transferable: false, scope: "all" },
  { store: "personalizacao", id: "tema-obsidiana", name: "Tema Obsidiana", desc: "Tema escuro com acabamento acetinado para seu espaço.", type: "personalizacao", rarity: "distinto", price_life_points: 300, transferable: false, scope: "all" },
  { store: "personalizacao", id: "vitrine-galeria", name: "Vitrine de Galeria", desc: "Nova seção no seu espaço pessoal para coleções.", type: "espaco", rarity: "excepcional", price_life_points: 900, requirement: "Espaço nível 2", transferable: false, scope: "all" },
  { store: "tecnologia", id: "integracao-wearable", name: "Integração de wearable", desc: "Conecte seu dispositivo e alimente seus atributos com dados reais.", type: "acesso", rarity: "essencial", price_money_cents: 0, benefit: "Gratuito para assinantes", transferable: false, scope: "all" },
  { store: "experts", id: "consulta-expert", name: "Consulta com Médico Mentor", desc: "Sessão individual de 50 minutos.", type: "servico", rarity: "distinto", price_money_cents: 45000, price_life_points: 3000, seller: "Experts verificados", transferable: false, scope: "lifer" },
  { store: "experts", id: "destaque-perfil", name: "Destaque editorial de perfil", desc: "Exposição patrocinada e claramente sinalizada por 30 dias.", type: "beneficio", rarity: "raro", price_money_cents: 89000, benefit: "Exposição · não altera reputação", transferable: false, scope: "valley_expert" },
  { store: "experts", id: "espaco-profissional", name: "Espaço profissional ampliado", desc: "Agenda, vitrine de serviços e página de método.", type: "espaco", rarity: "excepcional", price_money_cents: 149000, transferable: false, scope: "valley_expert" },
];

/** Nunca pode ser comprado — apenas conquistado. */
export const nonPurchasable = [
  "Nível", "Reputação", "Certificação", "Resultado de saúde",
  "Habilidade dominada", "Avaliação positiva", "Posição em ranking",
];

export function productsFor(userClass: UserClass, store?: StoreId) {
  return storeProducts.filter(
    (p) => (p.scope === "all" || p.scope === userClass) && (!store || p.store === store),
  );
}

/* ── Itens equipáveis ─────────────────────────────────────── */

export type EquipSlot = {
  id: string;
  label: string;
  hint: string;
  options: string[];
};

export const liferSlots: EquipSlot[] = [
  { id: "objetivo", label: "Objetivo principal", hint: "O que orienta o seu mês.", options: ["Dormir melhor", "Recuperar energia", "Reconexão", "Organização financeira"] },
  { id: "jornada", label: "Jornada equipada", hint: "Campanha ativa agora.", options: ["Jornada do Sono", "Jornada da Vitalidade", "Jornada da Reconexão"] },
  { id: "habito", label: "Hábito em destaque", hint: "O hábito que você está sustentando.", options: ["Caminhada matinal", "Leitura 20min", "Sem tela após 22h"] },
  { id: "moldura", label: "Moldura", hint: "Sua identidade visual.", options: ["Padrão", "Aurora", "Obsidiana"] },
];

export const expertSlots: EquipSlot[] = [
  { id: "servico", label: "Serviço em destaque", hint: "O que aparece primeiro no seu perfil.", options: ["Consulta individual", "Mentoria mensal", "Programa de 12 semanas"] },
  { id: "conteudo", label: "Conteúdo principal", hint: "Sua vitrine de método.", options: ["Trilha publicada", "Série na Praça Central", "Aula aberta"] },
  { id: "evento", label: "Evento em destaque", hint: "Próximo encontro conduzido por você.", options: ["Aula aberta", "Summit", "Imersão"] },
  { id: "selo", label: "Selo", hint: "Credenciais verificadas.", options: ["Verificado", "Formador", "Referência"] },
];

export function slotsFor(userClass: UserClass) {
  return userClass === "valley_expert" ? expertSlots : liferSlots;
}

/* ── Missões estendidas ───────────────────────────────────── */

export type MissionKind =
  | "diaria" | "semanal" | "jornada" | "exploracao"
  | "conhecimento" | "social" | "expert" | "especial" | "epica";

export const missionKindLabel: Record<MissionKind, string> = {
  diaria: "Diária",
  semanal: "Semanal",
  jornada: "De jornada",
  exploracao: "Exploração",
  conhecimento: "Conhecimento",
  social: "Social",
  expert: "Com Médico Mentor",
  especial: "Especial",
  epica: "Épica",
};

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export const difficultyLabel: Record<Difficulty, string> = {
  1: "Nível I · baixa exigência",
  2: "Nível II · exigência leve",
  3: "Nível III · exigência moderada",
  4: "Nível IV · alta exigência",
  5: "Nível V · jornada avançada",
};

export type RichMission = {
  id: string;
  title: string;
  narrative: string;
  why: string;
  requirement: string;
  kind: MissionKind;
  difficulty: Difficulty;
  duration: string;
  xp: number;
  life_points: number;
  attribute: AttributeKey;
  journey?: string;
  next_step: string;
  scope: UserClass | "all";
};

export const richMissions: RichMission[] = [
  { id: "checkin", title: "Check-in do dia", narrative: "Antes de mudar qualquer coisa, é preciso enxergar.", why: "Consciência diária sustenta decisões melhores.", requirement: "2 minutos", kind: "diaria", difficulty: 1, duration: "2 min", xp: 15, life_points: 5, attribute: "fundacao", next_step: "Escolha sua prioridade da semana.", scope: "lifer" },
  { id: "movimento-30", title: "Mover o corpo por 30 minutos", narrative: "Energia não se espera, se produz.", why: "Vitalidade responde rápido ao movimento constante.", requirement: "Qualquer movimento contínuo", kind: "diaria", difficulty: 2, duration: "30 min", xp: 40, life_points: 15, attribute: "vitalidade", journey: "Jornada da Vitalidade", next_step: "Registre como o corpo respondeu.", scope: "lifer" },
  { id: "semana-sono", title: "Cinco noites com horário estável", narrative: "O sono é a fundação silenciosa de tudo.", why: "Consistência de horário melhora recuperação real.", requirement: "5 registros na semana", kind: "semanal", difficulty: 3, duration: "1 semana", xp: 140, life_points: 60, attribute: "fundacao", journey: "Jornada do Sono", next_step: "Compare com a semana anterior.", scope: "lifer" },
  { id: "explorar-praca", title: "Conhecer a Praça Central", narrative: "A cidade só existe por causa das pessoas.", why: "Pertencimento aumenta a chance de continuidade.", requirement: "Visitar e seguir um espaço", kind: "exploracao", difficulty: 1, duration: "5 min", xp: 30, life_points: 10, attribute: "conexao", next_step: "Apresente-se em um espaço.", scope: "lifer" },
  { id: "aula-universidade", title: "Concluir uma aula", narrative: "Conhecimento aplicado vira autonomia.", why: "Expansão é o que abre novos caminhos.", requirement: "Uma aula completa", kind: "conhecimento", difficulty: 2, duration: "25 min", xp: 50, life_points: 20, attribute: "expansao", next_step: "Escolha a próxima aula da trilha.", scope: "lifer" },
  { id: "sessao-expert", title: "Conversar com um Médico Mentor", narrative: "Há decisões que pedem julgamento humano.", why: "Orientação profissional evita meses perdidos.", requirement: "Uma sessão agendada", kind: "expert", difficulty: 3, duration: "50 min", xp: 120, life_points: 50, attribute: "realizacao", next_step: "Registre o combinado da sessão.", scope: "lifer" },
  { id: "epica-90", title: "Noventa dias de constância", narrative: "A transformação real acontece fora da tela.", why: "É o marco em que hábitos deixam de exigir esforço.", requirement: "90 dias ativos", kind: "epica", difficulty: 5, duration: "3 meses", xp: 1200, life_points: 500, attribute: "realizacao", next_step: "Abra seu relatório de evolução.", scope: "lifer" },
  { id: "publicar", title: "Publicar um aprendizado", narrative: "O que você sabe pode encurtar o caminho de alguém.", why: "Contribuição é o motor da sua reputação.", requirement: "Um conteúdo na Praça Central", kind: "social", difficulty: 2, duration: "20 min", xp: 60, life_points: 25, attribute: "contribuicao", next_step: "Responda aos comentários recebidos.", scope: "valley_expert" },
  { id: "responder-lifers", title: "Apoiar três médicos alunos", narrative: "Presença consistente constrói confiança.", why: "Reputação nasce de repetição, não de anúncio.", requirement: "3 respostas úteis", kind: "semanal", difficulty: 3, duration: "1 semana", xp: 150, life_points: 60, attribute: "reputacao", next_step: "Veja o impacto no seu painel.", scope: "valley_expert" },
  { id: "criar-jornada", title: "Criar uma jornada", narrative: "Seu método vira caminho para muitos.", why: "Escala o seu impacto sem escalar sua agenda.", requirement: "Estrutura com capítulos", kind: "epica", difficulty: 5, duration: "1 mês", xp: 900, life_points: 400, attribute: "impacto", next_step: "Convide médicos alunos para a primeira turma.", scope: "valley_expert" },
  { id: "atualizar-credenciais", title: "Atualizar credenciais", narrative: "Confiança começa por informação verificável.", why: "Credenciais verificadas sustentam sua reputação.", requirement: "Documentos válidos", kind: "diaria", difficulty: 1, duration: "10 min", xp: 40, life_points: 15, attribute: "conhecimento", next_step: "Revise seu perfil público.", scope: "valley_expert" },
  { id: "colaborar-expert", title: "Colaborar com outro Expert", narrative: "Inteligência coletiva vale mais que autoria isolada.", why: "Colaboração amplia alcance e profundidade.", requirement: "Um projeto conjunto", kind: "especial", difficulty: 4, duration: "2 semanas", xp: 300, life_points: 120, attribute: "experiencia", next_step: "Publique o resultado da colaboração.", scope: "valley_expert" },
];

export function richMissionsFor(userClass: UserClass, kind?: MissionKind) {
  return richMissions.filter(
    (m) => (m.scope === "all" || m.scope === userClass) && (!kind || m.kind === kind),
  );
}

/* ── Jornadas como campanhas ──────────────────────────────── */

export type JourneyChapterDef = {
  id: string;
  title: string;
  focus: string;
  reflection: string;
  reward: string;
};

export type JourneyCampaignDef = {
  id: string;
  name: string;
  objective: string;
  narrative: string;
  difficulty: Difficulty;
  attribute: AttributeKey;
  chapters: JourneyChapterDef[];
  paths: string[];
  scope: UserClass | "all";
};

export const journeys: JourneyCampaignDef[] = [
  {
    id: "sono", name: "Jornada do Sono", objective: "Recuperar a base do seu dia.", difficulty: 2, attribute: "fundacao", scope: "lifer",
    narrative: "Tudo o que você quer melhorar passa pela noite anterior.",
    paths: ["Horário estável", "Ambiente do quarto", "Rotina de desaceleração", "Avaliação profissional"],
    chapters: [
      { id: "c1", title: "Enxergar a noite", focus: "Registrar sono por 5 dias.", reflection: "O que muda quando você dorme bem?", reward: "80 XP · 30 LP" },
      { id: "c2", title: "Fechar o dia", focus: "Criar um ritual de desaceleração.", reflection: "O que rouba seu sono?", reward: "120 XP · moldura Noite Calma" },
      { id: "c3", title: "Sustentar", focus: "Três semanas de horário estável.", reflection: "Como está sua energia agora?", reward: "260 XP · marco de Fundação" },
    ],
  },
  {
    id: "vitalidade", name: "Jornada da Vitalidade", objective: "Devolver energia ao corpo.", difficulty: 3, attribute: "vitalidade", scope: "lifer",
    narrative: "Corpo em uso é corpo que responde.",
    paths: ["Movimento", "Alimentação", "Recuperação", "Avaliação profissional"],
    chapters: [
      { id: "c1", title: "Começar leve", focus: "Movimento diário por 7 dias.", reflection: "Onde está sua resistência?", reward: "100 XP" },
      { id: "c2", title: "Construir base", focus: "Força duas vezes por semana.", reflection: "O que ficou mais fácil?", reward: "180 XP · 60 LP" },
      { id: "c3", title: "Integrar", focus: "Rotina que sobrevive à semana difícil.", reflection: "O que você quer manter para sempre?", reward: "320 XP · marco de Vitalidade" },
    ],
  },
  {
    id: "reconexao", name: "Jornada da Reconexão", objective: "Recuperar presença nas relações.", difficulty: 2, attribute: "conexao", scope: "lifer",
    narrative: "Ninguém evolui sozinho por muito tempo.",
    paths: ["Círculo próximo", "Comunidade", "Conversas difíceis"],
    chapters: [
      { id: "c1", title: "Nomear pessoas", focus: "Listar quem importa hoje.", reflection: "Quem você tem adiado?", reward: "70 XP" },
      { id: "c2", title: "Presença real", focus: "Três encontros sem tela.", reflection: "O que voltou a ficar leve?", reward: "150 XP · 50 LP" },
    ],
  },
  {
    id: "autoridade", name: "Jornada de Expansão Profissional", objective: "Transformar método em presença pública.", difficulty: 4, attribute: "impacto", scope: "valley_expert",
    narrative: "Sua experiência só gera impacto quando encontra as pessoas certas.",
    paths: ["Conteúdo", "Comunidade", "Trilha própria", "Eventos"],
    chapters: [
      { id: "c1", title: "Declarar domínio", focus: "Perfil completo e credenciais verificadas.", reflection: "Como você quer ser encontrado?", reward: "120 XP" },
      { id: "c2", title: "Publicar com constância", focus: "Quatro conteúdos em quatro semanas.", reflection: "Que dúvida se repete?", reward: "240 XP · 100 LP" },
      { id: "c3", title: "Assinar uma jornada", focus: "Uma campanha completa publicada.", reflection: "Qual transformação você entrega?", reward: "500 XP · selo Formador" },
    ],
  },
];

export function journeysFor(userClass: UserClass) {
  return journeys.filter((j) => j.scope === "all" || j.scope === userClass);
}

/* ── Temporadas e eventos ─────────────────────────────────── */

export type SeasonReward = { at: number; label: string; kind: "xp" | "item" | "acesso" | "life_points" };

export type Season = {
  id: string;
  name: string;
  narrative: string;
  starts: string;
  ends: string;
  dimension: string;
  goal: number;
  rewards: SeasonReward[];
};

export const currentSeason: Season = {
  id: "temporada-vitalidade",
  name: "Temporada da Vitalidade",
  narrative: "Por um trimestre, a Doutiva inteira olha para energia, movimento e recuperação. Seu progresso permanente continua intacto ao final.",
  starts: "1 de julho",
  ends: "30 de setembro",
  dimension: "Vitalidade",
  goal: 2000,
  rewards: [
    { at: 200, label: "Card de temporada · Essencial", kind: "item" },
    { at: 600, label: "300 Pontos Doutiva", kind: "life_points" },
    { at: 1000, label: "Aula aberta com Médico Mentor", kind: "acesso" },
    { at: 1500, label: "Moldura Aurora de Vitalidade · Raro", kind: "item" },
    { at: 2000, label: "Coleção Icônica da temporada", kind: "item" },
  ],
};

export type ValleyEvent = {
  id: string;
  title: string;
  desc: string;
  window: string;
  effect: string;
};

export const dynamicEvents: ValleyEvent[] = [
  { id: "semana-conexao", title: "Semana da Conexão", desc: "A cidade inteira trabalha a dimensão Conexão.", window: "Esta semana", effect: "Missões sociais valem XP adicional e novos espaços ficam em destaque." },
  { id: "desafio-coletivo", title: "Desafio coletivo · 1 milhão de minutos", desc: "Movimento somado de todos os médicos alunos da Doutiva.", window: "8 dias restantes", effect: "Meta comunitária desbloqueia uma coleção para todos os participantes." },
  { id: "aula-aberta", title: "Aula aberta de recuperação", desc: "Conduzida por Médicos Mentores convidados.", window: "Quinta, 20h", effect: "Acesso liberado para quem concluiu a missão da semana." },
];

/* ── Espaço pessoal ───────────────────────────────────────── */

export type SpaceSection = {
  id: string;
  name: string;
  desc: string;
  unlockLevel: number;
  scope: UserClass | "all";
};

export const spaceSections: SpaceSection[] = [
  { id: "mapa", name: "Salão do Mapa", desc: "Seu Mapa de Evolução Humana em exposição.", unlockLevel: 1, scope: "lifer" },
  { id: "conquistas", name: "Parede de Conquistas", desc: "Marcos e coleções que você reuniu.", unlockLevel: 1, scope: "all" },
  { id: "biblioteca", name: "Biblioteca pessoal", desc: "O que você estuda e guarda para voltar.", unlockLevel: 3, scope: "all" },
  { id: "galeria", name: "Galeria de coleções", desc: "Itens de edição limitada e memórias digitais.", unlockLevel: 6, scope: "all" },
  { id: "experiencias", name: "Sala de experiências", desc: "Eventos vividos e próximos encontros.", unlockLevel: 10, scope: "all" },
  { id: "consultorio", name: "Espaço profissional", desc: "Serviços, agenda e método publicado.", unlockLevel: 4, scope: "valley_expert" },
  { id: "acervo", name: "Acervo de método", desc: "Conteúdos, jornadas e materiais assinados por você.", unlockLevel: 8, scope: "valley_expert" },
];

export function spaceSectionsFor(userClass: UserClass) {
  return spaceSections.filter((s) => s.scope === "all" || s.scope === userClass);
}

/** Ambientes com desbloqueio gradual — nunca bloqueia saúde ou segurança. */
export const unlockRules = [
  { area: "Universidade Doutiva", rule: "Disponível desde o início." },
  { area: "Praça Central", rule: "Após concluir seu perfil." },
  { area: "Árvore de habilidades", rule: "Após a leitura inicial." },
  { area: "Lojas Doutiva", rule: "Após a primeira missão concluída." },
  { area: "Jornadas avançadas", rule: "A partir do nível 8." },
  { area: "Espaço profissional", rule: "Após configuração do Médico Mentor." },
];

/* ── Preferências de gamificação ──────────────────────────── */

export type GamificationIntensity = "completa" | "equilibrada" | "discreta";

export const intensityLabel: Record<GamificationIntensity, { name: string; desc: string }> = {
  completa: { name: "Completa", desc: "Animações, comemorações e progressão sempre visíveis." },
  equilibrada: { name: "Equilibrada", desc: "Progresso visível, celebrações discretas." },
  discreta: { name: "Discreta", desc: "Foco em conteúdo e evolução, sem elementos de jogo." },
};
