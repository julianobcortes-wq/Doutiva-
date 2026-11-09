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
    title: "Hormônios Injetáveis e Implantes com Critério",
    subtitle: "Indicação real vs anti-aging · ética e monitorização",
    category: "Endocrinologia",
    lessons: 16,
    free: false,
  },
  {
    slug: "soroterapia-injetaveis-estereis",
    title: "Soroterapia com Critério",
    subtitle: "Segurança, evidência e qualidade da manipulação",
    category: "Terapêutica",
    lessons: 16,
    free: false,
  },
  {
    slug: "obesidade-precisao-consultorio",
    title: "Emagrecimento e Obesidade de Precisão",
    subtitle: "Fenótipos, multimodalidade e realidade brasileira",
    category: "Metabolismo",
    lessons: 16,
    free: false,
  },
  {
    slug: "manipulados-injetaveis-criterio",
    title: "Medicamentos Manipulados Injetáveis com Critério",
    subtitle: "Do laudo da farmácia à receita defensável",
    category: "Terapêutica",
    lessons: 16,
    free: false,
  },
  {
    slug: "tireoide-longevidade-criterio",
    title: "Tireoide no Consultório de Longevidade",
    subtitle: "TSH, T3 e o que o Instagram errou",
    category: "Endocrinologia",
    lessons: 16,
    free: false,
  },
  {
    slug: "cardiometabolico-prescritor-criterio",
    title: "Cardiometabólico do Prescritor",
    subtitle: "Hct, lipídios, FA e perioperatório GLP-1",
    category: "Cardiometabolismo",
    lessons: 16,
    free: false,
  },
  {
    slug: "dexa-composicao-operacional",
    title: "DEXA e Composição Corporal Operacional",
    subtitle: "Do laudo ao plano sem teatro",
    category: "Composição corporal",
    lessons: 16,
    free: false,
  },
  {
    slug: "etica-publicidade-prontuario",
    title: "Ética, Publicidade e Prontuário Defensável",
    subtitle: "CFM, redes, TCLE e o que derruba CRM",
    category: "Ética e prática",
    lessons: 16,
    free: false,
  },
  {
    slug: "sono-cortisol-criterio",
    title: "Sono, Cortisol e o Mito da Fadiga Adrenal",
    subtitle: "Desmontar mito — tratar o que é real",
    category: "Endocrinologia",
    lessons: 16,
    free: false,
  },
  {
    slug: "fertilidade-trt-incretinas",
    title: "Fertilidade sob TRT e Incretinas",
    subtitle: "Preservar, recuperar e não sabotar",
    category: "Reprodução",
    lessons: 16,
    free: false,
  },
  {
    slug: "longevidade-medicina-evidencia",
    title: "Longevidade na Medicina com Evidência",
    subtitle: "Hallmarks, geroscience e o que trials humanos sustentam",
    category: "Longevidade",
    lessons: 16,
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
