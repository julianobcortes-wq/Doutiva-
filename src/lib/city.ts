import {
  GraduationCap, Users, Wrench, CalendarDays, MessageSquare, Rocket,
  Sparkles, Award, Trophy, Share2, Crown, Shield, Inbox, Bookmark,
  CreditCard, LifeBuoy, Settings, LayoutDashboard,
  type LucideIcon,
} from "lucide-react";

import type { Attributes, UserClass } from "@/lib/valley";
import { classInfo, defaultExpertAttributes, defaultLifeAttributes, stageFor } from "@/lib/valley";

export type { UserClass } from "@/lib/valley";
export type SubscriptionTier = "free" | "plus" | "pro" | "enterprise";

export type CityProfile = {
  /** Classe permanente do habitante: nunca muda com nível ou plano. */
  user_class: UserClass;
  subscription_tier: SubscriptionTier;
  display_name: string;
  city: string;
  bio: string;
  interests: string[];
  onboarding_completed: boolean;
  // evolução
  level: number;
  xp: number;
  xp_to_next: number;
  life_points: number;
  streak: number;
  life_score: number;
  attributes: Attributes;
  unlocked_skills: string[];
  achievements: string[];
  completed_missions: string[];
  // percepção inicial (onboarding)
  moment: string;
  intention: string;
  // lifer
  goals: string[];
  habits: string[];
  health_interests: string[];
  activity_level: string;
  // valley expert
  profession: string;
  specialty: string;
  professional_type: string;
  services: string[];
  business_name: string;
  space_type: string;
  reputation_score: number;
  profile_views: number;
};

export const defaultProfile: CityProfile = {
  user_class: "lifer",
  subscription_tier: "free",
  display_name: "",
  city: "",
  bio: "",
  interests: [],
  onboarding_completed: false,
  level: 6,
  xp: 1240,
  xp_to_next: 1800,
  life_points: 480,
  streak: 9,
  life_score: 68,
  attributes: defaultLifeAttributes,
  unlocked_skills: ["ritmo", "movimento", "dominio"],
  achievements: ["chegada", "sete-dias", "primeira-habilidade"],
  completed_missions: [],
  moment: "",
  intention: "",
  goals: [],
  habits: [],
  health_interests: [],
  activity_level: "",
  profession: "",
  specialty: "",
  professional_type: "",
  services: [],
  business_name: "",
  space_type: "",
  reputation_score: 64,
  profile_views: 1284,
};

/** O nome da classe é fixo — plano e nível não o alteram. */
export function classLabel(p: Pick<CityProfile, "user_class">) {
  return classInfo[p.user_class].name;
}

export function stageName(p: Pick<CityProfile, "user_class" | "level">) {
  return stageFor(p.user_class, p.level).name;
}

export function defaultAttributesFor(userClass: UserClass): Attributes {
  return userClass === "valley_expert" ? defaultExpertAttributes : defaultLifeAttributes;
}

export type District = {
  to: string;
  name: string;
  short: string;
  desc: string;
  highlight: string;
  status: string;
  icon: LucideIcon;
};

export const districts: District[] = [
  { to: "/academy", name: "Universidade Doutiva", short: "Universidade", desc: "Aprenda com especialistas e avance em sua jornada.", highlight: "24 trilhas abertas", status: "Aberto", icon: GraduationCap },
  { to: "/community", name: "Praça Central", short: "Praça Central", desc: "Compartilhe experiências e participe das comunidades.", highlight: "9 comunidades ativas", status: "Aberto", icon: MessageSquare },
  { to: "/mentors", name: "Centro de Especialistas", short: "Especialistas", desc: "Encontre profissionais para apoiar sua evolução.", highlight: "38 especialistas", status: "Aberto", icon: Users },
  { to: "/tools", name: "Distrito de Tecnologia", short: "Tecnologia", desc: "Descubra ferramentas, aplicativos e soluções.", highlight: "120+ soluções", status: "Aberto", icon: Wrench },
  { to: "/events", name: "Centro de Eventos", short: "Eventos", desc: "Participe de encontros, desafios e experiências.", highlight: "12 próximos", status: "Aberto", icon: CalendarDays },
  { to: "/ventures", name: "Distrito de Negócios", short: "Negócios", desc: "Conheça empresas e projetos que estão transformando a saúde.", highlight: "6 oportunidades", status: "Em expansão", icon: Rocket },
];

export const districtLabels: Record<string, string> = {
  "/dashboard": "Início",
  "/map": "Mapa de Evolução Humana",
  "/skills": "Árvore de Habilidades",
  "/missions": "Ações do dia",
  "/achievements": "Marcos da jornada",
  "/academy": "Universidade Doutiva",
  "/trilha": "Minha Trilha",
  "/mapa": "Mapa clínico",
  "/como-funciona": "Como funciona",
  "/mentors": "Médicos Mentores",
  "/tools": "Distrito de Tecnologia",
  "/events": "Centro de Eventos",
  "/community": "Praça Central",
  "/ventures": "Distrito de Negócios",
  "/concierge": "Guia Doutiva",
  "/certifications": "Central de Certificações",
  "/ranking": "Hall de Evolução",
  "/affiliates": "Programa de Embaixadores",
  "/premier": "Círculo Doutiva",
  "/library": "Biblioteca da Doutiva",
  "/inbox": "Mensagens",
  "/notifications": "Atualizações",
  "/billing": "Planos e Assinaturas",
  "/settings": "Perfil e Preferências",
  "/admin": "Administração",
  "/help": "Suporte",
};

export const navIcons = {
  LayoutDashboard, GraduationCap, Users, Wrench, CalendarDays, MessageSquare,
  Rocket, Sparkles, Award, Trophy, Share2, Crown, Shield, Inbox, Bookmark,
  CreditCard, LifeBuoy, Settings,
};

export type Mission = { id: string; title: string; xp: number; area: string };

export const dailyMissions: Mission[] = [
  { id: "refeicao", title: "Registrar uma refeição", xp: 20, area: "Nutrição" },
  { id: "caminhada", title: "Caminhar 30 minutos", xp: 40, area: "Movimento" },
  { id: "aula", title: "Completar uma aula", xp: 50, area: "Universidade" },
  { id: "sono", title: "Registrar o sono", xp: 20, area: "Sono" },
  { id: "agua", title: "Beber 2L de água", xp: 10, area: "Saúde" },
  { id: "habito", title: "Atualizar um hábito", xp: 15, area: "Mente" },
];

export const lifeScorePillars = [
  { key: "saude", label: "Saúde", value: 74 },
  { key: "sono", label: "Sono", value: 68 },
  { key: "movimento", label: "Movimento", value: 81 },
  { key: "nutricao", label: "Nutrição", value: 63 },
  { key: "mente", label: "Mente", value: 70 },
  { key: "longevidade", label: "Longevidade", value: 76 },
];

export const achievements = [
  { id: "primeiro-passo", name: "Primeiro passo", desc: "Você entrou na cidade." },
  { id: "sete-dias", name: "Sete dias de sequência", desc: "Uma semana de constância." },
  { id: "primeira-missao", name: "Primeira missão", desc: "Sua primeira conquista diária." },
  { id: "primeiro-curso", name: "Primeiro curso", desc: "Concluiu uma trilha da Universidade." },
  { id: "habitante-ativo", name: "Habitante ativo", desc: "30 dias de presença na cidade." },
  { id: "explorador", name: "Explorador da cidade", desc: "Visitou todos os distritos." },
  { id: "aprendiz-longevidade", name: "Aprendiz de longevidade", desc: "Completou a trilha de longevidade." },
  { id: "conector", name: "Conector da comunidade", desc: "10 interações na Praça Central." },
];

export type CitySpace = {
  name: string;
  desc: string;
  status: "Disponível" | "Em breve" | "Ocupado" | "Destaque" | "Exclusivo Pro";
};

export const citySpaces: CitySpace[] = [
  { name: "Consultório", desc: "Espaço individual para atendimento e presença profissional.", status: "Disponível" },
  { name: "Clínica", desc: "Estrutura multiprofissional com equipe e serviços.", status: "Exclusivo Pro" },
  { name: "Laboratório", desc: "Exames, análises e parcerias diagnósticas.", status: "Em breve" },
  { name: "Farmácia", desc: "Produtos, manipulação e cuidado contínuo.", status: "Em breve" },
  { name: "Loja", desc: "Vitrine de produtos e soluções para habitantes.", status: "Disponível" },
  { name: "Centro de Pesquisa", desc: "Estudos, publicações e inovação científica.", status: "Em breve" },
  { name: "Escola", desc: "Formações e programas dentro da Universidade.", status: "Ocupado" },
  { name: "Healthtech", desc: "Produtos digitais e tecnologia aplicada à saúde.", status: "Destaque" },
  { name: "Empresa", desc: "Presença institucional e time no ecossistema.", status: "Disponível" },
  { name: "Auditório", desc: "Aulas abertas, summits e transmissões.", status: "Exclusivo Pro" },
  { name: "Espaço de Eventos", desc: "Experiências presenciais e imersões.", status: "Em breve" },
];

export const HEALTH_DISCLAIMER =
  "Conteúdos e indicadores são educacionais e demonstrativos. Não substituem avaliação, diagnóstico ou orientação de um profissional de saúde.";
