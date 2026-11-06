import {
  Activity, Brain, HeartPulse, Microscope, Moon, Rocket, ShoppingBag, Store,
  GraduationCap, Users, Dumbbell, Leaf, type LucideIcon,
} from "lucide-react";
import type { AttributeKey, UserClass } from "@/lib/valley";

/* ── Créditos ──────────────────────────────────────── */

export const DC = { symbol: "Créditos", name: "Créditos" } as const;

export type LfcSource = "missao" | "jornada" | "temporada" | "patrocinio" | "compra" | "resgate";

export type LfcEntry = {
  id: string;
  label: string;
  detail: string;
  amount: number;
  source: LfcSource;
  created_at: string;
};

export const lfcSourceLabel: Record<LfcSource, string> = {
  missao: "Missão concluída",
  jornada: "Jornada",
  temporada: "Temporada",
  patrocinio: "Patrocínio de Expert",
  compra: "Aquisição",
  resgate: "Resgate",
};

export const mockLfcLedger: LfcEntry[] = [
  { id: "l1", label: "Sequência de 7 dias", detail: "Constância na dimensão Fundação", amount: 120, source: "missao", created_at: "hoje" },
  { id: "l2", label: "Capítulo 2 · Jornada do Sono", detail: "Ritual de desaceleração concluído", amount: 200, source: "jornada", created_at: "ontem" },
  { id: "l3", label: "Patrocínio · Clínica Vitale", detail: "Desafio de movimento patrocinado", amount: 350, source: "patrocinio", created_at: "há 3 dias" },
  { id: "l4", label: "Resgate · Avaliação funcional", detail: "Serviço no Marketplace", amount: -400, source: "resgate", created_at: "há 5 dias" },
  { id: "l5", label: "Marco da Temporada da Vitalidade", detail: "600 XP alcançados", amount: 300, source: "temporada", created_at: "há 1 semana" },
];

/** Onde os Créditos podem ser usada — nunca compra atributo, nível ou reputação. */
export const lfcUses = [
  "Descontos em serviços de Médicos Mentores no Marketplace",
  "Experiências e imersões presenciais",
  "Itens de personalização do seu espaço",
  "Entrada em desafios patrocinados",
  "Acesso antecipado a trilhas da Universidade",
];

export const lfcNeverBuys = [
  "Atributos, Life Score ou nível",
  "Reputação de Médico Mentor",
  "Diagnóstico, prescrição ou conduta clínica",
];

/* ── Patamares de Vitalidade (World Tiers) ────────────────── */

export type VitalityTier = 1 | 2 | 3 | 4 | 5;

export type VitalityTierDef = {
  tier: VitalityTier;
  name: string;
  requirement: string;
  minLevel: number;
  desc: string;
  modifiers: string[];
  dropQuality: string;
};

export const vitalityTiers: VitalityTierDef[] = [
  {
    tier: 1, name: "Despertar", minLevel: 1, requirement: "Leitura inicial concluída",
    desc: "Missões curtas, feedback imediato e nenhuma penalidade por falhar.",
    modifiers: ["XP base", "Sem quebra de sequência"], dropQuality: "Essencial",
  },
  {
    tier: 2, name: "Consistência", minLevel: 5, requirement: "7 dias ativos",
    desc: "A rotina começa a ser exigida. A constância vale mais do que a intensidade.",
    modifiers: ["+15% XP", "+10% DC"], dropQuality: "Essencial · Distinto",
  },
  {
    tier: 3, name: "Evolução", minLevel: 12, requirement: "Uma jornada completa",
    desc: "Missões encadeadas, decisões com consequência e metas semanais reais.",
    modifiers: ["+35% XP", "+25% DC", "Drops raros liberados"], dropQuality: "Distinto · Raro",
  },
  {
    tier: 4, name: "Performance", minLevel: 22, requirement: "Build ativa por 30 dias",
    desc: "A Doutiva cobra manutenção: perder ritmo reduz o patamar na virada da temporada.",
    modifiers: ["+60% XP", "+45% DC", "Missões de elite"], dropQuality: "Raro · Excepcional",
  },
  {
    tier: 5, name: "Longevidade", minLevel: 35, requirement: "Três dimensões acima de 70",
    desc: "O patamar de quem sustenta a evolução no tempo — e ajuda outros a sustentarem.",
    modifiers: ["+100% XP", "+80% DC", "Drops icônicos sazonais"], dropQuality: "Excepcional · Icônico",
  },
];

export function tierFor(level: number): VitalityTierDef {
  return [...vitalityTiers].reverse().find((t) => level >= t.minLevel) ?? vitalityTiers[0];
}

/* ── Builds (Planos de Vitalidade) ────────────────────────── */

export type BuildDef = {
  id: string;
  name: string;
  tagline: string;
  desc: string;
  icon: LucideIcon;
  focus: AttributeKey[];
  bonuses: string[];
  routine: string[];
};

export const builds: BuildDef[] = [
  {
    id: "longevidade", name: "Build Longevidade", tagline: "Viver mais e melhor",
    desc: "Foco em sono, marcadores metabólicos e prevenção de longo prazo.",
    icon: Leaf, focus: ["fundacao", "vitalidade"],
    bonuses: ["+20% XP em missões de sono", "Drops de exames e check-ups"],
    routine: ["Sono estável 7 dias/semana", "Exames semestrais registrados", "Movimento leve diário"],
  },
  {
    id: "performance", name: "Build Performance", tagline: "Corpo em alta demanda",
    desc: "Força, condicionamento e recuperação para quem exige do próprio corpo.",
    icon: Dumbbell, focus: ["vitalidade", "realizacao"],
    bonuses: ["+25% XP em treinos", "Missões de elite liberadas no patamar 3"],
    routine: ["Força 3x/semana", "Cardio 2x/semana", "Recuperação ativa monitorada"],
  },
  {
    id: "mente", name: "Build Mente Clara", tagline: "Foco, calma e decisão",
    desc: "Regulação de estresse, atenção e saúde mental sustentável.",
    icon: Brain, focus: ["fundacao", "expansao"],
    bonuses: ["+20% XP em práticas mentais", "Trilhas de neurociência com desconto"],
    routine: ["Prática de respiração diária", "Estudo 30min/dia", "Uma reflexão escrita por dia"],
  },
  {
    id: "conexao", name: "Build Conexão", tagline: "Evoluir junto",
    desc: "Relações, pertencimento e presença — o fator mais subestimado de longevidade.",
    icon: Users, focus: ["conexao", "realizacao"],
    bonuses: ["+30% DC em desafios coletivos", "Convites para encontros presenciais"],
    routine: ["Dois encontros sem tela por semana", "Participação na Praça Central", "Um desafio coletivo ativo"],
  },
];

export function buildById(id: string) {
  return builds.find((b) => b.id === id) ?? builds[0];
}

/* ── Drops digitais ───────────────────────────────────────── */

export type DropRarity = "essencial" | "distinto" | "raro" | "excepcional" | "iconico";

export const dropRarityLabel: Record<DropRarity, { name: string; chance: string; tone: string }> = {
  essencial: { name: "Essencial", chance: "60%", tone: "text-muted-foreground" },
  distinto: { name: "Distinto", chance: "25%", tone: "text-foreground" },
  raro: { name: "Raro", chance: "10%", tone: "text-gold" },
  excepcional: { name: "Excepcional", chance: "4%", tone: "text-sage" },
  iconico: { name: "Icônico", chance: "1%", tone: "text-gold" },
};

export type DropDef = { id: string; name: string; desc: string; rarity: DropRarity; source: string };

export const dropTable: DropDef[] = [
  { id: "d1", name: "Registro de constância", desc: "Selo simples pelo dia cumprido.", rarity: "essencial", source: "Missão diária" },
  { id: "d2", name: "Moldura Alvorada", desc: "Personalização do seu espaço pessoal.", rarity: "distinto", source: "Sequência de 7 dias" },
  { id: "d3", name: "Consulta relâmpago", desc: "15 minutos com um Médico Mentor.", rarity: "raro", source: "Capítulo de jornada" },
  { id: "d4", name: "Protocolo assinado", desc: "Plano exclusivo de um Expert do Círculo.", rarity: "excepcional", source: "Patamar 4+" },
  { id: "d5", name: "Coleção Icônica da Temporada", desc: "Edição limitada, nunca reeditada.", rarity: "iconico", source: "Fim de temporada" },
];

/* ── Distritos fixos da cidade ────────────────────────────── */

export type DistrictDef = {
  id: string;
  name: string;
  desc: string;
  icon: LucideIcon;
  to: string;
  spaces: number;
  audience: "lifer" | "expert" | "ambos";
};

export const cityDistricts: DistrictDef[] = [
  { id: "saude", name: "Distrito da Saúde", desc: "Consultórios, clínicas e cuidado contínuo.", icon: HeartPulse, to: "/marketplace", spaces: 48, audience: "ambos" },
  { id: "diagnostico", name: "Distrito do Diagnóstico", desc: "Laboratórios, exames e medicina preventiva.", icon: Microscope, to: "/marketplace", spaces: 21, audience: "ambos" },
  { id: "performance", name: "Distrito da Performance", desc: "Treino, força, condicionamento e recuperação.", icon: Activity, to: "/marketplace", spaces: 33, audience: "lifer" },
  { id: "bem-estar", name: "Distrito do Bem-Estar", desc: "Sono, mente, nutrição e regulação do estresse.", icon: Moon, to: "/marketplace", spaces: 29, audience: "lifer" },
  { id: "inovacao", name: "Distrito da Inovação", desc: "Healthtechs, devices e tecnologia aplicada.", icon: Rocket, to: "/tools", spaces: 17, audience: "ambos" },
  { id: "comercial", name: "Distrito Comercial", desc: "Lojas, produtos e serviços dos Experts.", icon: ShoppingBag, to: "/store", spaces: 40, audience: "ambos" },
  { id: "praca", name: "Praça Central", desc: "Onde a cidade conversa e se encontra.", icon: Users, to: "/community", spaces: 9, audience: "ambos" },
  { id: "universidade", name: "Universidade", desc: "Trilhas, formações e certificações.", icon: GraduationCap, to: "/academy", spaces: 24, audience: "ambos" },
];

/* ── Espaço profissional do Médico Mentor ─────────────────── */

export type ExpertSpaceLevel = 1 | 2 | 3;

export type ExpertSpaceLevelDef = {
  level: ExpertSpaceLevel;
  name: string;
  desc: string;
  unlocks: string[];
  requirement: string;
};

export const expertSpaceLevels: ExpertSpaceLevelDef[] = [
  {
    level: 1, name: "Ponto", requirement: "Cadastro aprovado e credenciais verificadas",
    desc: "Sua presença mínima viável na cidade: perfil, serviços e agenda.",
    unlocks: ["Perfil público no distrito", "Até 3 serviços publicados", "Agenda de atendimentos"],
  },
  {
    level: 2, name: "Espaço", requirement: "20 atendimentos ou 30 dias de operação ativa",
    desc: "Um consultório digital completo, com conteúdo e base de clientes.",
    unlocks: ["Serviços ilimitados", "Publicação de conteúdo e trilhas curtas", "Vitrine no Distrito Comercial", "Painel de clientes"],
  },
  {
    level: 3, name: "Escola", requirement: "Reputação 80+ e uma jornada assinada",
    desc: "Você deixa de atender apenas e passa a formar — método, equipe e programa próprio.",
    unlocks: ["Trilha própria na Universidade", "Equipe multiprofissional", "Eventos e imersões", "Patrocínio de desafios com Créditos"],
  },
];

/* ── Modelo comercial (shopping) ──────────────────────────── */

export const commercialModel = {
  entryFeeCents: 20_000_000, // R$ 200.000
  minMonthlyCents: 500_000, // R$ 5.000
  revenueShare: 0.12, // 12%
  note: "Cobrança mensal = o maior valor entre a mensalidade mínima e o percentual sobre o faturamento gerado dentro da Doutiva.",
};

/** Regra de shopping: cobra-se o maior valor entre mínimo e percentual. */
export function valleyFeeCents(revenueCents: number) {
  const share = Math.round(revenueCents * commercialModel.revenueShare);
  return Math.max(commercialModel.minMonthlyCents, share);
}

export function brl(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

/* ── Marketplace de serviços ──────────────────────────────── */

export type ServiceOffer = {
  id: string;
  slug: string;
  name: string;
  expert: string;
  expertSlug: string;
  district: string;
  format: "online" | "presencial" | "híbrido";
  priceCents: number;
  lcDiscount: number;
  desc: string;
  rating: number;
};

export const serviceOffers: ServiceOffer[] = [
  { id: "s1", slug: "avaliacao-longevidade", name: "Avaliação de Longevidade", expert: "Dra. Helena Prado", expertSlug: "helena-prado", district: "saude", format: "híbrido", priceCents: 89000, lcDiscount: 400, desc: "Consulta ampliada com leitura de marcadores e plano de 90 dias.", rating: 4.9 },
  { id: "s2", slug: "painel-metabolico", name: "Painel Metabólico Completo", expert: "Lab Vitale", expertSlug: "lab-vitale", district: "diagnostico", format: "presencial", priceCents: 62000, lcDiscount: 250, desc: "Exames laboratoriais com laudo interpretado por especialista.", rating: 4.8 },
  { id: "s3", slug: "protocolo-forca", name: "Protocolo de Força 12 semanas", expert: "Rafael Nunes", expertSlug: "rafael-nunes", district: "performance", format: "online", priceCents: 149000, lcDiscount: 600, desc: "Periodização individual com acompanhamento semanal.", rating: 4.9 },
  { id: "s4", slug: "reeducacao-sono", name: "Reeducação do Sono", expert: "Dra. Camila Reis", expertSlug: "camila-reis", district: "bem-estar", format: "online", priceCents: 78000, lcDiscount: 350, desc: "Oito semanas de ajuste de ritmo circadiano e higiene do sono.", rating: 5.0 },
  { id: "s5", slug: "mentoria-clinica-digital", name: "Mentoria de Clínica Digital", expert: "Dr. Igor Salles", expertSlug: "igor-salles", district: "inovacao", format: "online", priceCents: 220000, lcDiscount: 800, desc: "Para Experts que querem estruturar operação e produto digital.", rating: 4.7 },
  { id: "s6", slug: "programa-nutricional", name: "Programa Nutricional Premium", expert: "Marina Duarte", expertSlug: "marina-duarte", district: "bem-estar", format: "híbrido", priceCents: 96000, lcDiscount: 420, desc: "Plano alimentar com revisões quinzenais e suporte contínuo.", rating: 4.8 },
];

/* ── Candidatura de Médico Mentor ─────────────────────────── */

export const expertApplicationSteps = [
  { id: "identidade", title: "Identidade profissional", desc: "Nome, área de atuação, registro profissional e especialidade." },
  { id: "credenciais", title: "Credenciais e verificação", desc: "Formação, tempo de atuação e comprovação documental." },
  { id: "espaco", title: "Tipo de espaço", desc: "Consultório, clínica, laboratório, healthtech, escola ou loja." },
  { id: "oferta", title: "Oferta inicial", desc: "Serviços, formatos de atendimento e faixa de preço." },
  { id: "contrato", title: "Contrato do shopping", desc: "Taxa de entrada, mensalidade mínima e participação sobre faturamento." },
];

export const expertSpaceTypes = [
  "Consultório", "Clínica", "Laboratório", "Healthtech", "Escola", "Loja", "Centro de performance",
];

/* ── Loop de engajamento ──────────────────────────────────── */

export const engagementLoop = [
  { step: "Ação", desc: "Você faz algo real na sua vida ou na sua operação." },
  { step: "Feedback", desc: "A Doutiva mostra o efeito imediato no atributo certo." },
  { step: "Recompensa", desc: "XP, Créditos e drops proporcionais ao patamar." },
  { step: "Evolução", desc: "Atributo sobe, patamar avança, novos ambientes abrem." },
];

export function audienceLabel(a: DistrictDef["audience"], userClass: UserClass) {
  if (a === "ambos") return "Aberto a todos";
  if (a === "lifer") return userClass === "lifer" ? "Feito para você" : "Onde seus clientes estão";
  return userClass === "valley_expert" ? "Sua área de atuação" : "Onde ficam os Experts";
}

export const storeIcon = Store;
