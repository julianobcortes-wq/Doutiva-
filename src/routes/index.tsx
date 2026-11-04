import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import heroDoctor from "@/assets/hero-doctor.jpg";
import grainGold from "@/assets/grain-gold.jpg";
import { classInfo, environments, lifeAttributes, VALLEY_DISCLAIMER } from "@/lib/valley";
import { ArrowUpRight, Compass, Sparkles, Map as MapIcon, GitBranch, Target } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Doutiva — A escola do médico do futuro" },
      { name: "description", content: "Formação para médicos em biotecnologia, ciência de ponta e carreira, com mentoria de médicos que já lideram a nova medicina." },
      { property: "og:title", content: "Doutiva — A escola do médico do futuro" },
      { property: "og:description", content: "Biotecnologia, ciência e performance para médicos que querem liderar a próxima medicina." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const stats = [
  { value: "5", label: "Eixos de formação" },
  { value: "100%", label: "Feito para médicos" },
  { value: "38", label: "Médicos Mentores" },
  { value: "24/7", label: "Estudo no seu ritmo" },
];

const gamification = [
  { icon: MapIcon, title: "Mapa de formação", desc: "Veja onde você está em ciência, biotecnologia, rede, carreira e negócio." },
  { icon: GitBranch, title: "Árvore de habilidades", desc: "Cada eixo tem um ramo. Você desbloqueia módulos conforme domina o anterior." },
  { icon: Target, title: "Estudo do dia", desc: "Leituras, casos e aulas curtas que geram XP e constância real." },
];

const liferPlaces = [
  "Universidade — trilhas de biotecnologia, ciência e carreira",
  "Praça Central — médicos discutindo casos e mercado",
  "Mentoria — médicos que já trilharam o caminho",
];

const expertPlaces = [
  "Universidade — transforme seu método em curso",
  "Perfil de mentor — alunos encontram você",
  "Eventos e Negócios — autoridade e alcance",
];

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section id="topo" className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroDoctor} alt="Médico da Doutiva" className="h-full w-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 pb-32 pt-28 md:pb-48 md:pt-40">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-background/60 px-4 py-1.5 text-[10px] uppercase tracking-[0.25em] text-gold backdrop-blur">
            <span className="h-1 w-1 rounded-full bg-gold" /> Biotecnologia · Ciência · Performance
          </span>
          <h1 className="mt-8 max-w-4xl font-serif text-5xl leading-[1.05] md:text-7xl">
            A escola do <span className="text-gold">médico do futuro</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            A medicina está mudando mais rápido do que a faculdade ensina. Na Doutiva, médicos estudam
            biotecnologia, ciência de ponta e estratégia de carreira com quem já pratica a nova medicina.
            Entre como <span className="text-gold">aluno</span> ou compartilhe seu método como <span className="text-sage">mentor</span>.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="h-12 rounded-sm bg-gold px-8 text-primary-foreground hover:bg-gold-soft">
              <a href="#medicos">
                Quero estudar <ArrowUpRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 rounded-sm border-sage/50 px-8 text-foreground hover:border-sage hover:bg-sage/10">
              <a href="#experts">Quero ser mentor</a>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border/60 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="px-6 py-10 text-center">
              <div className="font-serif text-3xl text-gold md:text-4xl">{s.value}</div>
              <div className="mt-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* QUEM VIVE AQUI */}
      <section className="mx-auto max-w-7xl px-6 pt-28">
        <span className="text-[10px] uppercase tracking-[0.3em] text-gold">Para quem é</span>
        <h2 className="mt-3 max-w-3xl font-serif text-4xl md:text-5xl">Só médicos. Dois papéis. A mesma medicina do futuro.</h2>
      </section>

      <section id="medicos" className="mx-auto max-w-7xl scroll-mt-20 px-6 pt-12">
        <article className="grid gap-10 rounded-sm border border-gold/40 bg-gradient-to-br from-gold/10 to-transparent p-10 md:grid-cols-2">
          <div>
            <Sparkles className="h-6 w-6 text-gold" />
            <span className="mt-6 block text-[10px] uppercase tracking-[0.3em] text-gold">Médico · {classInfo.lifer.tagline}</span>
            <h3 className="mt-2 font-serif text-4xl">{classInfo.lifer.name}</h3>
            <p className="mt-4 text-muted-foreground">{classInfo.lifer.desc}</p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>· Base científica, Biotecnologia, Rede médica, Carreira e Negócio</li>
              <li>· Trilhas, certificados e árvore de competências</li>
              <li>· Estudo diário com XP e constância</li>
            </ul>
            <Button asChild className="mt-8 rounded-sm bg-gold text-primary-foreground hover:bg-gold-soft">
              <Link to="/auth" search={{ mode: "signup" } as never}>Começar como Médico Aluno</Link>
            </Button>
          </div>
          <div className="rounded-sm border border-border/60 bg-background/60 p-8">
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">O que o aluno encontra</span>
            <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
              {liferPlaces.map((p) => (
                <li key={p} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">{p}</li>
              ))}
            </ul>
          </div>
        </article>
      </section>

      <section id="experts" className="mx-auto max-w-7xl scroll-mt-20 px-6 pb-28 pt-6">
        <article className="grid gap-10 rounded-sm border border-sage/40 bg-gradient-to-br from-sage/10 to-transparent p-10 md:grid-cols-2">
          <div>
            <Compass className="h-6 w-6 text-sage" />
            <span className="mt-6 block text-[10px] uppercase tracking-[0.3em] text-sage">Médico · {classInfo.valley_expert.tagline}</span>
            <h3 className="mt-2 font-serif text-4xl">{classInfo.valley_expert.name}</h3>
            <p className="mt-4 text-muted-foreground">{classInfo.valley_expert.desc}</p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>· Conhecimento, Contribuição, Impacto, Reputação e Experiência</li>
              <li>· Trilha de autoridade e painel de reputação</li>
              <li>· Espaço para ensinar, mentorar e lançar cursos</li>
            </ul>
            <Button asChild variant="outline" className="mt-8 rounded-sm border-sage/60 text-foreground hover:bg-sage/10">
              <Link to="/auth" search={{ mode: "signup" } as never}>Entrar como Médico Mentor</Link>
            </Button>
          </div>
          <div className="rounded-sm border border-border/60 bg-background/60 p-8">
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">O que o mentor encontra</span>
            <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
              {expertPlaces.map((p) => (
                <li key={p} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">{p}</li>
              ))}
            </ul>
          </div>
        </article>
      </section>

      {/* DIMENSÕES */}
      <section className="border-y border-border/60 bg-card/60">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold">Eixos de formação</span>
          <h2 className="mt-3 max-w-3xl font-serif text-4xl md:text-5xl">Cinco eixos formam o médico do futuro.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3 lg:grid-cols-5">
            {lifeAttributes.map(({ key, label, desc, icon: Icon }) => (
              <div key={key} className="rounded-sm border border-border/60 bg-background p-6">
                <Icon className="h-5 w-5 text-gold" />
                <h3 className="mt-4 font-serif text-xl">{label}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AMBIENTES */}
      <section
        id="ambientes"
        className="relative scroll-mt-20 overflow-hidden border-y border-border/60"
        style={{ backgroundImage: `url(${grainGold})`, backgroundSize: "cover" }}
      >
        <div className="absolute inset-0 bg-background/92" />
        <div className="relative mx-auto max-w-7xl px-6 py-28">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold">O campus</span>
          <h2 className="mt-3 max-w-3xl font-serif text-4xl md:text-5xl">Um campus digital feito para médicos.</h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Cada espaço muda conforme seu papel: o aluno encontra formação, o mentor encontra alcance.
          </p>
          <div className="mt-14 grid gap-px overflow-hidden rounded-sm border border-border/60 bg-border/60 md:grid-cols-3">
            {environments.map(({ name, desc }) => (
              <div key={name} className="group bg-background p-8 transition hover:bg-card">
                <h3 className="mt-6 font-serif text-xl">{name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SISTEMA DE EVOLUÇÃO */}
      <section id="jornada" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-28">
        <span className="text-[10px] uppercase tracking-[0.3em] text-gold">Como funciona</span>
        <h2 className="mt-3 max-w-3xl font-serif text-4xl md:text-5xl">Progresso visível, do primeiro módulo à referência.</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {gamification.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-sm border border-border/60 bg-card p-8">
              <Icon className="h-6 w-6 text-gold" />
              <h3 className="mt-6 font-serif text-2xl">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 rounded-sm border border-dashed border-border/70 bg-card/40 p-4 text-xs text-muted-foreground">
          {VALLEY_DISCLAIMER}
        </p>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-32 text-center">
        <MapIcon className="mx-auto h-6 w-6 text-gold" />
        <h2 className="mx-auto mt-6 max-w-3xl font-serif text-4xl md:text-6xl">
          O futuro da medicina <span className="text-gold">já começou</span>. Sua formação também.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
          Crie sua conta, conte sua especialidade em 4 passos e receba sua trilha hoje.
        </p>
        <Button asChild size="lg" className="mt-10 h-12 rounded-sm bg-gold px-10 text-primary-foreground hover:bg-gold-soft">
          <Link to="/auth" search={{ mode: "signup" } as never}>Começar minha formação</Link>
        </Button>
      </section>

      <SiteFooter />
    </div>
  );
}
