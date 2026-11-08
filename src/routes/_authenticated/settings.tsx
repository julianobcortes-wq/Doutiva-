import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useValleyProfile } from "@/lib/use-city-profile";
import { classInfo } from "@/lib/valley";
import { useValleyGame } from "@/lib/use-valley-game";
import { intensityLabel, type GamificationIntensity } from "@/lib/economy";
import { getNotificationPrefs, saveNotificationPrefs } from "@/lib/notifications.functions";
import { acceptLegal, myLegalAcceptances } from "@/lib/legal.functions";
import { LEGAL_VERSIONS } from "@/lib/legal-versions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Configurações — Doutiva" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [email, setEmail] = useState("");
  const [id, setId] = useState("");
  const { profile, update, hydrated } = useValleyProfile();
  const { state, update: updateGame } = useValleyGame();
  const qc = useQueryClient();
  const fetchPrefs = useServerFn(getNotificationPrefs);
  const savePrefs = useServerFn(saveNotificationPrefs);
  const fetchLegal = useServerFn(myLegalAcceptances);
  const accept = useServerFn(acceptLegal);
  const { data: prefs } = useQuery({ queryKey: ["notif-prefs"], queryFn: () => fetchPrefs() });
  const { data: legal = [] } = useQuery({ queryKey: ["legal"], queryFn: () => fetchLegal() });
  const [waPhone, setWaPhone] = useState("");
  const prefMut = useMutation({
    mutationFn: (payload: {
      daily_case_email: boolean;
      whatsapp_opt_in?: boolean;
      whatsapp_e164?: string | null;
    }) =>
      savePrefs({
        data: {
          daily_case_email: payload.daily_case_email,
          email: email || null,
          whatsapp_opt_in: payload.whatsapp_opt_in,
          whatsapp_e164: payload.whatsapp_e164,
        },
      }),
    onSuccess: () => {
      toast.success("Preferências salvas");
      qc.invalidateQueries({ queryKey: ["notif-prefs"] });
    },
  });
  const legalMut = useMutation({
    mutationFn: (doc: "terms" | "privacy" | "ai_policy") => accept({ data: { doc } }),
    onSuccess: () => {
      toast.success("Aceite registrado");
      qc.invalidateQueries({ queryKey: ["legal"] });
    },
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "");
      setId(data.user?.id ?? "");
    });
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 pb-24 md:pb-12">
      <span className="text-[10px] uppercase tracking-[0.3em] text-gold">Configurações</span>
      <h1 className="mt-3 font-serif text-4xl">Sua conta</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Dados de identificação, preferências e segurança.
      </p>

      <div className="mt-10 space-y-8">
        <section className="rounded-sm border border-border/60 bg-card p-6">
          <h2 className="font-serif text-xl">Perfil</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                E-mail
              </Label>
              <Input
                value={email}
                disabled
                className="mt-2 h-11 rounded-sm bg-background border-border"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                ID de membro
              </Label>
              <Input
                value={id}
                disabled
                className="mt-2 h-11 rounded-sm bg-background border-border font-mono text-xs"
              />
            </div>
          </div>
        </section>

        <section className="rounded-sm border border-border/60 bg-card p-6">
          <h2 className="font-serif text-xl">Seu perfil</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Conta de médico aluno. Acesso a Estúdio e Painel do Mentor exige papel de corpo
            docente — não se altera aqui.
          </p>
          <p className="mt-3 text-sm">
            Classe ativa:{" "}
            <strong className="text-foreground">
              {hydrated ? classInfo[profile.user_class]?.name ?? "Médico Aluno" : "…"}
            </strong>
          </p>
        </section>

        <section className="rounded-sm border border-border/60 bg-card p-6">
          <h2 className="font-serif text-xl">Plano</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Peptídeos é livre. Protocolos (R$&nbsp;297/mês) abre as demais trilhas e os Professores
            de IA.
          </p>
          <Button
            asChild
            className="mt-4 rounded-sm bg-gold text-primary-foreground hover:bg-gold-soft"
          >
            <Link to="/billing">Gerenciar plano</Link>
          </Button>
        </section>

        <section className="rounded-sm border border-border/60 bg-card p-6">
          <h2 className="font-serif text-xl">Caso do Dia por e-mail</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Receba o desafio clínico do dia no seu e-mail (quando o envio estiver ativo).
          </p>
          <button
            type="button"
            onClick={() =>
              prefMut.mutate({
                daily_case_email: !(prefs?.daily_case_email ?? true),
                whatsapp_opt_in: Boolean((prefs as any)?.whatsapp_opt_in),
                whatsapp_e164: ((prefs as any)?.whatsapp_e164 ?? waPhone) || null,
              })
            }
            className="mt-4 flex w-full items-center justify-between rounded-sm border border-border/60 px-4 py-3 text-sm hover:border-gold/40"
          >
            <span className="text-muted-foreground">Receber desafio diário</span>
            <span
              className={(prefs?.daily_case_email ?? true) ? "text-gold" : "text-muted-foreground"}
            >
              {(prefs?.daily_case_email ?? true) ? "Ativado" : "Desativado"}
            </span>
          </button>
        </section>

        <section className="rounded-sm border border-border/60 bg-card p-6">
          <h2 className="font-serif text-xl">Caso do Dia no WhatsApp</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Hábito no bolso. O Preceptor manda o caso do seu mapa (quando o canal estiver ligado).
          </p>
          <Label className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            WhatsApp (E.164, ex. 5511999999999)
          </Label>
          <Input
            className="mt-2 h-11 rounded-sm"
            value={waPhone || (prefs as any)?.whatsapp_e164 || ""}
            onChange={(e) => setWaPhone(e.target.value)}
            placeholder="5511999999999"
          />
          <button
            type="button"
            onClick={() =>
              prefMut.mutate({
                daily_case_email: prefs?.daily_case_email ?? true,
                whatsapp_opt_in: !Boolean((prefs as any)?.whatsapp_opt_in),
                whatsapp_e164: (waPhone || (prefs as any)?.whatsapp_e164 || "").replace(/\D/g, "") || null,
              })
            }
            className="mt-4 flex w-full items-center justify-between rounded-sm border border-border/60 px-4 py-3 text-sm hover:border-gold/40"
          >
            <span className="text-muted-foreground">Receber no WhatsApp</span>
            <span
              className={(prefs as any)?.whatsapp_opt_in ? "text-gold" : "text-muted-foreground"}
            >
              {(prefs as any)?.whatsapp_opt_in ? "Ativado" : "Desativado"}
            </span>
          </button>
        </section>

        <section className="rounded-sm border border-border/60 bg-card p-6">
          <h2 className="font-serif text-xl">Termos, LGPD e IA</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Registre o aceite das versões vigentes.
          </p>
          <div className="mt-4 space-y-2">
            {(
              [
                ["terms", "Termos", "/termos", LEGAL_VERSIONS.terms],
                ["privacy", "Privacidade", "/privacidade", LEGAL_VERSIONS.privacy],
                ["ai_policy", "Política de IA", "/politica-ia", LEGAL_VERSIONS.ai_policy],
              ] as const
            ).map(([doc, label, href, version]) => {
              const done = legal.some((l: any) => l.doc === doc && l.version === version);
              return (
                <div
                  key={doc}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-border/60 px-4 py-3"
                >
                  <Link to={href as "/termos"} className="text-sm text-gold underline">
                    {label} v{version}
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={done || legalMut.isPending}
                    onClick={() => legalMut.mutate(doc)}
                  >
                    {done ? "Aceito" : "Aceitar"}
                  </Button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-sm border border-border/60 bg-card p-6">
          <h2 className="font-serif text-xl">Experiência de progressão</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Você decide o quanto os elementos de jogo aparecem. A plataforma funciona igual em
            qualquer intensidade.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {(Object.keys(intensityLabel) as GamificationIntensity[]).map((k) => {
              const active = state.intensity === k;
              return (
                <button
                  key={k}
                  onClick={() => updateGame({ intensity: k })}
                  className={`rounded-sm border p-4 text-left transition ${
                    active ? "border-gold/50 bg-gold/5" : "border-border/60 hover:border-gold/40"
                  }`}
                >
                  <span className="font-serif text-lg">{intensityLabel[k].name}</span>
                  <p className="mt-2 text-xs text-muted-foreground">{intensityLabel[k].desc}</p>
                </button>
              );
            })}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              { key: "celebrations" as const, label: "Comemorações e microanimações" },
              { key: "sounds" as const, label: "Sons de progressão" },
            ].map((o) => (
              <button
                key={o.key}
                onClick={() => updateGame({ [o.key]: !state[o.key] } as never)}
                className="flex items-center justify-between rounded-sm border border-border/60 px-4 py-3 text-sm hover:border-gold/40"
              >
                <span className="text-muted-foreground">{o.label}</span>
                <span className={state[o.key] ? "text-gold" : "text-muted-foreground"}>
                  {state[o.key] ? "Ativado" : "Desativado"}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
