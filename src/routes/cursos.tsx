import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { PUBLIC_COURSES } from "@/lib/public-catalog";
import { ArrowUpRight, BookOpen, Lock } from "lucide-react";

export const Route = createFileRoute("/cursos")({
  head: () => ({
    meta: [
      { title: "Cursos — Doutiva" },
      {
        name: "description",
        content:
          "Catálogo Doutiva: Peptídeos grátis e trilhas clínicas de Protocolos — incretinas, hormônios, obesidade, sarcopenia, soroterapia e IA.",
      },
      { property: "og:title", content: "Cursos — Doutiva" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: CursosPage,
});

function CursosPage() {
  const free = PUBLIC_COURSES.filter((c) => c.free);
  const paid = PUBLIC_COURSES.filter((c) => !c.free);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-6 pb-12 pt-28">
        <span className="text-[10px] uppercase tracking-[0.35em] text-gold">Catálogo</span>
        <h1 className="mt-4 max-w-3xl font-display text-5xl leading-tight tracking-tight md:text-6xl">
          Cursos clínicos com evidência.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Sessão guiada, monografia e caso. Peptídeos liberados sem cartão; as demais trilhas abrem
          com Protocolos.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild className="rounded-sm bg-gold text-primary-foreground hover:bg-gold-soft">
            <Link to="/auth" search={{ mode: "signup" } as never}>
              Começar grátis <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-sm">
            <Link to="/oferta">Ver planos</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <h2 className="font-display text-2xl tracking-tight">Acesso livre</h2>
        <p className="mt-2 text-sm text-muted-foreground">Sem cartão — entre e estude agora.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {free.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      </section>

      <section className="border-t border-border/50 bg-card/20">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="font-display text-2xl tracking-tight">Com Protocolos</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Trilhas publicadas no campus. Assinatura R$ 297/mês.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paid.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function CourseCard({
  course,
}: {
  course: (typeof PUBLIC_COURSES)[number];
}) {
  return (
    <article
      className={`flex flex-col rounded-sm border p-6 ${
        course.free
          ? "border-gold/40 bg-gradient-to-b from-gold/10 to-transparent"
          : "border-border/60 bg-card/40"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          {course.category}
        </span>
        {course.free ? (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-gold">
            <BookOpen className="h-3 w-3" /> Grátis
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <Lock className="h-3 w-3" /> Protocolos
          </span>
        )}
      </div>
      <h3 className="mt-4 font-display text-xl tracking-tight md:text-2xl">{course.title}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{course.subtitle}</p>
      <p className="mt-4 text-xs text-muted-foreground">{course.lessons} aulas</p>
      <Button
        asChild
        variant={course.free ? "default" : "outline"}
        className={`mt-6 rounded-sm ${
          course.free ? "bg-gold text-primary-foreground hover:bg-gold-soft" : ""
        }`}
      >
        <Link to="/auth" search={{ mode: "signup" } as never}>
          {course.free ? "Começar este curso" : "Ver no campus"}
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </article>
  );
}
