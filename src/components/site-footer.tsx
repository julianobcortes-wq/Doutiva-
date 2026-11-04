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
            A escola do médico do futuro. Biotecnologia, ciência e performance para médicos que
            querem liderar a próxima medicina — na prática clínica e na carreira.
          </p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Campus</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li>Universidade Doutiva</li>
            <li>Praça Central</li>
            <li>Médicos Mentores</li>
            <li>Tecnologia</li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">A Doutiva</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li>Médicos Alunos</li>
            <li>Médicos Mentores</li>
            <li>Eventos</li>
            <li>Contato</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} Doutiva. Todos os direitos reservados.</span>
          <span className="tracking-[0.2em] uppercase">Biotecnologia · Ciência · Performance</span>
        </div>
      </div>
    </footer>
  );
}