import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LEGAL_VERSIONS } from "@/lib/legal-versions";

export const Route = createFileRoute("/politica-ia")({
  head: () => ({ meta: [{ title: "Política de uso de IA — Doutiva" }] }),
  component: PoliticaIaPage,
});

function PoliticaIaPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-6 py-16 prose prose-invert">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Documento v{LEGAL_VERSIONS.ai_policy}
        </p>
        <h1 className="font-serif text-4xl">Política de uso de IA</h1>
        <h2>Princípios</h2>
        <ul>
          <li>IA é apoio educacional — não prescrição automática.</li>
          <li>Respostas clínicas devem ser conferidas com fontes e julgamento médico.</li>
          <li>Citações [S#] passam por gate de corpus; baixa fidelidade lexical gera aviso.</li>
          <li>Aulas geradas por IA exigem revisão humana antes de publicação.</li>
        </ul>
        <h2>Dados enviados aos modelos</h2>
        <p>
          Perguntas do Tutor/Professores e trechos de aula/biblioteca podem ser enviados ao provedor
          configurado (OpenAI ou gateway). Evite colar dados identificáveis de pacientes.
        </p>
        <h2>Limitações</h2>
        <p>
          Modelos podem errar doses, datas e referências. A Doutiva remove citações fora do acervo
          recuperado, mas não garante ausência de erro factual.
        </p>
        <p>
          <Link to="/termos">Termos</Link> · <Link to="/privacidade">Privacidade</Link>
        </p>
      </article>
      <SiteFooter />
    </div>
  );
}
