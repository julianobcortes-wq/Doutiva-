import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listCourses } from "@/lib/courses.functions";
import { listMentorSessions } from "@/lib/mentors.functions";
import { useValleyProfile } from "@/lib/use-city-profile";
import type { CityProfile } from "@/lib/city";
import {
  attributesFor, environmentsFor, experienceFor, missionsFor, stageFor, VALLEY_DISCLAIMER,
} from "@/lib/valley";
import {
  AttributeCard, ClassBadge, HumanEvolutionMap, NextStepCard, StageCard, ValleyMissionRow,
} from "@/components/valley/valley-ui";
import { Disclaimer, MetricCard, ReputationCard } from "@/components/city/city-ui";
import {
  GameLoopSummary, LifePointsBalance, SeasonProgress, StreakRecovery, WeeklyProgress,
} from "@/components/valley/game-ui";
import { useValleyGame } from "@/lib/use-valley-game";
import { currentSeason } from "@/lib/economy";
import { buildById, tierFor } from "@/lib/valley-v1";
import { Award, Clock, Flame, TrendingUp, ArrowUpRight, HandHeart, Megaphone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Minha Evolução — Doutiva" },
      { name: "description", content: "Seu painel de evolução humana: dimensões, estágio, missões e próximos passos na Doutiva." },
      { property: "og:title", content: "Minha Evolução — Doutiva" },
      { property: "og:description", content: "Acompanhe suas dimensões, seu estágio e seus próximos passos dentro da Doutiva." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { profile, update, addXp, hydrated } = useValleyProfile();
  const { state } = useValleyGame();
  const expert = profile.user_class === "valley_expert";
  const accent = expert ? "sage" : "gold";
  const xp = experienceFor(profile.user_class);
  const attrs = attributesFor(profile.user_class);
  const missions = missionsFor(profile.user_class).slice(0, 4);
  const done = profile.completed_missions;
  const stage = stageFor(profile.user_class, profile.level);
  const envs = environmentsFor(profile.user_class);

  function toggleMission(id: string, xp: number) {
    const isDone = done.includes(id);
    update({ completed_missions: isDone ? done.filter((m) => m !== id) : [...done, id] });
    addXp(isDone ? -xp : xp);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 pb-28 md:pb-10">
      <section
        className={`rounded-sm border bg-card p-8 md:p-12 ${
          expert ? "border-sage/30 bg-gradient-to-br from-sage/5 to-transparent" : "border-border/60"
        }`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{xp.kicker}</span>
          {hydrated && <ClassBadge userClass={profile.user_class} />}
          <span className="ml-auto hidden md:block"><LifePointsBalance wallet={state.wallet} accent={accent} /></span>
        </div>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">
          {profile.display_name ? `${profile.display_name}, ` : ""}
          {xp.headlinePrefix}{" "}
          <span className={expert ? "text-sage" : "text-gold"}>{stage.name}</span>.
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{xp.subtitle}</p>

        {hydrated && !profile.onboarding_completed && (
          <div className="mt-6 flex flex-wrap items-center gap-4 rounded-sm border border-gold/30 bg-gold/5 p-4">
            <p className="flex-1 text-sm text-muted-foreground">
              Faça a leitura inicial do seu momento para ativar seu mapa de evolução.
            </p>
            <Button asChild className="rounded-sm bg-gold text-primary-foreground hover:bg-gold-soft">
              <Link to="/onboarding">Iniciar leitura</Link>
            </Button>
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          {xp.metrics.map((m) => {
            const map = {
              score: { icon: TrendingUp, value: String(profile.life_score), hint: m.hint },
              level: { icon: Award, value: String(profile.level), hint: `${profile.xp} XP` },
              streak: { icon: Flame, value: `${profile.streak} dias`, hint: m.hint },
              points: { icon: Clock, value: String(profile.life_points), hint: m.hint },
            }[m.key];
            return <MetricCard key={m.key} icon={map.icon} label={m.label} value={map.value} hint={map.hint} />;
          })}
        </div>

        <div className="mt-8 border-t border-border/60 pt-6"><GameLoopSummary accent={accent} /></div>
      </section>

      <ValleyV1Strip
        expert={expert}
        level={profile.level}
        buildId={state.build_id}
        coins={state.lifer_coins}
      />

      {expert ? (
        <ExpertBoard profile={profile} />
      ) : (
        <section className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <HumanEvolutionMap profile={profile} />
          <div className="space-y-6">
            <StageCard profile={profile} />
            <NextStepCard profile={profile} />
          </div>
        </section>
      )}

      <Link
        to="/caso-do-dia"
        className="mt-10 flex flex-col gap-3 rounded-sm border border-primary/40 bg-gradient-to-br from-primary/10 to-transparent p-6 transition hover:border-primary sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-primary">Caso do Dia</span>
          <div className="mt-2 text-xl font-light">Um paciente está esperando sua conduta.</div>
          <p className="mt-1 text-sm text-muted-foreground">3 minutos · ganhe XP e Créditos e mantenha sua sequência.</p>
        </div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-primary">Atender agora →</span>
      </Link>

      <section className="mt-12">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-serif text-2xl">{expert ? "Suas dimensões de contribuição" : "Suas cinco dimensões"}</h2>
            <p className="text-sm text-muted-foreground">Cada ação na Doutiva move uma delas.</p>
          </div>
          <Link to="/skills" className={`text-[10px] uppercase tracking-[0.25em] ${expert ? "text-sage" : "text-gold"}`}>
            {expert ? "Ver mapa de contribuição" : "Ver mapa completo"}
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-5">
          {attrs.map((a) => <AttributeCard key={a.key} attr={a} value={profile.attributes[a.key] ?? 0} />)}
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-sm border border-border/60 bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl">{xp.missionsTitle}</h2>
              <p className="text-sm text-muted-foreground">{xp.missionsHint}</p>
            </div>
            <Link to="/missions" className={`text-[10px] uppercase tracking-[0.25em] ${expert ? "text-sage" : "text-gold"}`}>Todas</Link>
          </div>
          <div className="mt-4">
            {missions.map((m) => (
              <ValleyMissionRow key={m.id} mission={m} done={done.includes(m.id)} onToggle={() => toggleMission(m.id, m.xp)} />
            ))}
          </div>
        </div>

        <FocusPanel profile={profile} />
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <WeeklyProgress
          accent={accent}
          items={[
            { label: expert ? "Entregas concluídas" : "Ações concluídas", value: done.length, goal: 7 },
            { label: "XP da temporada", value: state.season_xp, goal: currentSeason.goal },
            { label: "Dias ativos no mês", value: state.active_days_month, goal: 30 },
          ]}
        />
        <StreakRecovery
          current={profile.streak}
          best={state.best_streak}
          activeDays={state.active_days_month}
          accent={accent}
        />
      </section>

      {!expert && <KeepLearning />}


      <section className="mt-12">
        <h2 className="font-serif text-2xl">{xp.environmentsLabel}</h2>
        <p className="text-sm text-muted-foreground">{xp.environmentsHint}</p>
        <div className="mt-6 grid gap-px overflow-hidden rounded-sm border border-border/60 bg-border/60 md:grid-cols-2 lg:grid-cols-3">
          {envs.map((e) => (
            <Link key={e.to} to={e.to as "/dashboard"} className="group bg-card p-6 transition hover:bg-secondary/50">
              <div className="flex items-center justify-between">
                <span className="font-serif text-xl">{e.name}</span>
                <ArrowUpRight
                  className={`h-4 w-4 text-muted-foreground transition ${expert ? "group-hover:text-sage" : "group-hover:text-gold"}`}
                />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{e.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <SeasonProgress season={currentSeason} xp={state.season_xp} accent={accent} />
        <div className="grid gap-px overflow-hidden rounded-sm border border-border/60 bg-border/60 sm:grid-cols-2">
          {[
            { to: "/wallet", name: "Pontos Doutiva", desc: "Saldo, origem e histórico." },
            { to: "/store", name: "Lojas Doutiva", desc: "Conhecimento, experiências e serviços." },
            { to: "/caso-do-dia", name: "Caso do Dia", desc: "Seu desafio clínico de hoje." },
            { to: "/marketplace", name: "Marketplace", desc: "Cursos, mentorias e serviços." },
          ].map((c) => (
            <Link key={c.to} to={c.to as "/dashboard"} className="bg-card p-5 transition hover:bg-secondary/50">
              <div className="font-serif text-lg">{c.name}</div>
              <p className="mt-1 text-xs text-muted-foreground">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <Disclaimer text={VALLEY_DISCLAIMER} />
    </div>
  );
}

/** Painel exclusivo do Mentor: demanda, alcance e reputação. */
function ValleyV1Strip({
  expert, level, buildId, coins,
}: { expert: boolean; level: number; buildId: string; coins: number }) {
  const tier = tierFor(level);
  const build = buildById(buildId);
  const accent = expert ? "text-sage" : "text-gold";
  return (
    <section className="mt-6 grid gap-px overflow-hidden rounded-sm border border-border/60 bg-border/60 md:grid-cols-3">
      <Link to="/skills" className="bg-card p-5 transition hover:bg-secondary/50">
        <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Patamar de vitalidade</span>
        <div className="mt-2 font-serif text-xl">{tier.tier}. <span className={accent}>{tier.name}</span></div>
        <p className="mt-1 text-xs text-muted-foreground">{tier.modifiers.join(" · ")}</p>
      </Link>
      <Link to="/skills" className="bg-card p-5 transition hover:bg-secondary/50">
        <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Build ativa</span>
        <div className="mt-2 font-serif text-xl">{build.name}</div>
        <p className="mt-1 text-xs text-muted-foreground">{build.tagline}</p>
      </Link>
      <Link to="/creditos" className="bg-card p-5 transition hover:bg-secondary/50">
        <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Créditos</span>
        <div className={`mt-2 font-serif text-xl ${accent}`}>{coins.toLocaleString("pt-BR")} DC</div>
        <p className="mt-1 text-xs text-muted-foreground">Saldo disponível para serviços e experiências.</p>
      </Link>
    </section>
  );
}

/** Painel exclusivo do Mentor: demanda, alcance e reputação. */
function ExpertBoard({ profile }: { profile: CityProfile }) {
  const fetchSessions = useServerFn(listMentorSessions);
  const { data: sessions } = useQuery({
    queryKey: ["my-mentor-sessions"],
    queryFn: () => fetchSessions(),
  });
  const pending = (sessions ?? []).filter((s) => s.status === "requested");

  return (
    <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr_1fr]">
      <div className="rounded-sm border border-border/60 bg-card p-6">
        <div className="flex items-center gap-2">
          <HandHeart className="h-4 w-4 text-sage" />
          <h3 className="font-serif text-xl">Pedidos de mentoria</h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {pending.length > 0
            ? `${pending.length} solicitação(ões) aguardando sua resposta.`
            : "Nenhuma solicitação em aberto no momento."}
        </p>
        <div className="mt-4 space-y-3">
          {pending.slice(0, 3).map((s) => (
            <div key={s.id} className="rounded-sm border border-border/60 px-4 py-3">
              <div className="text-sm">{s.topic}</div>
              <div className="text-xs text-muted-foreground">
                {s.preferred_at ? new Date(s.preferred_at).toLocaleDateString("pt-BR") : "Sem data definida"}
              </div>
            </div>
          ))}
        </div>
        <Link to="/inbox" className="mt-4 inline-block text-[10px] uppercase tracking-[0.25em] text-sage">
          Abrir solicitações
        </Link>
      </div>

      <div className="rounded-sm border border-border/60 bg-card p-6">
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-sage" />
          <h3 className="font-serif text-xl">Alcance do seu trabalho</h3>
        </div>
        <div className="mt-5 space-y-4">
          {[
            { label: "Visitas ao perfil", value: profile.profile_views, max: 2000 },
            { label: "médicos alunos impactados", value: 312, max: 500 },
            { label: "Conteúdos publicados", value: 18, max: 40 },
          ].map((r) => (
            <div key={r.label}>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{r.label}</span>
                <span>{r.value}</span>
              </div>
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-sage/70" style={{ width: `${Math.min(100, (r.value / r.max) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
        <Link to="/community" className="mt-5 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-sage">
          <Users className="h-3 w-3" /> Publicar na Praça
        </Link>
      </div>

      <ReputationCard score={profile.reputation_score} views={profile.profile_views} />
    </section>
  );
}

/** Resumo semanal com linguagem própria de cada classe. */
function FocusPanel({ profile }: { profile: CityProfile }) {
  const expert = profile.user_class === "valley_expert";
  const panel = experienceFor(profile.user_class).focusPanel;
  return (
    <div className="rounded-sm border border-border/60 bg-card p-6">
      <h3 className="font-serif text-xl">{panel.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{panel.hint}</p>
      <div className="mt-4 divide-y divide-border/60">
        {panel.rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between py-3 text-sm">
            <span className="text-muted-foreground">{r.label}</span>
            <span className={expert ? "text-sage" : "text-gold"}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Só médicos alunos recebem sugestão de estudo no painel. */
function KeepLearning() {
  const fetchCourses = useServerFn(listCourses);
  const { data: courses } = useQuery({ queryKey: ["courses"], queryFn: () => fetchCourses() });
  const featured = (courses ?? []).slice(0, 3);
  return (
    <section className="mt-12 rounded-sm border border-border/60 bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl">Continue aprendendo</h2>
        <Link to="/academy" className="text-[10px] uppercase tracking-[0.25em] text-gold">Universidade</Link>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {featured.length === 0 && <p className="text-sm text-muted-foreground">Carregando jornadas...</p>}
        {featured.map((c) => (
          <Link
            key={c.id}
            to="/academy/$slug"
            params={{ slug: c.slug }}
            className="flex items-center justify-between rounded-sm border border-border/60 px-4 py-3 hover:border-gold/40"
          >
            <span>
              <span className="block text-sm">{c.title}</span>
              <span className="text-xs text-muted-foreground">{c.instructor_name}</span>
            </span>
            <ArrowUpRight className="h-4 w-4 text-gold" />
          </Link>
        ))}
      </div>
    </section>
  );
}