import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LEGAL_VERSIONS } from "@/lib/legal-versions";

export const Route = createFileRoute("/termos")({
  head: () => ({ meta: [{ title: "Termos de uso — Doutiva" }] }),
  component: TermosPage,
});

function TermosPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-6 py-16 prose prose-invert">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Documento v{LEGAL_VERSIONS.terms}
        </p>
        <h1 className="font-serif text-4xl">Termos de uso</h1>
        <p className="text-muted-foreground">
          Rascunho operacional para uso da plataforma Doutiva. Submete-se a revisão jurídica antes
          de vigência comercial.
        </p>
        <h2>1. Objeto</h2>
        <p>
          A Doutiva oferece formação médica continuada, casos clínicos, ferramentas de IA e
          marketplace educacional para profissionais de saúde.
        </p>
        <h2>2. Público</h2>
        <p>
          O conteúdo é destinado a médicos e profissionais de saúde habilitados. Não substitui
          julgamento clínico, bula, diretriz institucional nem relação médico-paciente.
        </p>
        <h2>3. Conta e veracidade</h2>
        <p>
          Você é responsável por credenciais (CRM/RQE quando aplicável) e pelo uso ético das
          informações. Contas podem ser suspensas em caso de fraude ou uso indevido.
        </p>
        <h2>4. Pagamentos</h2>
        <p>
          Planos e preços aparecem em /billing. Cobrança por cartão exige gateway configurado (ex.:
          Stripe). Períodos de cortesia não geram dívida automática.
        </p>
        <h2>5. Propriedade intelectual</h2>
        <p>
          Aulas, monografias e marcas Doutiva são protegidas. É vedada redistribuição sem
          autorização.
        </p>
        <p>
          <Link to="/privacidade">Privacidade</Link> · <Link to="/politica-ia">Política de IA</Link>
        </p>
      </article>
      <SiteFooter />
    </div>
  );
}
