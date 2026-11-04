import { Link } from "@tanstack/react-router";
import { Check, Lock, Sparkles, Compass } from "lucide-react";
import type { CityProfile } from "@/lib/city";
import { stageName } from "@/lib/city";
import {
  attributesFor, classInfo, skillsFor, stageFor,
  type AttributeDef, type Skill, type UserClass, type ValleyMission,
} from "@/lib/valley";

export function ClassBadge({ userClass }: { userClass: UserClass }) {
  const info = classInfo[userClass];
  const expert = userClass === "valley_expert";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${
        expert ? "border-sage/40 bg-sage/10 text-sage" : "border-gold/40 bg-gold/10 text-gold"
      }`}
    >
      {expert ? <Compass className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
      {info.name}
    </span>
  );
}

export function StageCard({ profile }: { profile: CityProfile }) {
  const stage = stageFor(profile.user_class, profile.level);
  const pct = Math.min(100, Math.round((profile.xp / profile.xp_to_next) * 100));
  return (
    <div className="rounded-sm border border-border/60 bg-card p-6">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Estágio atual · Nível {profile.level}
        </span>
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold">{stageName(profile)}</span>
      </div>
      <p className="mt-3 font-serif text-2xl">{stage.desc}</p>
      <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-gradient-to-r from-gold-soft to-gold" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{profile.xp} XP</span>
        <span>{Math.max(0, profile.xp_to_next - profile.xp)} XP para o próximo estágio</span>
      </div>
    </div>
  );
}

export function AttributeCard({ attr, value }: { attr: AttributeDef; value: number }) {
  const Icon = attr.icon;
  return (
    <div className="rounded-sm border border-border/60 bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 font-serif text-lg">
          <Icon className="h-4 w-4 text-gold" /> {attr.label}
        </span>
        <span className="font-serif text-2xl text-gold">{value}</span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{attr.desc}</p>
      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-gold/70" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}

/** Mapa de Evolução Humana — radar das dimensões da classe. */
export function HumanEvolutionMap({ profile }: { profile: CityProfile }) {
  const attrs = attributesFor(profile.user_class);
  const size = 260;
  const c = size / 2;
  const r = 92;
  const n = attrs.length;
  const point = (i: number, ratio: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [c + Math.cos(angle) * r * ratio, c + Math.sin(angle) * r * ratio] as const;
  };
  const values = attrs.map((a) => Math.max(6, Math.min(100, profile.attributes[a.key] ?? 0)));
  const polygon = values.map((v, i) => point(i, v / 100).join(",")).join(" ");
  const grid = [0.25, 0.5, 0.75, 1];

  return (
    <div className="rounded-sm border border-border/60 bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl">
          {profile.user_class === "valley_expert" ? "Mapa de Contribuição" : "Mapa de Evolução Humana"}
        </h3>
        <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">5 dimensões</span>
      </div>
      <div className="mt-4 flex flex-col items-center gap-6 lg:flex-row">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-64 w-64 shrink-0">
          {grid.map((g) => (
            <polygon
              key={g}
              points={attrs.map((_, i) => point(i, g).join(",")).join(" ")}
              className="fill-none stroke-border"
              strokeWidth="1"
            />
          ))}
          {attrs.map((_, i) => {
            const [x, y] = point(i, 1);
            return <line key={i} x1={c} y1={c} x2={x} y2={y} className="stroke-border" strokeWidth="1" />;
          })}
          <polygon points={polygon} className="fill-gold/20 stroke-gold" strokeWidth="2" />
          {values.map((v, i) => {
            const [x, y] = point(i, v / 100);
            return <circle key={i} cx={x} cy={y} r="3.5" className="fill-gold" />;
          })}
        </svg>
        <div className="w-full flex-1 space-y-3">
          {attrs.map((a) => {
            const v = profile.attributes[a.key] ?? 0;
            return (
              <div key={a.key}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{a.label}</span>
                  <span>{v}</span>
                </div>
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-gold/70" style={{ width: `${Math.min(100, v)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SkillNode({
  skill, unlocked, available, onUnlock,
}: { skill: Skill; unlocked: boolean; available: boolean; onUnlock: () => void }) {
  return (
    <button
      type="button"
      disabled={unlocked || !available}
      onClick={onUnlock}
      className={`w-full rounded-sm border p-4 text-left transition ${
        unlocked
          ? "border-gold/50 bg-gold/5"
          : available
            ? "border-border/60 bg-card hover:border-gold/40"
            : "border-border/40 bg-secondary/40 opacity-70"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-serif text-base">{skill.name}</span>
        {unlocked ? <Check className="h-4 w-4 text-gold" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{skill.desc}</p>
      <span className="mt-3 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {unlocked ? "Desbloqueada" : available ? "Disponível — toque para ativar" : `Nível ${skill.requiredLevel}`}
      </span>
    </button>
  );
}

export function SkillTree({
  profile, onUnlock,
}: { profile: CityProfile; onUnlock: (id: string) => void }) {
  const attrs = attributesFor(profile.user_class);
  const skills = skillsFor(profile.user_class);
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {attrs.map((a) => (
        <div key={a.key} className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            <a.icon className="h-3.5 w-3.5 text-gold" /> {a.label}
          </div>
          {skills
            .filter((s) => s.attribute === a.key)
            .map((s) => (
              <SkillNode
                key={s.id}
                skill={s}
                unlocked={profile.unlocked_skills.includes(s.id)}
                available={profile.level >= s.requiredLevel}
                onUnlock={() => onUnlock(s.id)}
              />
            ))}
        </div>
      ))}
    </div>
  );
}

export function ValleyMissionRow({
  mission, done, onToggle,
}: { mission: ValleyMission; done: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center gap-4 border-b border-border/60 px-1 py-3 text-left last:border-b-0"
    >
      <span
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-sm border transition ${
          done ? "border-gold bg-gold/15 text-gold" : "border-border/70 text-transparent"
        }`}
      >
        <Check className="h-3.5 w-3.5" />
      </span>
      <span className="flex-1">
        <span className={`block text-sm ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>
          {mission.title}
        </span>
        <span className="text-xs text-muted-foreground">{mission.desc}</span>
      </span>
      <span className="shrink-0 text-xs uppercase tracking-[0.2em] text-gold">+{mission.xp} XP</span>
    </button>
  );
}

export function NextStepCard({ profile }: { profile: CityProfile }) {
  const next = skillsFor(profile.user_class).find(
    (s) => !profile.unlocked_skills.includes(s.id) && profile.level >= s.requiredLevel,
  );
  return (
    <div className="rounded-sm border border-gold/30 bg-gradient-to-br from-gold/8 to-transparent p-6">
      <span className="text-[10px] uppercase tracking-[0.25em] text-gold">Próximo passo</span>
      <div className="mt-3 font-serif text-xl">{next ? next.name : "Avance de nível para novas habilidades"}</div>
      <p className="mt-2 text-sm text-muted-foreground">
        {next ? next.desc : "Complete missões para desbloquear o próximo ramo da sua árvore."}
      </p>
      <Link to="/skills" className="mt-4 inline-block text-[10px] uppercase tracking-[0.25em] text-gold">
        Abrir árvore de habilidades
      </Link>
    </div>
  );
}