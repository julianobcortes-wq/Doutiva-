import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useValleyProfile } from "@/lib/use-city-profile";
import { classInfo, type UserClass } from "@/lib/valley";
import { defaultAttributesFor } from "@/lib/city";
import { useValleyGame } from "@/lib/use-valley-game";
import { intensityLabel, type GamificationIntensity } from "@/lib/economy";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Configurações — Doutiva" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [email, setEmail] = useState("");
  const [id, setId] = useState("");
  const { profile, update, hydrated } = useValleyProfile();
  const { state, update: updateGame } = useValleyGame();

  function switchClass(next: UserClass) {
    if (next === profile.user_class) return;
    update({
      user_class: next,
      attributes: defaultAttributesFor(next),
      unlocked_skills: [],
      completed_missions: [],
    });
  }

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
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">E-mail</Label>
              <Input value={email} disabled className="mt-2 h-11 rounded-sm bg-background border-border" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">ID de membro</Label>
              <Input value={id} disabled className="mt-2 h-11 rounded-sm bg-background border-border font-mono text-xs" />
            </div>
          </div>
        </section>

        <section className="rounded-sm border border-border/60 bg-card p-6">
          <h2 className="font-serif text-xl">Classe na Doutiva</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A classe define todo o seu ambiente: menus, painel, dimensões e ações do dia.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {(["lifer", "valley_expert"] as UserClass[]).map((c) => {
              const active = hydrated && profile.user_class === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => switchClass(c)}
                  className={`rounded-sm border p-5 text-left transition ${
                    active
                      ? c === "valley_expert"
                        ? "border-sage/50 bg-sage/5"
                        : "border-gold/50 bg-gold/5"
                      : "border-border/60 hover:border-gold/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-lg">{classInfo[c].name}</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {active ? "Ativa" : "Selecionar"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{classInfo[c].desc}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-sm border border-border/60 bg-card p-6">
          <h2 className="font-serif text-xl">Plano</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Você é <span className="text-gold">membro fundador</span>. Acesso completo ao ecossistema.
          </p>
          <Button className="mt-4 rounded-sm bg-gold text-primary-foreground hover:bg-gold-soft">Gerenciar plano</Button>
        </section>

        <section className="rounded-sm border border-border/60 bg-card p-6">
          <h2 className="font-serif text-xl">Experiência de progressão</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Você decide o quanto os elementos de jogo aparecem. A plataforma funciona igual em qualquer intensidade.
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