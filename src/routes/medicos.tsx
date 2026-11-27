import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Flame,
  Map as MapIcon,
  Route as RouteIcon,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { getSupabase } from "@/integrations/supabase/client";
import { isCookieBannerOpen, subscribeCookieBanner } from "@/components/cookie-consent";
import { registrarEvento } from "@/components/visit-tracker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidCrmUf, validateCrm } from "@/lib/crm";
import { LEGAL_VERSIONS } from "@/lib/legal-versions";
import {
  captureUtm,
  clearRedirectUtm,
  getConsent,
  getUtm,
  persistUtmForRedirect,
  trackMeta,
  trackingEnabled,
} from "@/lib/tracking";

/**
 * Página de campanha: cadastro de médicos na trilha gratuita.
 * Regras (anúncios e CFM 2.336/2023): sem nome de medicamento ou substância, sem promessa de
 * resultado, acesso restrito a médicos com CRM informado e conferido.
 */
export const Route = createFileRoute("/medicos")({
  head: () => ({
    meta: [
      { title: "A escola do médico do futuro — Doutiva" },
      {
        name: "description",
        content:
          "A IA identifica suas lacunas e monta uma trilha só sua, com um caso clínico por dia. Comece grátis, exclusivo para médicos com CRM.",
      },
      { property: "og:title", content: "A escola do médico do futuro — Doutiva" },
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

const DURACAO_DIAGNOSTICO = "poucos minutos"; // TODO(Juliano): confirmar a duração real do diagnóstico
const MOSTRAR_TELAS = false; // TODO(Juliano): colocar as 3 imagens em public/medicos/ e trocar para true
const MOSTRAR_CURADORIA = false; // TODO(Juliano): preencher a curadoria médica abaixo e trocar para true

const SUBTITULO_PADRAO = "Uma trilha única, montada a partir das suas lacunas";
const SUBTITULOS_POR_CONTEUDO: Record<string, string> = {
  a1_escola: SUBTITULO_PADRAO,
  a2_lacunas: "Descubra o que você ainda não domina, com casos clínicos",
  a3_diario: "Um caso clínico por dia, escolhido para o seu momento",
};

const TELAS_PRODUTO = [
  {
    src: "/medicos/tela-mapa.webp",
    caption: "Seu mapa de lacunas",
    width: 750,
    height: 1334,
  },
  {
    src: "/medicos/tela-caso.webp",
    caption: "O caso clínico do dia",
    width: 750,
    height: 1334,
  },
  {
    src: "/medicos/tela-trilha.webp",
    caption: "Sua trilha",
    width: 750,
    height: 1334,
  },
] as const;

type CuradorSlot = {
  // TODO(Juliano): preencher nome, CRM/UF, especialidade e foto opcional de até 2 responsáveis pela curadoria
  nome: string;
  crm: string;
  especialidade: string;
  foto?: string;
};

const CURADORIA: CuradorSlot[] = [
  // TODO(Juliano): adicionar até 2 responsáveis pela curadoria médica (foto opcional, nome, CRM/UF, especialidade)
];

const UFS =
  "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ");

const HIGHLIGHTS = [
  {
    icon: MapIcon,
    title: "Mapa das suas lacunas",
    text: "Um diagnóstico com casos clínicos mostra o que você já domina e o que falta.",
  },
  {
    icon: RouteIcon,
    title: "Uma trilha só sua",
    text: "A IA monta o caminho de estudo a partir das suas lacunas, sem estudar o que você já sabe.",
  },
  {
    icon: Flame,
    title: "Caso clínico todo dia",
    text: "Um desafio curto por dia, escolhido para o seu momento.",
  },
  {
    icon: Timer,
    title: "Sessões curtas",
    text: "Lâminas, pontos-chave e um caso para decidir, para estudar entre um atendimento e outro.",
  },
];

type FormErrors = {
  email?: string;
  crm?: string;
  uf?: string;
  name?: string;
  password?: string;
  consent?: string;
};

type CompletarMode = "none" | "checking" | "crm";

/**
 * O login com Google está ligado no Supabase, mas sem a chave secreta do Google (OAuth).
 * Clicar levava a uma página de erro do Supabase. Fica escondido até a chave ser configurada.
 */
const GOOGLE_LOGIN_ATIVO = false;

function GoogleGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.44a5.51 5.51 0 0 1-2.39 3.61v3h3.87c2.26-2.08 3.57-5.15 3.57-8.64Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.87-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.29v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.29a12 12 0 0 0 0 10.8l4-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.6l4 3.1c.94-2.84 3.59-4.95 6.71-4.95Z"
      />
    </svg>
  );
}

function MedicosPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [subtitle, setSubtitle] = useState(SUBTITULO_PADRAO);
  const [step, setStep] = useState<1 | 2>(1);
  const [completarMode, setCompletarMode] = useState<CompletarMode>("none");

  const [email, setEmail] = useState("");
  const [crm, setCrm] = useState("");
  const [uf, setUf] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formInView, setFormInView] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [cookieBannerOpen, setCookieBannerOpen] = useState(false);

  const formSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    captureUtm();
    const params = new URLSearchParams(window.location.search);
    const utmContent = (params.get("utm_content") ?? getUtm()["utm_content"] ?? "").trim();
    if (utmContent && SUBTITULOS_POR_CONTEUDO[utmContent]) {
      setSubtitle(SUBTITULOS_POR_CONTEUDO[utmContent]);
    }
    trackMeta("ViewContent");
  }, []);

  useEffect(() => {
    setCookieBannerOpen(isCookieBannerOpen() || (trackingEnabled() && getConsent() === null));
    return subscribeCookieBanner(setCookieBannerOpen);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("completar") !== "1") return;

    const client = getSupabase();
    if (!client) return;

    let active = true;
    setCompletarMode("checking");

    const handleSession = (session: { user: { user_metadata?: Record<string, unknown> } }) => {
      if (!active) return;
      const existingCrm =
        typeof session.user.user_metadata?.["crm"] === "string"
          ? session.user.user_metadata["crm"].trim()
          : "";
      if (existingCrm) {
        clearRedirectUtm();
        void navigate({ to: "/mapa", replace: true });
        return;
      }
      setCompletarMode("crm");
    };

    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;

    void client.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) {
        handleSession(data.session);
        return;
      }
      const hasOAuthReturn = params.has("code") || window.location.hash.includes("access_token");
      if (!hasOAuthReturn) {
        setCompletarMode("none");
      } else {
        fallbackTimer = setTimeout(() => {
          if (active) setCompletarMode("none");
        }, 5000);
      }
    });

    const { data: sub } = client.auth.onAuthStateChange((_event, session) => {
      if (session) {
        if (fallbackTimer) clearTimeout(fallbackTimer);
        handleSession(session);
      }
    });

    return () => {
      active = false;
      if (fallbackTimer) clearTimeout(fallbackTimer);
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (typeof window === "undefined" || completarMode !== "none") return;

    const onScroll = () => {
      setHasScrolled(window.scrollY > 80);
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      const pct = (window.scrollY / maxScroll) * 100;
      if (pct >= 50) registrarEvento("scroll_50");
      if (pct >= 90) registrarEvento("scroll_90");
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [completarMode]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return;
    if (completarMode !== "none" || !formSectionRef.current) return;

    const formObserver = new IntersectionObserver(
      (entries) => {
        setFormInView(entries.some((entry) => entry.isIntersecting));
      },
      { threshold: 0.25 },
    );
    formObserver.observe(formSectionRef.current);

    return () => {
      formObserver.disconnect();
    };
  }, [completarMode]);

  function clearFieldError(field: keyof FormErrors) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  function handleFormFocus(e: React.FocusEvent<HTMLFormElement>) {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
      registrarEvento("form_inicio");
    }
  }

  function scrollToCadastro(eventName: "cta_topo" | "cta_fixo") {
    registrarEvento(eventName);
    formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleGoogle() {
    const client = getSupabase();
    if (!client) {
      toast.error("Cadastro indisponível no momento. Tente novamente em alguns minutos.");
      return;
    }
    registrarEvento("google_clique");
    persistUtmForRedirect();
    setGoogleLoading(true);
    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/medicos?completar=1`,
        },
      });
      if (error) {
        const detail =
          error && typeof error === "object" && "message" in error
            ? String((error as { message: unknown }).message)
            : "";
        toast.error(
          detail.toLowerCase().includes("provider is not enabled")
            ? "Google ainda não está ativo neste projeto. Use e-mail e CRM abaixo."
            : detail || "Não foi possível continuar com Google. Tente com e-mail abaixo.",
        );
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  function handleStep1Submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nextErrors: FormErrors = {};
    const trimmedEmail = email.trim();

    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      nextErrors.email = "Informe um e-mail válido.";
      registrarEvento("form_erro_email");
    }

    const ufValid = isValidCrmUf(uf);
    if (!ufValid) {
      nextErrors.uf = "Selecione a UF.";
      registrarEvento("form_erro_uf");
    }

    const crmCheck = validateCrm(crm, ufValid ? uf : "SP");
    if (!crmCheck.ok || !crmCheck.digits) {
      nextErrors.crm = crmCheck.error ?? "CRM inválido.";
      registrarEvento("form_erro_crm");
    }

    if (nextErrors.email || nextErrors.crm || nextErrors.uf) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    registrarEvento("form_passo2");
    setStep(2);
  }

  async function handleStep2Submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nextErrors: FormErrors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (trimmedName.length < 3) {
      nextErrors.name = "Informe o nome completo.";
    }
    if (password.length < 8) {
      nextErrors.password = "A senha precisa ter pelo menos 8 caracteres.";
      registrarEvento("form_erro_senha");
    }
    if (!consent) {
      nextErrors.consent = "Confirme que você é médico(a) e aceita os termos.";
      registrarEvento("form_erro_aceite");
    }

    if (nextErrors.name || nextErrors.password || nextErrors.consent) {
      setErrors(nextErrors);
      return;
    }

    const crmCheck = validateCrm(crm, uf);
    if (!crmCheck.ok || !crmCheck.digits) {
      setStep(1);
      setErrors({ crm: crmCheck.error ?? "CRM inválido." });
      registrarEvento("form_erro_crm");
      return;
    }

    const client = getSupabase();
    if (!client) {
      toast.error("Cadastro indisponível no momento. Tente novamente em alguns minutos.");
      return;
    }

    setErrors({});
    // Intent qualificado (CRM + termos ok) antes do signUp — sem PII no Pixel.
    registrarEvento("form_envio");
    trackMeta("Lead");

    setLoading(true);
    try {
      const { data, error } = await client.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/mapa`,
          data: {
            full_name: trimmedName,
            crm: crmCheck.digits,
            crm_uf: uf.toUpperCase(),
            specialty: null,
            phone: null,
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

      clearRedirectUtm();
      registrarEvento("cadastro_ok");
      trackMeta("CompleteRegistration");

      if (data.session) {
        toast.success("Conta criada. Vamos mapear suas lacunas.");
        await navigate({ to: "/mapa" });
        return;
      }
      setPendingEmail(trimmedEmail);
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

  async function handleGoogleCrmSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nextErrors: FormErrors = {};

    const ufValid = isValidCrmUf(uf);
    if (!ufValid) {
      nextErrors.uf = "Selecione a UF.";
      registrarEvento("form_erro_uf");
    }

    const crmCheck = validateCrm(crm, ufValid ? uf : "SP");
    if (!crmCheck.ok || !crmCheck.digits) {
      nextErrors.crm = crmCheck.error ?? "CRM inválido.";
      registrarEvento("form_erro_crm");
    }

    if (!consent) {
      nextErrors.consent = "Confirme que você é médico(a) e aceita os termos.";
      registrarEvento("form_erro_aceite");
    }

    if (nextErrors.crm || nextErrors.uf || nextErrors.consent) {
      setErrors(nextErrors);
      return;
    }

    const client = getSupabase();
    if (!client) {
      toast.error("Cadastro indisponível no momento. Tente novamente em alguns minutos.");
      return;
    }

    setErrors({});
    trackMeta("Lead");
    setLoading(true);
    try {
      const { error } = await client.auth.updateUser({
        data: {
          crm: crmCheck.digits,
          crm_uf: uf.toUpperCase(),
          declared_physician: true,
          consent_at: new Date().toISOString(),
          terms_version: LEGAL_VERSIONS.terms,
          privacy_version: LEGAL_VERSIONS.privacy,
          signup_source: "lp_medicos_google",
          ...getUtm(),
        },
      });
      if (error) throw error;

      clearRedirectUtm();
      registrarEvento("google_crm_ok");
      trackMeta("CompleteRegistration");
      toast.success("CRM confirmado. Vamos mapear suas lacunas.");
      await navigate({ to: "/mapa" });
    } catch (err) {
      const raw =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "";
      toast.error(raw || "Não foi possível salvar seu CRM. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const showMobileStickyBar =
    completarMode === "none" && !pendingEmail && hasScrolled && !formInView && !cookieBannerOpen;

  if (completarMode === "checking") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/60">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:h-16 md:px-6">
            <img src="/brand/logo-doutiva.png" alt="Doutiva" className="h-8 w-auto md:h-10" />
          </div>
        </header>
        <main className="mx-auto flex max-w-md flex-col items-center px-5 py-16 text-center">
          <p className="text-sm text-muted-foreground">Confirmando sua conta…</p>
        </main>
      </div>
    );
  }

  if (completarMode === "crm") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/60">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:h-16 md:px-6">
            <img src="/brand/logo-doutiva.png" alt="Doutiva" className="h-8 w-auto md:h-10" />
          </div>
        </header>
        <main className="mx-auto max-w-md px-5 py-10 md:py-16">
          <section className="rounded-sm border border-border/70 bg-card/60 p-6 md:p-8">
            <span className="inline-flex items-center gap-2 rounded-sm border border-gold/40 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-gold">
              <ShieldCheck className="h-3.5 w-3.5" /> Exclusivo para médicos com CRM
            </span>
            <h1 className="mt-4 font-serif text-2xl">Falta só o seu CRM</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Pedimos o CRM só para garantir que a comunidade é formada por médicos. Ele é
              conferido na base pública do CFM.
            </p>

            <form
              onSubmit={handleGoogleCrmSubmit}
              onFocusCapture={handleFormFocus}
              className="mt-5 space-y-4"
              noValidate
            >
              <div className="grid grid-cols-[1fr_96px] gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="google-crm">CRM</Label>
                  <Input
                    id="google-crm"
                    name="crm"
                    inputMode="numeric"
                    autoComplete="off"
                    value={crm}
                    onChange={(e) => {
                      setCrm(e.target.value);
                      clearFieldError("crm");
                    }}
                    aria-invalid={Boolean(errors.crm)}
                    aria-describedby={errors.crm ? "google-crm-error" : undefined}
                    required
                  />
                  {errors.crm && (
                    <p id="google-crm-error" role="alert" className="text-xs text-destructive">
                      {errors.crm}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="google-uf">UF</Label>
                  <select
                    id="google-uf"
                    name="uf"
                    value={uf}
                    onChange={(e) => {
                      setUf(e.target.value);
                      clearFieldError("uf");
                    }}
                    aria-invalid={Boolean(errors.uf)}
                    aria-describedby={errors.uf ? "google-uf-error" : undefined}
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs"
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
                  {errors.uf && (
                    <p id="google-uf-error" role="alert" className="text-xs text-destructive">
                      {errors.uf}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      clearFieldError("consent");
                    }}
                    className="mt-0.5"
                    required
                  />
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
                {errors.consent && (
                  <p role="alert" className="text-xs text-destructive">
                    {errors.consent}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Salvando…" : "Ir para meu diagnóstico"}
              </Button>
            </form>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:h-16 md:px-6">
          <img src="/brand/logo-doutiva.png" alt="Doutiva" className="h-8 w-auto md:h-10" />
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">
            Já tenho conta
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-5 py-7 md:grid-cols-[1fr_420px] md:items-start md:gap-12 md:px-6 md:py-16">
        <section>
          <span className="inline-flex items-center gap-2 rounded-sm border border-gold/40 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-gold">
            <ShieldCheck className="h-3.5 w-3.5" /> Exclusivo para médicos com CRM
          </span>
          <h1 className="mt-4 font-serif text-3xl leading-[1.12] tracking-tight sm:text-4xl md:mt-6 md:text-5xl">
            A escola do médico do futuro
          </h1>
          <p className="mt-2.5 font-serif text-xl leading-snug text-gold md:mt-3 md:text-2xl">
            {subtitle}
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:mt-5 md:text-lg">
            Comece por um diagnóstico gratuito com casos clínicos: em {DURACAO_DIAGNOSTICO} você vê
            o que já domina e o que falta. A partir dele, a IA monta sua trilha.
          </p>
          <a
            href="#cadastro"
            onClick={(e) => {
              e.preventDefault();
              scrollToCadastro("cta_topo");
            }}
            className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto md:hidden"
          >
            Começar grátis
          </a>

          <ul className="mt-8 grid gap-5 md:mt-10 md:gap-6">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3.5 md:gap-4">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ul>

          {MOSTRAR_TELAS && (
            <div className="mt-10 space-y-4">
              <h2 className="font-serif text-2xl">Veja como funciona</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {TELAS_PRODUTO.map((tela) => (
                  <figure
                    key={tela.src}
                    className="overflow-hidden rounded-sm border border-border/70 bg-card/60"
                  >
                    <img
                      src={tela.src}
                      alt={tela.caption}
                      width={tela.width}
                      height={tela.height}
                      loading="lazy"
                      className="h-auto w-full object-cover"
                    />
                    <figcaption className="border-t border-border/60 px-3 py-2 text-xs text-muted-foreground">
                      {tela.caption}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          )}

          <p className="mt-8 max-w-xl text-sm text-muted-foreground">
            Primeira trilha disponível:{" "}
            <span className="text-foreground">Peptídeos na Medicina de Precisão</span> (gratuita,
            sem cartão).
          </p>

          <div className="mt-8 max-w-xl space-y-4">
            {MOSTRAR_CURADORIA && CURADORIA.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-serif text-xl">Quem está por trás</h2>
                <p className="text-xs uppercase tracking-[0.2em] text-gold">Curadoria médica</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {CURADORIA.slice(0, 2).map((curador) => (
                    <div
                      key={`${curador.nome}-${curador.crm}`}
                      className="flex items-center gap-3 rounded-sm border border-border/70 bg-card/60 p-3"
                    >
                      {curador.foto && (
                        <img
                          src={curador.foto}
                          alt={curador.nome}
                          width={48}
                          height={48}
                          loading="lazy"
                          className="h-12 w-12 shrink-0 rounded-full object-cover"
                        />
                      )}
                      <div className="min-w-0 text-xs">
                        <p className="truncate font-medium text-foreground">{curador.nome}</p>
                        <p className="text-muted-foreground">{curador.crm}</p>
                        <p className="truncate text-muted-foreground">{curador.especialidade}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2 border-l border-gold/30 pl-4 text-sm text-muted-foreground">
              <p>Conteúdo baseado em diretrizes e literatura, com referências em cada aula.</p>
              <p>
                Pedimos o CRM só para garantir que a comunidade é formada por médicos. Ele é
                conferido na base pública do CFM.
              </p>
            </div>
          </div>
        </section>

        <section
          id="cadastro"
          ref={formSectionRef}
          className="scroll-mt-6 rounded-sm border border-border/70 bg-card/60 p-6 md:p-8"
        >
          {pendingEmail ? (
            <div className="space-y-4 text-center">
              <h2 className="font-serif text-2xl">Confirme seu e-mail</h2>
              <p className="text-sm text-muted-foreground">
                Enviamos um link para <span className="text-foreground">{pendingEmail}</span>. Abra
                o e-mail e o mapa das suas lacunas abre em seguida.
              </p>
            </div>
          ) : step === 1 ? (
            <form
              onSubmit={handleStep1Submit}
              onFocusCapture={handleFormFocus}
              className="space-y-4"
              noValidate
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-serif text-2xl">Criar minha conta grátis</h2>
                  <span className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Passo 1 de 2
                  </span>
                </div>
                <div className="mt-2.5 grid grid-cols-2 gap-1.5" aria-hidden="true">
                  <span className="h-1 rounded-full bg-gold" />
                  <span className="h-1 rounded-full bg-secondary" />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Leva menos de um minuto.</p>
              </div>

              {GOOGLE_LOGIN_ATIVO && (
                <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogle}
                  disabled={googleLoading}
                  className="w-full gap-2"
                >
                  <GoogleGlyph />
                  {googleLoading ? "Conectando…" : "Continuar com Google"}
                </Button>

                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  ou
                  <span className="h-px flex-1 bg-border" />
                </div>
                </>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError("email");
                  }}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  required
                />
                {errors.email && (
                  <p id="email-error" role="alert" className="text-xs text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-[1fr_96px] gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="crm">CRM</Label>
                  <Input
                    id="crm"
                    name="crm"
                    inputMode="numeric"
                    autoComplete="off"
                    value={crm}
                    onChange={(e) => {
                      setCrm(e.target.value);
                      clearFieldError("crm");
                    }}
                    aria-invalid={Boolean(errors.crm)}
                    aria-describedby={errors.crm ? "crm-error" : undefined}
                    required
                  />
                  {errors.crm && (
                    <p id="crm-error" role="alert" className="text-xs text-destructive">
                      {errors.crm}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="uf">UF</Label>
                  <select
                    id="uf"
                    name="uf"
                    value={uf}
                    onChange={(e) => {
                      setUf(e.target.value);
                      clearFieldError("uf");
                    }}
                    aria-invalid={Boolean(errors.uf)}
                    aria-describedby={errors.uf ? "uf-error" : undefined}
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs"
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
                  {errors.uf && (
                    <p id="uf-error" role="alert" className="text-xs text-destructive">
                      {errors.uf}
                    </p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full">
                Continuar
              </Button>
            </form>
          ) : (
            <form
              onSubmit={handleStep2Submit}
              onFocusCapture={handleFormFocus}
              className="space-y-4"
              noValidate
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-serif text-2xl">Finalizar cadastro</h2>
                  <span className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Passo 2 de 2
                  </span>
                </div>
                <div className="mt-2.5 grid grid-cols-2 gap-1.5" aria-hidden="true">
                  <span className="h-1 rounded-full bg-gold" />
                  <span className="h-1 rounded-full bg-gold" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {email.trim()} · CRM {crm.replace(/\D/g, "")}/{uf.toUpperCase()}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearFieldError("name");
                  }}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  required
                />
                {errors.name && (
                  <p id="name-error" role="alert" className="text-xs text-destructive">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Crie uma senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={8}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearFieldError("password");
                    }}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" role="alert" className="text-xs text-destructive">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      clearFieldError("consent");
                    }}
                    className="mt-0.5"
                    required
                  />
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
                {errors.consent && (
                  <p role="alert" className="text-xs text-destructive">
                    {errors.consent}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Criando sua conta…" : "Criar minha conta grátis"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setErrors({});
                    setStep(1);
                  }}
                  className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  voltar
                </button>
              </div>
            </form>
          )}
        </section>
      </main>

      <footer className="border-t border-border/60 pb-20 md:pb-0">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-4 px-5 py-6 text-xs text-muted-foreground md:px-6">
          <span>Doutiva · Conteúdo educacional para médicos</span>
          <Link to="/termos" className="hover:text-foreground">
            Termos
          </Link>
          <Link to="/privacidade" className="hover:text-foreground">
            Privacidade
          </Link>
        </div>
      </footer>

      {showMobileStickyBar && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-background/95 px-4 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden">
          <Button
            type="button"
            className="h-11 w-full"
            onClick={() => scrollToCadastro("cta_fixo")}
          >
            Começar grátis
          </Button>
        </div>
      )}
    </div>
  );
}
