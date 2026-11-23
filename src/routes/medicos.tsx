import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BookOpenCheck, MessageSquareQuote, Repeat2, ShieldCheck } from "lucide-react";
import { getSupabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateCrm } from "@/lib/crm";
import { LEGAL_VERSIONS } from "@/lib/legal-versions";
import { captureUtm, getUtm, trackMeta } from "@/lib/tracking";

/**
 * Página de campanha: cadastro de médicos na trilha gratuita.
 * Regras (anúncios e CFM 2.336/2023): sem nome de medicamento ou substância, sem promessa de
 * resultado, acesso restrito a médicos com CRM informado e conferido.
 */
export const Route = createFileRoute("/medicos")({
  head: () => ({
    meta: [
      { title: "Trilha gratuita para médicos — Doutiva" },
      {
        name: "description",
        content:
          "Peptídeos na Medicina de Precisão: trilha gratuita de 15 aulas, exclusiva para médicos com CRM. Sessões guiadas, monografias com fontes e casos clínicos.",
      },
      { property: "og:title", content: "Trilha gratuita para médicos — Doutiva" },
      {
        property: "og:description",
        content:
          "15 aulas com sessões guiadas, fontes primárias e casos clínicos. Só para médicos.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MedicosPage,
});

const FREE_TRACK_SLUG = "peptideos-medicina-de-precisao";
const UFS =
  "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ");

const HIGHLIGHTS = [
  {
    icon: BookOpenCheck,
    title: "Sessões guiadas",
    text: "Cada aula vem em lâminas curtas, pontos-chave e um caso clínico para decidir.",
  },
  {
    icon: MessageSquareQuote,
    title: "Tutor que cita a fonte",
    text: "Dúvidas respondidas com referência à biblioteca de evidências da aula.",
  },
  {
    icon: Repeat2,
    title: "Revisão espaçada",
    text: "A plataforma traz de volta o que você ainda não fixou.",
  },
];

function MedicosPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  useEffect(() => {
    captureUtm();
    trackMeta("ViewContent");
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const client = getSupabase();
    if (!client) {
      toast.error("Cadastro indisponível no momento. Tente novamente em alguns minutos.");
      return;
    }

    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    const email = String(f.get("email") || "").trim();
    const phone = String(f.get("phone") || "").replace(/[^\d+]/g, "");
    const crm = String(f.get("crm") || "");
    const uf = String(f.get("uf") || "");
    const specialty = String(f.get("specialty") || "").trim();
    const password = String(f.get("password") || "");
    const consent = f.get("consent") === "on";

    if (name.length < 3) return void toast.error("Informe o nome completo.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return void toast.error("Informe um e-mail válido.");
    const crmCheck = validateCrm(crm, uf);
    if (!crmCheck.ok || !crmCheck.digits)
      return void toast.error(crmCheck.error ?? "CRM inválido.");
    if (password.length < 8)
      return void toast.error("A senha precisa ter pelo menos 8 caracteres.");
    if (!consent) return void toast.error("Confirme que você é médico(a) e aceita os termos.");

    setLoading(true);
    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/academy/${FREE_TRACK_SLUG}`,
          data: {
            full_name: name,
            crm: crmCheck.digits,
            crm_uf: uf.toUpperCase(),
            specialty: specialty || null,
            phone: phone || null,
            signup_source: "lp_medicos",
            declared_physician: true,
            consent_at: new Date().toISOString(),
            terms_version: LEGAL_VERSIONS.terms,
            privacy_version: LEGAL_VERSIONS.privacy,
            ...getUtm(),
          },
        },
      });
      if (error) throw error;

      trackMeta("CompleteRegistration");

      if (data.session) {
        toast.success("Conta criada. Sua trilha já está liberada.");
        await navigate({ to: "/academy/$slug", params: { slug: FREE_TRACK_SLUG } });
        return;
      }
      setPendingEmail(email);
    } catch (err) {
      const raw =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "";
      toast.error(
        raw.toLowerCase().includes("already registered")
          ? "Este e-mail já tem conta na Doutiva. Entre pela página de acesso."
          : raw || "Não foi possível criar a conta. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <span className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-sm border border-gold/40 font-serif text-lg text-gold">
              D
            </span>
            <span className="font-serif text-lg tracking-[0.3em]">DOUTIVA</span>
          </span>
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">
            Já tenho conta
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-12 px-6 py-12 md:grid-cols-[1fr_420px] md:py-20">
        <section>
          <span className="inline-flex items-center gap-2 rounded-sm border border-gold/40 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-gold">
            <ShieldCheck className="h-3.5 w-3.5" /> Exclusivo para médicos com CRM
          </span>
          <h1 className="mt-6 font-serif text-4xl leading-tight tracking-tight md:text-5xl">
            Peptídeos na Medicina de Precisão
          </h1>
          <p className="mt-3 font-serif text-2xl text-gold">Trilha gratuita · 15 aulas</p>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Fundamentos, evidências e casos clínicos em sessões curtas, para estudar entre um
            atendimento e outro. Conteúdo educacional da Doutiva, sem cartão de crédito.
          </p>
          <a
            href="#cadastro"
            className="mt-6 inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground md:hidden"
          >
            Liberar trilha gratuita
          </a>

          <ul className="mt-10 grid gap-6">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <Icon className="mt-1 h-5 w-5 shrink-0 text-gold" />
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-10 max-w-xl border-l border-gold/30 pl-4 text-sm text-muted-foreground">
            O acesso é restrito a médicos. O CRM informado no cadastro é conferido na base pública
            do Conselho Federal de Medicina.
          </p>
        </section>

        <section
          id="cadastro"
          className="scroll-mt-6 rounded-sm border border-border/70 bg-card/60 p-6 md:p-8"
        >
          {pendingEmail ? (
            <div className="space-y-4 text-center">
              <h2 className="font-serif text-2xl">Confirme seu e-mail</h2>
              <p className="text-sm text-muted-foreground">
                Enviamos um link para <span className="text-foreground">{pendingEmail}</span>. Abra
                o e-mail e a trilha gratuita abre em seguida.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <h2 className="font-serif text-2xl">Liberar minha trilha</h2>
                <p className="mt-1 text-sm text-muted-foreground">Leva menos de um minuto.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" name="name" autoComplete="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" autoComplete="email" required />
              </div>
              <div className="grid grid-cols-[1fr_96px] gap-3">
                <div className="space-y-2">
                  <Label htmlFor="crm">CRM</Label>
                  <Input id="crm" name="crm" inputMode="numeric" autoComplete="off" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uf">UF</Label>
                  <select
                    id="uf"
                    name="uf"
                    defaultValue=""
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
                  >
                    <option value="" disabled>
                      UF
                    </option>
                    {UFS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">
                  Especialidade <span className="text-muted-foreground">(opcional)</span>
                </Label>
                <Input id="specialty" name="specialty" autoComplete="off" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Celular <span className="text-muted-foreground">(opcional)</span>
                </Label>
                <Input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Crie uma senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              <label className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground">
                <input type="checkbox" name="consent" className="mt-0.5" required />
                <span>
                  Declaro que sou médico(a) com CRM ativo e aceito os{" "}
                  <Link to="/termos" className="underline underline-offset-4">
                    Termos
                  </Link>{" "}
                  e a{" "}
                  <Link to="/privacidade" className="underline underline-offset-4">
                    Política de Privacidade
                  </Link>
                  .
                </span>
              </label>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Criando sua conta…" : "Liberar trilha gratuita"}
              </Button>
            </form>
          )}
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-4 px-6 py-6 text-xs text-muted-foreground">
          <span>Doutiva · Conteúdo educacional para médicos</span>
          <Link to="/termos" className="hover:text-foreground">
            Termos
          </Link>
          <Link to="/privacidade" className="hover:text-foreground">
            Privacidade
          </Link>
        </div>
      </footer>
    </div>
  );
}
