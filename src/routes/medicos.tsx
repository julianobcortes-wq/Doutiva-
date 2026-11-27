import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Flame, Map as MapIcon, Route as RouteIcon, ShieldCheck, Timer } from "lucide-react";
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

function MedicosPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [subtitle, setSubtitle] = useState(SUBTITULO_PADRAO);

  useEffect(() => {
    captureUtm();
    const params = new URLSearchParams(window.location.search);
    const utmContent = (params.get("utm_content") ?? getUtm()["utm_content"] ?? "").trim();
    if (utmContent && SUBTITULOS_POR_CONTEUDO[utmContent]) {
      setSubtitle(SUBTITULOS_POR_CONTEUDO[utmContent]);
    }
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

    // Intent qualificado (CRM + termos ok) antes do signUp — sem PII no Pixel.
    trackMeta("Lead");

    setLoading(true);
    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/mapa`,
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
        toast.success("Conta criada. Vamos mapear suas lacunas.");
        await navigate({ to: "/mapa" });
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
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <h2 className="font-serif text-2xl">Criar minha conta grátis</h2>
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
                {loading ? "Criando sua conta…" : "Começar grátis"}
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
