import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { setStoredClass } from "@/lib/use-city-profile";
import { classInfo, type UserClass } from "@/lib/valley";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso — Doutiva" },
      { name: "description", content: "Entre na Doutiva, a escola do médico do futuro." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [userClass, setUserClass] = useState<UserClass>("lifer");
  const expert = userClass === "valley_expert";

  const configured = isSupabaseConfigured();

  useEffect(() => {
    const client = getSupabase();
    if (!client) return;
    client.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
    const { data: sub } = client.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate({ to: "/dashboard" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const client = getSupabase();
    if (!client) {
      toast.error("Login indisponível: configure as variáveis Supabase na Vercel.");
      return;
    }

    // Prefer FormData so login works even if controlled-state sync lags.
    const form = new FormData(e.currentTarget);
    const formEmail = String(form.get("email") || email).trim();
    const formPassword = String(form.get("password") || password);
    const formName = String(form.get("name") || name).trim();
    if (!formEmail || !formPassword) {
      toast.error("Informe e-mail e senha.");
      return;
    }

    setLoading(true);
    setStoredClass(userClass);
    try {
      if (mode === "signup") {
        const { data, error } = await client.auth.signUp({
          email: formEmail,
          password: formPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: formName },
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Conta criada. Bem-vindo à Doutiva.");
          await navigate({ to: "/dashboard" });
          return;
        }
        toast.success("Conta criada. Verifique seu e-mail se a confirmação estiver ativa.");
      } else {
        const { data, error } = await client.auth.signInWithPassword({
          email: formEmail,
          password: formPassword,
        });
        if (error) throw error;
        if (!data.session) throw new Error("Sessão não criada. Tente novamente.");
        toast.success("Login realizado.");
        await navigate({ to: "/dashboard" });
      }
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : err instanceof Error
            ? err.message
            : "Erro ao autenticar";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    const client = getSupabase();
    if (!client) {
      toast.error("Login indisponível: configure as variáveis Supabase na Vercel.");
      return;
    }
    setStoredClass(userClass);
    const redirectTo = `${window.location.origin}/dashboard`;
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) {
      toast.error("Falha no login com Google. Ative o provedor Google em Supabase → Authentication → Providers.");
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden md:block">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-950 to-black" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-sm border border-gold/40 text-gold font-serif text-lg">D</span>
            <span className="font-serif text-lg tracking-[0.3em]">DOUTIVA</span>
          </Link>
          <div>
            <p className="font-serif text-3xl leading-snug">
              "A medicina do futuro não espera a próxima grade curricular. Ela se aprende entre médicos que já a praticam."
            </p>
            <div className="mt-6 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Manifesto Doutiva
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="text-center">
            <span className={`text-[10px] uppercase tracking-[0.3em] ${expert ? "text-sage" : "text-gold"}`}>Acesso de membro</span>
            <h1 className="mt-3 font-serif text-3xl">{mode === "signin" ? "Entrar na Doutiva" : "Solicitar acesso"}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "signin" ? "Use seu e-mail de membro" : "Sua aplicação será revisada em até 7 dias"}
            </p>
            {!configured ? (
              <p className="mt-4 rounded-sm border border-gold/30 bg-gold/10 px-3 py-2 text-left text-xs leading-relaxed text-muted-foreground">
                Autenticação ainda não configurada neste deploy. Cadastre as variáveis Supabase na
                Vercel e faça um novo deploy.
              </p>
            ) : null}
          </div>

          <div className="mt-8">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Entrar como</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {(["lifer", "valley_expert"] as UserClass[]).map((c) => {
                const active = userClass === c;
                const isExpert = c === "valley_expert";
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setUserClass(c)}
                    className={`rounded-sm border p-3 text-left transition ${
                      active
                        ? isExpert
                          ? "border-sage/60 bg-sage/10"
                          : "border-gold/60 bg-gold/10"
                        : "border-border/60 hover:border-border"
                    }`}
                  >
                    <span className={`font-serif text-base ${active ? (isExpert ? "text-sage" : "text-gold") : ""}`}>
                      {classInfo[c].name}
                    </span>
                    <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">
                      {classInfo[c].tagline}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogle}
            className={`mt-6 w-full h-11 rounded-sm border-border/80 hover:bg-transparent ${expert ? "hover:border-sage/60" : "hover:border-gold/60"}`}
          >
            Continuar com Google
          </Button>

          <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Nome completo</Label>
                <Input
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-2 h-11 rounded-sm bg-card border-border"
                />
              </div>
            )}
            <div>
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">E-mail</Label>
              <Input
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 h-11 rounded-sm bg-card border-border"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Senha</Label>
              <Input
                name="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-2 h-11 rounded-sm bg-card border-border"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className={`w-full h-11 rounded-sm text-primary-foreground ${expert ? "bg-sage hover:bg-sage/80" : "bg-gold hover:bg-gold-soft"}`}
            >
              {loading ? "Aguarde..." : mode === "signin" ? `Entrar como ${classInfo[userClass].name}` : "Criar conta"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "Ainda não é membro? " : "Já tem acesso? "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-gold hover:underline"
            >
              {mode === "signin" ? "Solicitar acesso" : "Entrar"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}