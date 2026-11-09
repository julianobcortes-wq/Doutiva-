import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { listCourses } from "@/lib/courses.functions";
import { courseCoverSrc } from "@/lib/course-cover";
import { ArrowUpRight, Briefcase, Clock, Lock } from "lucide-react";
import { useValleyProfile } from "@/lib/use-city-profile";

const coursesQuery = {
  queryKey: ["courses"],
  queryFn: () => listCourses(),
};

/** Visual accents for course covers — editorial, not generic AI purple. */
const ACCENTS: Record<string, { wash: string; glow: string; mark: string }> = {
  Negócios: {
    wash: "from-[#0c1210] via-[#15201c] to-[#0a0e0c]",
    glow: "bg-[radial-gradient(ellipse_at_25%_15%,rgba(201,169,98,0.28),transparent_55%),radial-gradient(ellipse_at_80%_90%,rgba(62,120,100,0.18),transparent_50%)]",
    mark: "text-[#c9a962]/35",
  },
  Metabolismo: {
    wash: "from-neutral-950 via-neutral-900 to-black",
    glow: "bg-[radial-gradient(ellipse_at_30%_20%,oklch(0.82_0.13_205/0.22),transparent_55%)]",
    mark: "text-gold/25",
  },
  Endocrinologia: {
    wash: "from-neutral-950 via-[#121816] to-black",
    glow: "bg-[radial-gradient(ellipse_at_70%_20%,rgba(120,160,130,0.2),transparent_55%)]",
    mark: "text-sage/30",
  },
  default: {
    wash: "from-neutral-900 via-black to-neutral-900",
    glow: "bg-[radial-gradient(ellipse_at_30%_20%,oklch(0.82_0.13_205/0.2),transparent_55%)]",
    mark: "text-gold/25",
  },
};

function accentFor(category?: string | null) {
  if (!category) return ACCENTS.default;
  return ACCENTS[category] ?? ACCENTS.default;
}

export const Route = createFileRoute("/_authenticated/academy/")({
  head: () => ({ meta: [{ title: "Universidade Doutiva — Doutiva" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(coursesQuery),
  component: AcademyPage,
});

function AcademyPage() {
  const { data } = useSuspenseQuery(coursesQuery);
  const { profile, hydrated } = useValleyProfile();
  const expert = hydrated && profile.user_class === "valley_expert";
  const courses = data ?? [];
  const business = courses.filter((c) => c.category === "Negócios");
  const flagshipSlugs = new Set([
    "manipulados-injetaveis-criterio",
    "hormonios-implantes-criterio",
    "soroterapia-injetaveis-estereis",
    "obesidade-precisao-consultorio",
    "tireoide-longevidade-criterio",
    "cardiometabolico-prescritor-criterio",
    "dexa-composicao-operacional",
    "etica-publicidade-prontuario",
    "sono-cortisol-criterio",
    "fertilidade-trt-incretinas",
    "longevidade-medicina-evidencia",
  ]);
  const flagships = [
    {
      course: courses.find((c) => c.slug === "longevidade-medicina-evidencia"),
      blurb:
        "16 aulas: hallmarks, CALERIE/TAME/SELECT, exercício/sono, metformina/rapamicina/NAD com hierarquia A–D — sem hype.",
      cta: "Abrir Longevidade",
    },
    {
      course: courses.find((c) => c.slug === "manipulados-injetaveis-criterio"),
      blurb:
        "16 aulas: formulário de manipulados (indicação + via + administração), qualidade da magistral, zona cinzenta e ANVISA/CFM.",
      cta: "Abrir Manipulados",
    },
    {
      course: courses.find((c) => c.slug === "hormonios-implantes-criterio"),
      blurb:
        "16 aulas: hipogonadismo e menopausa, TRT/THM injetável, técnica IM, implantes e calendário de labs.",
      cta: "Abrir Hormônios",
    },
    {
      course: courses.find((c) => c.slug === "soroterapia-injetaveis-estereis"),
      blurb:
        "16 aulas: formulações IV comuns, taxas seguras, vitaminas/ferro com critério, recusa de drip Instagram e setup de infusão.",
      cta: "Abrir Soroterapia",
    },
    {
      course: courses.find((c) => c.slug === "obesidade-precisao-consultorio"),
      blurb:
        "16 aulas: fenótipos, armamentário oral e incretinas, massa magra, manutenção e protocolo 90 dias de emagrecimento.",
      cta: "Abrir Emagrecimento",
    },
    {
      course: courses.find((c) => c.slug === "tireoide-longevidade-criterio"),
      blurb:
        "16 aulas: TSH/T3 com critério, liotironina, mitos de otimização e âncoras ATA/Endocrine Society.",
      cta: "Abrir Tireoide",
    },
    {
      course: courses.find((c) => c.slug === "cardiometabolico-prescritor-criterio"),
      blurb:
        "16 aulas: Hct na TRT, lipídios, SELECT/perioperatório GLP-1 e checklist cardiometabólico do prescritor.",
      cta: "Abrir Cardiometabólico",
    },
    {
      course: courses.find((c) => c.slug === "fertilidade-trt-incretinas"),
      blurb:
        "16 aulas: preservar e recuperar fertilidade sob TRT/incretinas — homem e mulher, com evidência.",
      cta: "Abrir Fertilidade",
    },
    {
      course: courses.find((c) => c.slug === "sono-cortisol-criterio"),
      blurb:
        "16 aulas: desmontar adrenal fatigue, triar sono/apneia e tratar o que é real com base científica.",
      cta: "Abrir Sono & Cortisol",
    },
  ].filter((f) => f.course);
  const featured = courses.filter(
    (c) => c.featured && c.category !== "Negócios" && !flagshipSlugs.has(c.slug),
  );
  const rest = courses.filter(
    (c) => !c.featured && c.category !== "Negócios" && !flagshipSlugs.has(c.slug),
  );
  const subscribed = courses.some((c) => c.subscribed);

  return (
    <div>
      <section className="border-b border-border/60">
        <div className="relative mx-auto max-w-7xl overflow-hidden px-6 py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-gold/10 blur-3xl"
          />
          <span className={`text-[10px] uppercase tracking-[0.3em] ${expert ? "text-sage" : "text-gold"}`}>
            {expert ? "Ensinar na Universidade" : "Universidade Doutiva"}
          </span>
          <h1 className="mt-3 font-display text-5xl tracking-tight md:text-6xl">
            {expert ? "Transforme seu método em trilha." : "Medicina de fronteira, com evidência."}
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            {expert
              ? "Veja as trilhas que já existem, entenda o padrão da Doutiva e proponha a sua própria formação."
              : subscribed
                ? "AI-first: após o Mapa clínico, a ordem das aulas prioriza as suas lacunas — clínica e negócios da prática."
                : "Peptídeos, Manipulados, Hormônios, Soroterapia, Emagrecimento e Negócios liberados. Demais trilhas clínicas abrem com Protocolos."}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              to="/como-funciona"
              className="inline-flex items-center gap-2 rounded-sm border border-gold/40 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-gold transition hover:bg-gold/10"
            >
              Como funciona · 4 passos
            </Link>
            {!subscribed && (
              <p className="inline-flex items-center gap-2 rounded-sm border border-gold/30 bg-gold/5 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-gold">
                Peptídeos · Incretinas · Hormônios · Negócios · livre
              </p>
            )}
          </div>
        </div>
      </section>

      {business.length > 0 && (
        <section className="border-b border-border/50 bg-gradient-to-b from-[#0e1412] to-background">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gold">
                  <Briefcase className="h-3.5 w-3.5" /> Negócios para médicos
                </div>
                <h2 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">
                  Precificar. Encher a agenda. Escalar com critério.
                </h2>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  Porta do EAD, liberada: hábito → produtos mais caros — sem folder de indústria.
                </p>
              </div>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {business.map((c) => (
                <CourseCard key={c.id} course={c} large />
              ))}
            </div>
          </div>
        </section>
      )}

      {flagships.length > 0 && (
        <section className="border-b border-border/50 bg-gradient-to-b from-[#0a1014] to-background">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Flagships clínicos · acesso livre</div>
            <h2 className="mt-3 max-w-3xl font-display text-3xl tracking-tight md:text-4xl">
              Conduta Purus: magistral, hormônio, infusão e emagrecimento com critério.
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
              {flagships.map((f) => (
                <div key={f.course!.slug} className="flex flex-col gap-5">
                  <div>
                    <p className="text-sm text-muted-foreground">{f.course!.subtitle}</p>
                    <p className="mt-2 text-sm text-muted-foreground/90">{f.blurb}</p>
                    <Link
                      to="/academy/$slug"
                      params={{ slug: f.course!.slug }}
                      className="mt-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-gold"
                    >
                      {f.cta} <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <CourseCard course={f.course!} large />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Em destaque · clínica</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {featured.map((c) => (
              <CourseCard key={c.id} course={c} large />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Catálogo completo</h2>
        <div className="mt-8 grid gap-px overflow-hidden rounded-sm border border-border/60 bg-border/60 md:grid-cols-2">
          {rest.map((c) => {
            const locked = c.access === "locked";
            return (
              <Link
                key={c.id}
                to="/academy/$slug"
                params={{ slug: c.slug }}
                className="group flex items-start justify-between gap-6 bg-background p-8 transition hover:bg-card"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-gold">{c.category}</span>
                    {c.free ? (
                      <span className="rounded-sm border border-gold/40 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-gold">
                        Livre
                      </span>
                    ) : locked ? (
                      <span className="inline-flex items-center gap-1 rounded-sm border border-border/70 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                        <Lock className="h-2.5 w-2.5" /> Protocolos
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-2 font-display text-2xl tracking-tight">{c.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{c.subtitle}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <span>{c.level}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {Math.round(c.duration_minutes / 60)}h
                    </span>
                  </div>
                </div>
                {locked ? (
                  <Lock className="h-5 w-5 shrink-0 text-muted-foreground/60" />
                ) : (
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:text-gold" />
                )}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function CourseCard({
  course,
  large,
}: {
  course: Awaited<ReturnType<typeof listCourses>>[number];
  large?: boolean;
}) {
  const locked = course.access === "locked";
  const accent = accentFor(course.category);
  const isBiz = course.category === "Negócios";
  const cover = courseCoverSrc(course.cover_url, course.slug);
  return (
    <Link
      to="/academy/$slug"
      params={{ slug: course.slug }}
      className={`group relative flex flex-col overflow-hidden rounded-sm border bg-card transition ${
        isBiz
          ? "border-[#c9a962]/25 hover:border-[#c9a962]/55"
          : "border-border/60 hover:border-gold/50"
      }`}
    >
      <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${accent.wash}`}>
        {cover ? (
          <>
            <img
              src={cover}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
              loading="lazy"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/25"
            />
          </>
        ) : (
          <>
            <div aria-hidden className={`absolute inset-0 ${accent.glow}`} />
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
              }}
            />
            <div className="absolute inset-0 flex items-end justify-between p-6">
              <span className={`font-display text-6xl leading-none ${accent.mark}`}>
                {course.title.charAt(0)}
              </span>
              {isBiz && (
                <Briefcase className="mb-1 h-5 w-5 text-[#c9a962]/50 transition group-hover:text-[#c9a962]" />
              )}
            </div>
          </>
        )}
        <div className="absolute right-4 top-4 z-10 flex flex-col items-end gap-2">
          <span className="rounded-sm border border-gold/30 bg-background/60 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-gold backdrop-blur">
            {course.category}
          </span>
          {course.free ? (
            <span className="rounded-sm border border-gold/40 bg-gold/15 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-gold">
              Livre
            </span>
          ) : locked ? (
            <span className="inline-flex items-center gap-1 rounded-sm border border-border/70 bg-background/70 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
              <Lock className="h-2.5 w-2.5" /> Protocolos
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className={`font-display tracking-tight ${large ? "text-2xl" : "text-xl"}`}>{course.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{course.subtitle}</p>
        <div className="mt-auto flex items-center justify-between pt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span>{course.instructor_name}</span>
          <span className="flex items-center gap-1 text-gold opacity-0 transition group-hover:opacity-100">
            {locked ? "Ver trilha" : "Acessar"} <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
