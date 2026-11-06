import { isFreeCourseSlug } from "@/lib/freemium";

/** Catálogo público espelhando os cursos publicados hoje na Doutiva. */
export type PublicCourse = {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  lessons: number;
  free: boolean;
};

export const PUBLIC_COURSES: PublicCourse[] = [
  {
    slug: "peptideos-medicina-de-precisao",
    title: "Peptídeos na Medicina de Precisão",
    subtitle: "Da farmacologia molecular à prescrição segura no consultório.",
    category: "Biotecnologia",
    lessons: 15,
    free: true,
  },
  {
    slug: "tirzepatida-incretinas-consultorio",
    title: "Tirzepatida e Incretinas no Consultório",
    subtitle: "Da indicação ao frasco · playbook operacional",
    category: "Metabolismo",
    lessons: 10,
    free: false,
  },
  {
    slug: "hormonios-implantes-criterio",
    title: "Hormônios e Implantes com Critério",
    subtitle: "Indicação real vs anti-aging · ética e monitorização",
    category: "Endocrinologia",
    lessons: 10,
    free: false,
  },
  {
    slug: "soroterapia-injetaveis-estereis",
    title: "Soroterapia e Injetáveis Estéreis com Critério",
    subtitle: "Segurança, evidência e qualidade da manipulação",
    category: "Terapêutica",
    lessons: 10,
    free: false,
  },
  {
    slug: "obesidade-precisao-consultorio",
    title: "Obesidade de Precisão no Consultório",
    subtitle: "Fenótipos, multimodalidade e realidade brasileira",
    category: "Metabolismo",
    lessons: 10,
    free: false,
  },
  {
    slug: "sarcopenia-composicao-performance",
    title: "Sarcopenia, Composição Corporal e Performance",
    subtitle: "Magra, força e longevidade clínica",
    category: "Composição corporal",
    lessons: 10,
    free: false,
  },
  {
    slug: "ia-pratica-medica",
    title: "IA na Prática Médica",
    subtitle: "Evidência, ética, LGPD e fluxo clínico",
    category: "Prática digital",
    lessons: 10,
    free: false,
  },
].map((c) => ({ ...c, free: isFreeCourseSlug(c.slug) }));
