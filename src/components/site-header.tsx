import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-sm border border-gold/40 text-gold font-serif text-lg">D</span>
          <span className="font-serif text-lg tracking-[0.3em]">
            DOUTIVA
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="/#medicos" className="flex items-center gap-2 transition hover:text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Para alunos
          </a>
          <a href="/#experts" className="flex items-center gap-2 transition hover:text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" /> Para mentores
          </a>
          <a href="/#jornada" className="transition hover:text-foreground">Como funciona</a>
          <a href="/#ambientes" className="transition hover:text-foreground">O campus</a>
        </nav>
        <div className="flex items-center gap-2">
          {signedIn ? (
            <Button asChild variant="outline" size="sm" className="border-gold/40 text-foreground hover:bg-gold/10">
              <Link to="/dashboard">Meu campus</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Link to="/auth">Entrar</Link>
              </Button>
              <Button asChild size="sm" className="bg-gold text-primary-foreground hover:bg-gold-soft">
                <Link to="/auth" search={{ mode: "signup" } as never}>Quero estudar</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}