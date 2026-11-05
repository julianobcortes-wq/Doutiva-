import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-sm border border-gold/40 text-gold font-serif text-lg">D</span>
            <span className="font-serif text-lg tracking-[0.3em]">DOUTIVA</span>
          </div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            Instituto de Medicina e Negócios. Protocolos, imersões e mentoria para médicos — 100%
            independente de farmácia, laboratório e indústria.
          </p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Campus</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="/#ambientes" className="transition hover:text-foreground">
                O campus
              </a>
            </li>
            <li>
              <a href="/#medicos" className="transition hover:text-foreground">
                Para alunos
              </a>
            </li>
            <li>
              <a href="/#experts" className="transition hover:text-foreground">
                Para mentores
              </a>
            </li>
            <li>
              <Link to="/auth" className="transition hover:text-foreground">
                Entrar
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">A Doutiva</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/eventos" className="transition hover:text-foreground">
                Eventos · A Origem
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
            <li>
              <Link to="/politica-ia" className="transition hover:text-foreground">
                Política de IA
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} Doutiva. Todos os direitos reservados.</span>
          <span className="tracking-[0.2em] uppercase">Medicina · Negócios · Independência</span>
        </div>
      </div>
    </footer>
  );
}