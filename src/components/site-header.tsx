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
          <span className="grid h-8 w-8 place-items-center rounded-sm border border-gold/40 font-serif text-lg text-gold">
            D
          </span>
          <span className="font-serif text-lg tracking-[0.3em]">DOUTIVA</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <Link to="/oferta" className="transition hover:text-foreground">
            Protocolos
          </Link>
          <a href="/origem/" className="transition hover:text-foreground">
            A Origem
          </a>
          <Link to="/mentores" className="transition hover:text-foreground">
            Mentores
          </Link>
          <Link to="/parceiros" className="transition hover:text-foreground">
            Parceiros
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {signedIn ? (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-gold/40 text-foreground hover:bg-gold/10"
            >
              <Link to="/dashboard">Meu campus</Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Link to="/auth">Entrar</Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="rounded-sm border-border/60"
              >
                <a href="/origem/">A Origem</a>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-gold text-primary-foreground hover:bg-gold-soft"
              >
                <Link to="/auth" search={{ mode: "signup" } as never}>
                  Começar grátis
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
