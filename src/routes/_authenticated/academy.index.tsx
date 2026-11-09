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

/** Recommended entry points — not exclusive; full catalog follows. */
const START_HERE_SLUGS = [
  "peptideos-medicina-de-precisao",
  "tirzepatida-incretinas-consultorio",
  "hormonios-implantes-criterio",
  "precificacao-margem-consultorio",
] as const;

/** Category browse order (Udemy-style shelves). Missing cats append alphabetically. */
const CATEGORY_ORDER = [
  "Biotecnologia",
  "Metabolismo",
  "Endocrinologia",
  "Terapêutica",
  "Longevidade",
  "Cardiometabolismo",
  "Composição corporal",
  "Reprodução",
  "Ética e prática",
  "Prática digital",
  "Negócios",
];

function accentFor(category?: string | null) {
  if (!category) return ACCENTS.default;
  return ACCENTS[category] ?? ACCENTS.default;
}

function categoryAnchor(cat: string) {
  return `cat-${cat.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}`;
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
  const subscribed = courses.some((c) => c.subscribed);

  const bySlug = new Map(courses.map((c) => [c.slug, c]));
  const startHere = START_HERE_SLUGS.map((s) => bySlug.get(s)).filter(Boolean) as typeof courses;

  const categoriesPresent = [...new Set(courses.map((c) => c.category || "Outros"))];
  const orderedCats = [
    ...CATEGORY_ORDER.filter((c) => categoriesPresent.includes(c)),
    ...categoriesPresent.filter((c) => !CATEGORY_ORDER.includes(c)).sort(),
  ];

  const shelves = orderedCats.map((cat) => ({
    cat,
    courses: courses
      .filter((c) => (c.category || "Outros") === cat)
      .sort((a, b) => a.title.localeCompare(b.title, "pt-BR")),
  }));

  return (
    <div>
      <section className="border-b border-border/60">
        <div className="relative mx-auto max-w-7xl overflow-hidden px-6 py-12 md:py-16">
          <span
            className={`text-[10px] uppercase tracking-[0.3em] ${expert ? "text-sage" : "text-gold"}`}
          >
            {expert ? "Ensinar na Universidade" : "Universidade Doutiva"}
          </span>
          <h1 className="mt-3 font-display text-4xl tracking-tight md:text-5xl">
            {expert ? "Transforme seu método em trilha." : "Estude com evidência."}
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            {expert
              ? "Todas as trilhas publicadas — organize, revise e proponha a sua."
              : `${courses.length} trilhas publicadas. Comece por uma recomendada ou navegue o catálogo por área.`}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              to="/como-funciona"
              className="inline-flex items-center gap-2 rounded-sm border border-gold/40 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-gold transition hover:bg-gold/10"
            >
              Como funciona · 4 passos
            </Link>
            {!subscribed && (
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Livre e Protocolos marcados em cada curso
              </p>
            )}
          </div>

          {orderedCats.length > 1 && (
            <nav
              aria-label="Áreas do catálogo"
              className="mt-8 flex flex-wrap gap-2 border-t border-border/50 pt-6"
            >
              <a
                href="#comece-por-aqui"
                className="rounded-sm border border-border/60 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition hover:border-gold/40 hover:text-gold"
              >
                Comece por aqui
              </a>
              {orderedCats.map((cat) => (
                <a
                  key={cat}
                  href={`#${categoryAnchor(cat)}`}
                  className="rounded-sm border border-border/60 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition hover:border-gold/40 hover:text-gold"
                >
                  {cat}
                </a>
              ))}
            </nav>
          )}
        </div>
      </section>

      {startHere.length > 0 && (
        <section id="comece-por-aqui" className="border-b border-border/50 scroll-mt-20">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <h2 className="text-[10px] uppercase tracking-[0.3em] text-gold">Comece por aqui</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Quatro entradas claras. O restante do catálogo está logo abaixo — nada fica escondido.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {startHere.map((c) => (
                <CourseCard key={c.id} course={c} large />
              ))}
            </div>
          </div>
        </section>
      )}

      {shelves.map(({ cat, courses: shelf }) => (
        <section
          key={cat}
          id={categoryAnchor(cat)}
          className="scroll-mt-20 border-b border-border/40 last:border-b-0"
        >
          <div className="mx-auto max-w-7xl px-6 py-12">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl tracking-tight md:text-3xl">{cat}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {shelf.length} {shelf.length === 1 ? "trilha" : "trilhas"}
                </p>
              </div>
              {cat === "Negócios" && (
                <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-gold">
                  <Briefcase className="h-3 w-3" /> Prática do consultório
                </span>
              )}
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {shelf.map((c) => (
                <CourseCard key={c.id} course={c} large />
              ))}
            </div>
          </div>
        </section>
      ))}

      {courses.length === 0 && (
        <p className="mx-auto max-w-7xl px-6 py-16 text-sm text-muted-foreground">
          Nenhum curso publicado no momento.
        </p>
      )}
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
        <h3 className={`font-display tracking-tight ${large ? "text-2xl" : "text-xl"}`}>
          {course.title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">{course.subtitle}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {Math.max(1, Math.round(course.duration_minutes / 60))}h
          </span>
          <span className="flex items-center gap-1 text-gold opacity-0 transition group-hover:opacity-100">
            {locked ? "Ver trilha" : "Acessar"} <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
