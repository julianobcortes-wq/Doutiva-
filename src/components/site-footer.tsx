import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-sm border border-gold/40 font-serif text-lg text-gold">
              D
            </span>
            <span className="font-serif text-lg tracking-[0.3em]">DOUTIVA</span>
          </div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            Instituto de Medicina e Negócios. Peptídeos livres; Protocolos Online agora; imersão,
            mentoria e clube em breve. 100% independente de farmácia, laboratório e indústria.
          </p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Produto</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/cursos" className="transition hover:text-foreground">
                Cursos
              </Link>
            </li>
            <li>
              <Link to="/oferta" className="transition hover:text-foreground">
                Planos
              </Link>
            </li>
            <li>
              <a href="/evento" className="transition hover:text-foreground">
                Evento
              </a>
            </li>
            <li>
              <Link to="/auth" className="transition hover:text-foreground">
                Começar grátis
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Instituto</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/mentores" className="transition hover:text-foreground">
                Mentoria
              </Link>
            </li>
            <li>
              <Link to="/parceiros" className="transition hover:text-foreground">
                Parceiros
              </Link>
            </li>
            <li>
              <Link to="/termos" className="transition hover:text-foreground">
                Termos
              </Link>
            </li>
            <li>
              <Link to="/privacidade" className="transition hover:text-foreground">
                Privacidade
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} Doutiva. Todos os direitos reservados.</span>
          <span className="uppercase tracking-[0.2em]">Protocolos · Imersão · Mentoria · Clube</span>
        </div>
      </div>
    </footer>
  );
}
