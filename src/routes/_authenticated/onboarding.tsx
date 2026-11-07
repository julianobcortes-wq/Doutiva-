import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useValleyProfile } from "@/lib/use-city-profile";
import { defaultAttributesFor } from "@/lib/city";
import { VALLEY_DISCLAIMER, classInfo, type UserClass } from "@/lib/valley";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Compass, Sparkles, Check } from "lucide-react";
import { Disclaimer } from "@/components/city/city-ui";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Leitura inicial — Doutiva" },
      { name: "description", content: "Conte seu momento na medicina e receba sua trilha de formação na Doutiva." },
      { property: "og:title", content: "Leitura inicial — Doutiva" },
      { property: "og:description", content: "O primeiro passo da sua formação como médico do futuro." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OnboardingPage,
});

const moments = [
  "Recém-formado(a)",
  "Em residência",
  "Especialista em consolidação",
  "Especialista consolidado, quero ir além",
];
const intentions = ["Atualização científica", "Dominar biotecnologia", "Crescer na carreira", "Abrir ou escalar consultório", "Virar referência"];
const lifeGoals = ["Medicina de precisão", "Longevidade", "Terapias celulares", "IA na prática clínica", "Gestão de consultório", "Posicionamento digital"];
const lifeHabits = ["Leitura de artigos", "Aulas em vídeo", "Discussão de casos", "Congressos", "Mentoria 1:1", "Prática supervisionada"];
const healthTopics = ["Biotecnologia", "Genômica", "Performance", "Longevidade", "Medicina regenerativa", "Negócios em saúde"];
const activityLevels = ["Até 2h", "2 a 5h", "5 a 10h", "Mais de 10h"];

const professionalTypes = ["Consultório próprio", "Clínica", "Hospital", "Healthtech", "Universidade"];
const professions = ["Clínica médica", "Cardiologia", "Endocrinologia", "Dermatologia", "Ortopedia", "Medicina esportiva", "Outra especialidade"];
const serviceOptions = ["Cursos", "Mentorias", "Aulas ao vivo", "Discussão de casos", "Pesquisa", "Conteúdo científico"];
const contributions = ["Ensinar", "Atender", "Mentorar", "Pesquisar", "Construir produtos", "Liderar comunidade"];

function Chips({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(on ? value.filter((v) => v !== o) : [...value, o])}
            className={`rounded-sm border px-3 py-1.5 text-xs transition ${
              on ? "border-gold bg-gold/10 text-gold" : "border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function Single({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`rounded-sm border px-3 py-1.5 text-xs transition ${
            value === o ? "border-gold bg-gold/10 text-gold" : "border-border/60 text-muted-foreground hover:text-foreground"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function OnboardingPage() {
  const navigate = useNavigate();
  const { profile, update } = useValleyProfile();
  const [step, setStep] = useState(0);
  const [userClass, setUserClass] = useState<UserClass>(profile.user_class);
  const [form, setForm] = useState({
    display_name: profile.display_name,
    city: profile.city,
    bio: profile.bio,
    moment: profile.moment,
    intention: profile.intention,
    goals: profile.goals,
    habits: profile.habits,
    health_interests: profile.health_interests,
    activity_level: profile.activity_level,
    profession: profile.profession,
    specialty: profile.specialty,
    professional_type: profile.professional_type,
    services: profile.services,
    business_name: profile.business_name,
    space_type: profile.space_type,
  });

  const expert = userClass === "valley_expert";
  const steps = ["Classe", expert ? "Identidade" : "Momento", expert ? "Experiência" : "Dimensões", "Pronto"];

  function finish() {
    update({
      ...form,
      user_class: userClass,
      attributes: defaultAttributesFor(userClass),
      onboarding_completed: true,
    });
    toast.success("Sua trilha está pronta. Bons estudos.");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 pb-28 md:pb-16">
      <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Leitura inicial</span>
      <h1 className="mt-3 font-serif text-4xl md:text-5xl">Antes de metas, autoconhecimento.</h1>
      <p className="mt-3 text-muted-foreground">
        Quatro passos rápidos para entender seu momento na medicina e montar sua trilha.
      </p>

      <div className="mt-8 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 flex-col gap-2">
            <div className={`h-1 rounded-full ${i <= step ? "bg-gold" : "bg-secondary"}`} />
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{s}</span>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-sm border border-border/60 bg-card p-6 md:p-8">
        {step === 0 && (
          <div>
            <h2 className="font-serif text-2xl">Qual é a sua classe na Doutiva?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A classe é permanente: ela não muda com nível, plano ou tempo de casa.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setUserClass("lifer")}
                className={`rounded-sm border p-6 text-left transition ${
                  userClass === "lifer" ? "border-gold bg-gold/5" : "border-border/60 hover:border-gold/40"
                }`}
              >
                <Sparkles className="h-5 w-5 text-gold" />
                <div className="mt-3 font-serif text-xl">{classInfo.lifer.name}</div>
                <p className="mt-2 text-sm text-muted-foreground">{classInfo.lifer.desc}</p>
              </button>
              <button
                type="button"
                onClick={() => setUserClass("valley_expert")}
                className={`rounded-sm border p-6 text-left transition ${
                  expert ? "border-sage bg-sage/5" : "border-border/60 hover:border-sage/40"
                }`}
              >
                <Compass className="h-5 w-5 text-sage" />
                <div className="mt-3 font-serif text-xl">{classInfo.valley_expert.name}</div>
                <p className="mt-2 text-sm text-muted-foreground">{classInfo.valley_expert.desc}</p>
              </button>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Como quer ser chamado</Label>
                <Input
                  value={form.display_name}
                  onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                  className="mt-2 h-11 rounded-sm border-border bg-background"
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Cidade</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="mt-2 h-11 rounded-sm border-border bg-background"
                />
              </div>
            </div>
          </div>
        )}

        {step === 1 && !expert && (
          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-2xl">Como você chega à Doutiva hoje?</h2>
              <Single options={moments} value={form.moment} onChange={(moment) => setForm({ ...form, moment })} />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">O que você mais quer sentir</Label>
              <Single options={intentions} value={form.intention} onChange={(intention) => setForm({ ...form, intention })} />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Como está seu corpo hoje</Label>
              <Single options={activityLevels} value={form.activity_level} onChange={(activity_level) => setForm({ ...form, activity_level })} />
            </div>
          </div>
        )}

        {step === 1 && expert && (
          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-2xl">Quem você é dentro da saúde?</h2>
              <Single options={professionalTypes} value={form.professional_type} onChange={(professional_type) => setForm({ ...form, professional_type })} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Nome do negócio ou perfil</Label>
                <Input
                  value={form.business_name}
                  onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                  className="mt-2 h-11 rounded-sm border-border bg-background"
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Especialidade / foco</Label>
                <Input
                  value={form.specialty}
                  onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                  className="mt-2 h-11 rounded-sm border-border bg-background"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Profissão</Label>
              <Single options={professions} value={form.profession} onChange={(profession) => setForm({ ...form, profession })} />
            </div>
          </div>
        )}

        {step === 2 && !expert && (
          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-2xl">Quais dimensões você quer fortalecer?</h2>
              <Chips options={lifeGoals} value={form.goals} onChange={(goals) => setForm({ ...form, goals })} />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Hábitos que quer acompanhar</Label>
              <Chips options={lifeHabits} value={form.habits} onChange={(habits) => setForm({ ...form, habits })} />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Temas de interesse</Label>
              <Chips options={healthTopics} value={form.health_interests} onChange={(health_interests) => setForm({ ...form, health_interests })} />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Uma linha sobre você</Label>
              <Textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                className="mt-2 rounded-sm border-border bg-background"
              />
            </div>
            <Disclaimer text={VALLEY_DISCLAIMER} />
          </div>
        )}

        {step === 2 && expert && (
          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-2xl">Como você contribui?</h2>
              <Chips options={contributions} value={form.goals} onChange={(goals) => setForm({ ...form, goals })} />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">O que você oferece</Label>
              <Chips options={serviceOptions} value={form.services} onChange={(services) => setForm({ ...form, services })} />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Uma linha sobre a sua atuação</Label>
              <Textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                className="mt-2 rounded-sm border-border bg-background"
              />
            </div>
            <Disclaimer text={VALLEY_DISCLAIMER} />
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-gold/40 text-gold">
              <Check className="h-6 w-6" />
            </div>
            <h2 className="mt-5 font-serif text-3xl">Seu mapa está pronto.</h2>
            <p className="mt-3 text-muted-foreground">
              {expert
                ? "Você entra como Médico Mentor. Sua trilha acompanha conhecimento, contribuição, impacto, reputação e experiência como mentor."
                : "Você entra como Médico Aluno. Seu mapa acompanha base científica, biotecnologia, rede médica, carreira e negócio."}
            </p>
          </div>
        )}

        <div className="mt-10 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="rounded-sm text-muted-foreground"
          >
            Voltar
          </Button>
          {step < 3 ? (
            <Button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="rounded-sm bg-gold px-8 text-primary-foreground hover:bg-gold-soft"
            >
              Continuar
            </Button>
          ) : (
            <Button onClick={finish} className="rounded-sm bg-gold px-8 text-primary-foreground hover:bg-gold-soft">
              Ativar meu mapa
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
