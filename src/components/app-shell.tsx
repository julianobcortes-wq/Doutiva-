import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useValleyProfile } from "@/lib/use-city-profile";
import { StatusHud } from "@/components/valley/status-hud";
import { districtLabels, classLabel } from "@/lib/city";
import { experienceFor } from "@/lib/valley";
import { useProgress } from "@/lib/use-progress";
import { studioMe } from "@/lib/studio.functions";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Settings,
  LogOut,
  Search,
  Bell,
  Sparkles,
  Award,
  Trophy,
  Shield,
  Bookmark,
  LifeBuoy,
  Compass,
  Flame,
  Target,
  ShoppingBag,
  PenTool,
  Brain,
  CreditCard,
  ListOrdered,
} from "lucide-react";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard };

/** Student nav — only routes with real backend wiring. */
const studentNav = {
  primary: [
    { to: "/dashboard", label: "Meu campus", icon: LayoutDashboard },
    { to: "/mapa", label: "Mapa clínico", icon: Compass },
    { to: "/caso-do-dia", label: "Caso do Dia", icon: Flame },
    { to: "/academy", label: "Universidade", icon: GraduationCap },
    { to: "/revisao", label: "Revisão", icon: Target },
    { to: "/professores", label: "Professores de IA", icon: Brain },
  ] as NavItem[],
  environments: [
    { to: "/mentors", label: "Médicos Mentores", icon: Users },
    { to: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  ] as NavItem[],
  secondary: [
    { to: "/ranking", label: "Ranking", icon: Trophy },
    { to: "/certifications", label: "Certificados", icon: Award },
    { to: "/billing", label: "Meu plano", icon: CreditCard },
  ] as NavItem[],
  services: [
    { to: "/como-funciona", label: "Como funciona", icon: ListOrdered },
    { to: "/help", label: "Suporte", icon: LifeBuoy },
  ] as NavItem[],
  mobile: [
    { to: "/dashboard", label: "Campus", icon: LayoutDashboard },
    { to: "/mapa", label: "Mapa", icon: Compass },
    { to: "/caso-do-dia", label: "Caso", icon: Flame },
    { to: "/academy", label: "Estudar", icon: GraduationCap },
    { to: "/como-funciona", label: "Guia", icon: ListOrdered },
  ] as NavItem[],
};

/** Faculty/admin nav — gated by has_role('admin'), never by localStorage. */
const facultyNav = {
  primary: [
    { to: "/dashboard", label: "Painel do Mentor", icon: LayoutDashboard },
    { to: "/mapa", label: "Mapa clínico", icon: Compass },
    { to: "/editor", label: "Estúdio de Cursos", icon: PenTool },
    { to: "/editor/curadoria", label: "Curadoria IA", icon: Sparkles },
    { to: "/editor/biblioteca", label: "Biblioteca Científica", icon: Bookmark },
    { to: "/academy", label: "Meus cursos", icon: GraduationCap },
    { to: "/professores", label: "Professores de IA", icon: Brain },
  ] as NavItem[],
  environments: [
    { to: "/mentors", label: "Mentores", icon: Users },
    { to: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  ] as NavItem[],
  secondary: [
    { to: "/caso-do-dia", label: "Caso do Dia", icon: Flame },
    { to: "/ranking", label: "Reputação", icon: Trophy },
    { to: "/certifications", label: "Certificados", icon: Award },
    { to: "/inbox", label: "Inbox mentoria", icon: Users },
  ] as NavItem[],
  services: [
    { to: "/billing", label: "Meu plano", icon: CreditCard },
    { to: "/credenciais", label: "CRM / Credenciais", icon: CreditCard },
    { to: "/como-funciona", label: "Como funciona", icon: ListOrdered },
    { to: "/help", label: "Suporte", icon: LifeBuoy },
  ] as NavItem[],
  mobile: [
    { to: "/dashboard", label: "Painel", icon: LayoutDashboard },
    { to: "/editor", label: "Estúdio", icon: PenTool },
    { to: "/academy", label: "Cursos", icon: GraduationCap },
    { to: "/caso-do-dia", label: "Caso", icon: Flame },
    { to: "/como-funciona", label: "Guia", icon: ListOrdered },
  ] as NavItem[],
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const realProgress = useProgress();
  const router = useRouter();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [email, setEmail] = useState<string>("");
  const [search, setSearch] = useState("");
  const { profile, hydrated } = useValleyProfile();
  const { data: me } = useQuery({
    queryKey: ["studio-me"],
    queryFn: () => studioMe(),
    staleTime: 60_000,
  });
  // Server role wins. localStorage class is cosmetic only and cannot unlock Estúdio/Admin.
  const isFaculty = !!me?.isAdmin;
  const nav = isFaculty ? facultyNav : studentNav;
  const xp = experienceFor(isFaculty ? "valley_expert" : "lifer");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  function runSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    if (isFaculty) {
      if (q) sessionStorage.setItem("doutiva:library-q", q);
      router.navigate({ to: "/editor/biblioteca" });
      return;
    }
    router.navigate({ to: "/academy" });
  }

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }

  const initial = (profile.display_name[0] ?? email[0] ?? (isFaculty ? "M" : "A")).toUpperCase();
  const allNav = [...nav.primary, ...nav.environments, ...nav.secondary, ...nav.services];
  const currentLabel =
    allNav.find((i) => i.to === pathname)?.label ??
    allNav.find((i) => pathname.startsWith(i.to + "/"))?.label ??
    districtLabels[pathname] ??
    (isFaculty ? "Corpo docente" : "Doutiva");

  return (
    <div
      className={`min-h-screen bg-background text-foreground${isFaculty ? " theme-expert" : ""}`}
    >
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border/60 bg-sidebar md:flex">
        <div className="flex h-16 items-center gap-3 border-b border-border/60 px-6">
          <span className="grid h-8 w-8 place-items-center rounded-sm border border-gold/40 text-gold font-serif text-lg">
            D
          </span>
          <span className="font-serif text-base tracking-tight">DOUTIVA</span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-6">
          <NavGroup
            label={xp.primaryGroupLabel}
            items={nav.primary}
            pathname={pathname}
            expert={isFaculty}
          />
          <NavGroup
            label={xp.environmentsLabel}
            items={nav.environments}
            pathname={pathname}
            expert={isFaculty}
            className="mt-6"
          />
          <NavGroup
            label={xp.secondaryGroupLabel}
            items={nav.secondary}
            pathname={pathname}
            expert={isFaculty}
            className="mt-6"
          />
          <NavGroup
            label={isFaculty ? "Conta docente" : "Conta"}
            items={nav.services}
            pathname={pathname}
            expert={isFaculty}
            className="mt-6"
          />
        </div>

        <div className="border-t border-border/60 p-4">
          <div
            className={`rounded-sm border p-4 ${
              isFaculty
                ? "border-sage/30 bg-gradient-to-br from-sage/10 to-transparent"
                : "border-gold/30 bg-gradient-to-br from-gold/10 to-transparent"
            }`}
          >
            <div className="flex items-center justify-between">
              {isFaculty ? (
                <Compass className="h-4 w-4 text-sage" />
              ) : (
                <Sparkles className="h-4 w-4 text-gold" />
              )}
              <span
                className={`text-[9px] uppercase tracking-[0.25em] ${isFaculty ? "text-sage" : "text-gold"}`}
              >
                {realProgress ? `${realProgress.xp} XP` : "—"}
              </span>
            </div>
            <div className="mt-2 font-serif text-sm">{xp.cta.title}</div>
            <p className="mt-1 text-xs text-muted-foreground">{xp.cta.desc}</p>
            <Link
              to={xp.cta.to as "/dashboard"}
              className={`mt-3 block w-full rounded-sm border px-3 py-1.5 text-center text-xs uppercase tracking-[0.2em] ${
                isFaculty
                  ? "border-sage/40 text-sage hover:bg-sage/10"
                  : "border-gold/40 text-gold hover:bg-gold/10"
              }`}
            >
              {xp.cta.action}
            </Link>
          </div>

          <Link
            to="/settings"
            className="mt-4 flex items-center gap-3 rounded-sm px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
          >
            <Settings className="h-4 w-4" /> Perfil e preferências
          </Link>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <span className="md:hidden font-serif text-base">DOUTIVA</span>
            <span className="hidden text-[10px] uppercase tracking-[0.3em] text-muted-foreground lg:block">
              {currentLabel}
            </span>
            <form
              onSubmit={runSearch}
              className="hidden w-72 items-center gap-2 rounded-sm border border-border/60 bg-card px-3 py-1.5 text-sm text-muted-foreground md:flex"
            >
              <Search className="h-3.5 w-3.5 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  isFaculty ? "Buscar evidências na biblioteca…" : "Ir para a Universidade…"
                }
                className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
              />
            </form>
          </div>
          <div className="flex items-center gap-3">
            {isFaculty && (
              <span className="hidden items-center gap-1.5 rounded-full border border-sage/40 bg-sage/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-sage sm:inline-flex">
                <Shield className="h-3 w-3" /> Corpo docente
              </span>
            )}
            <Link
              to="/caso-do-dia"
              className={`hidden items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] sm:inline-flex ${
                isFaculty
                  ? "border-sage/40 bg-sage/5 text-sage"
                  : "border-gold/40 bg-gold/5 text-gold"
              }`}
            >
              <Flame className="h-3 w-3" /> {realProgress?.streak ?? 0} dias
            </Link>
            <Link
              to="/notifications"
              className={`grid h-9 w-9 place-items-center rounded-sm border border-border/60 text-muted-foreground hover:text-foreground ${
                isFaculty ? "hover:border-sage/40" : "hover:border-gold/40"
              }`}
            >
              <Bell className="h-4 w-4" />
            </Link>
            <div className="hidden text-right md:block">
              <div
                className={`text-[10px] uppercase tracking-[0.2em] ${isFaculty ? "text-sage" : "text-gold"}`}
              >
                {hydrated ? classLabel(profile) : "Doutiva"}
              </div>
              <div className="max-w-[180px] truncate text-xs text-foreground">{email || "—"}</div>
            </div>
            <Link
              to="/settings"
              className={`grid h-9 w-9 place-items-center rounded-full font-serif text-sm text-primary-foreground bg-gradient-to-br ${
                isFaculty ? "from-sage to-sage/70" : "from-gold to-gold-soft"
              }`}
            >
              {initial}
            </Link>
          </div>
        </header>

        <StatusHud expert={isFaculty} />

        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border/60 bg-background/95 backdrop-blur md:hidden">
        {nav.mobile.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to as "/dashboard"}
              className={`flex flex-col items-center gap-1 py-2 text-[10px] ${
                active ? (isFaculty ? "text-sage" : "text-gold") : "text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function NavGroup({
  label,
  items,
  pathname,
  expert,
  className = "",
}: {
  label: string;
  items: ReadonlyArray<{
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
  pathname: string;
  expert: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-2 px-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </div>
      <nav className="flex flex-col gap-1">
        {items.map(({ to, label: itemLabel, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to as "/dashboard"}
              className={`group flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition ${
                active
                  ? `border-l-2 bg-secondary pl-[10px] text-foreground ${expert ? "border-sage" : "border-gold"}`
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? (expert ? "text-sage" : "text-gold") : ""}`} />
              {itemLabel}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
