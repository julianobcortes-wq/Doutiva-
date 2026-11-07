import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getMentorBySlug } from "@/lib/mentors.functions";
import { ArrowLeft, Star, MapPin, Calendar, Award } from "lucide-react";

const mentorQuery = (slug: string) => ({
  queryKey: ["mentor", slug],
  queryFn: () => getMentorBySlug({ data: { slug } }),
});

export const Route = createFileRoute("/_authenticated/mentors/$slug")({
  head: () => ({ meta: [{ title: "Mentor — Doutiva" }] }),
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(mentorQuery(params.slug));
    if (!data) throw notFound();
    return data;
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="font-serif text-3xl">Mentor não encontrado</h1>
      <Link to="/mentors" className="mt-6 inline-block text-sm text-gold underline">Voltar</Link>
    </div>
  ),
  errorComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center text-muted-foreground">
      Erro ao carregar mentor.
    </div>
  ),
  component: MentorDetail,
});

function MentorDetail() {
  const { slug } = Route.useParams();
  const { data: mentor } = useSuspenseQuery(mentorQuery(slug));
  if (!mentor) return null;
  const initials = mentor.name.split(" ").slice(0, 2).map((n) => n[0]).join("");
  const rate = (mentor.hourly_rate_cents / 100).toLocaleString("pt-BR", {
    style: "currency", currency: "BRL", maximumFractionDigits: 0,
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 pb-24 md:pb-12">
      <Link to="/mentors" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-gold">
        <ArrowLeft className="h-3 w-3" /> Mentors
      </Link>

      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_320px]">
        <div>
          <div className="flex items-start gap-5">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-gold to-gold-soft font-serif text-2xl text-primary-foreground">
              {initials}
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-gold">{mentor.specialty}</span>
              <h1 className="mt-2 font-serif text-4xl">{mentor.name}</h1>
              <div className="mt-1 text-sm text-muted-foreground">{mentor.title}</div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                {mentor.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{mentor.location}</span>}
                <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-gold" />{Number(mentor.rating).toFixed(1)} · {mentor.sessions_count} sessões</span>
              </div>
            </div>
          </div>

          <section className="mt-10">
            <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Bio</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/90">{mentor.bio}</p>
          </section>

          <section className="mt-10">
            <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">O que esperar de uma sessão</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3"><Award className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> Diagnóstico do seu momento e maiores travas atuais.</li>
              <li className="flex gap-3"><Award className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> Plano de ação priorizado para os próximos 90 dias.</li>
              <li className="flex gap-3"><Award className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> Acesso ao network direto do mentor quando aplicável.</li>
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-sm border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent p-6">
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Investimento</div>
            <div className="mt-2 font-serif text-3xl text-gold">{rate}</div>
            <div className="text-xs text-muted-foreground">Sessão privada · 1h</div>
            <Link
              to="/mentors"
              className="mt-5 flex items-center justify-center gap-2 rounded-sm bg-gold py-2 text-sm text-primary-foreground hover:bg-gold-soft"
            >
              <Calendar className="h-4 w-4" /> Solicitar sessão
            </Link>
          </div>
          <div className="rounded-sm border border-border/60 bg-card p-6 text-xs text-muted-foreground">
            <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Garantia Doutiva</div>
            <p className="mt-2">Curadoria pessoal do time. Se não fizer sentido, remarcamos com outro mentor sem custo.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}