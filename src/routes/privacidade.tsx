import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LEGAL_VERSIONS } from "@/lib/legal-versions";

export const Route = createFileRoute("/privacidade")({
  head: () => ({ meta: [{ title: "Privacidade (LGPD) — Doutiva" }] }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-6 py-16 prose prose-invert">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Documento v{LEGAL_VERSIONS.privacy}
        </p>
        <h1 className="font-serif text-4xl">Privacidade e LGPD</h1>
        <p className="text-muted-foreground">
          Política-base alinhada à LGPD. Contatos de DPO e bases legais finais dependem de revisão
          jurídica.
        </p>
        <h2>Dados tratados</h2>
        <ul>
          <li>Identificação e autenticação (e-mail, nome)</li>
          <li>Credenciais profissionais (CRM/RQE) quando fornecidas</li>
          <li>Progresso educacional (XP, créditos, respostas de casos)</li>
          <li>Interações com Tutores/Professores de IA</li>
        </ul>
        <h2>Finalidades</h2>
        <p>
          Prestar o serviço educacional, personalizar revisão espaçada, segurança, suporte e
          cumprimento legal.
        </p>
        <h2>Direitos do titular</h2>
        <p>
          Acesso, correção, portabilidade, eliminação e oposição podem ser solicitados pelo e-mail
          de suporte da conta.
        </p>
        <h2>Operadores</h2>
        <p>
          Infraestrutura: Supabase (dados/auth). IA: OpenAI (quando configurada). E-mail: Resend
          (quando configurado).
        </p>
        <p>
          <Link to="/termos">Termos</Link> · <Link to="/politica-ia">Política de IA</Link>
        </p>
      </article>
      <SiteFooter />
    </div>
  );
}
