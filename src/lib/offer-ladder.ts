/** Escada comercial Doutiva — preços da modelagem 2026–2031. */

export type OfferStatus = "live" | "soon";

export type OfferTier = {
  id: string;
  name: string;
  price: string;
  priceNote?: string;
  blurb: string;
  status: OfferStatus;
  statusLabel: string;
  href?: string;
  cta: string;
  features: string[];
};

export const OFFER_TIERS: OfferTier[] = [
  {
    id: "online",
    name: "Protocolos (Online)",
    price: "R$ 297",
    priceNote: "/mês",
    blurb:
      "A plataforma: aulas de protocolo e gestão, sessão guiada, revisão espaçada, painel e fichas. Onde começamos — e a base de tudo que vem depois.",
    status: "live",
    statusLabel: "Disponível agora",
    href: "/auth",
    cta: "Começar Protocolos",
    features: [
      "Sessão do dia (lâminas → chaves → caso)",
      "Trilhas com monografia e evidência",
      "Revisão espaçada e Professores de IA",
      "Comunidade de médicos",
    ],
  },
  {
    id: "imersao",
    name: "Imersão 3 dias",
    price: "R$ 25.000",
    priceNote: "fundador R$ 20.000",
    blurb:
      "Protocolos que pagam a clínica, presencial na Semana Doutiva. Porta de entrada do instituto — turmas a partir da Semana de março.",
    status: "soon",
    statusLabel: "Em breve",
    href: "/eventos",
    cta: "Ver A Origem / lista",
    features: [
      "3 dias presenciais + mesas com mentores",
      "Conta da clínica na mão",
      "Candidatura com depósito (fluxo em breve)",
      "Incluso: acesso Protocolos",
    ],
  },
  {
    id: "mentoria",
    name: "Mentoria 12 meses",
    price: "R$ 4.900",
    priceNote: "/mês",
    blurb:
      "Um dia por mês, turma e mentores médicos. Marketplace: o aluno fica perto de quem já opera o método. Oferta após a imersão.",
    status: "soon",
    statusLabel: "Em breve",
    href: "/mentores",
    cta: "Ver mentores",
    features: [
      "Turma de até 40 · mesas de 8",
      "Painel mensal e sessão individual no trimestre",
      "Encontros na Semana Doutiva",
      "Protocolos Online incluído",
    ],
  },
  {
    id: "clube",
    name: "Clube Doutiva",
    price: "R$ 150.000",
    priceNote: "/ano · 100 cadeiras",
    blurb:
      "Cadeiras limitadas no Brasil. Mesa de conselho, Clínica Aberta e viagem anual. Entrada por convite ou comitê.",
    status: "soon",
    statusLabel: "Em breve",
    features: [
      "100 cadeiras pagantes no país",
      "Mesa mensal com sócio conselheiro",
      "Viagem anual incluída",
      "Sem joia · sócios não pagam anuidade",
    ],
    cta: "Lista de interesse",
  },
  {
    id: "encontro",
    name: "Encontro Doutiva",
    price: "R$ 2.500",
    priceNote: "por ingresso pagante",
    blurb:
      "Dia 4 da Semana Doutiva. Incluído para mentoria, clube e sócios; ex-alunos e público convidado pagam.",
    status: "soon",
    statusLabel: "Em breve",
    href: "/eventos",
    cta: "Ver eventos",
    features: [
      "Quatro encontros por ano",
      "Sem patrocínio de indústria",
      "Palco de formados e sócios",
      "Calendário na Semana Doutiva",
    ],
  },
];

export const INDEPENDENCE_LINE =
  "100% independente: nenhuma receita, contrato ou sócio de farmácia, laboratório ou indústria. Toda a receita vem do que o médico paga pela formação.";
