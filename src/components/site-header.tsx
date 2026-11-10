import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { getSupabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { to: "/cursos", label: "Cursos", kind: "link" as const },
  { to: "/oferta", label: "Planos", kind: "link" as const },
  { to: "/evento", label: "Evento", kind: "anchor" as const },
  { to: "/mentores", label: "Mentoria", kind: "link" as const },
  { to: "/parceiros", label: "Parceiros", kind: "link" as const },
];

export function SiteHeader() {
  const [signedIn, setSignedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const client = getSupabase();
    if (!client) return;

    let active = true;
    client.auth.getSession().then(({ data }) => {
      if (active) setSignedIn(!!data.session);
    });
    const { data: sub } = client.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-6">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-sm border border-gold/40 font-serif text-lg text-gold">
            D
          </span>
          <span className="font-serif text-lg tracking-[0.3em]">DOUTIVA</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          {NAV_LINKS.map((item) =>
            item.kind === "anchor" ? (
              <a key={item.to} href={item.to} className="transition hover:text-foreground">
                {item.label}
              </a>
            ) : (
              <Link key={item.to} to={item.to} className="transition hover:text-foreground">
                {item.label}
              </Link>
            ),
          )}
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
                className="hidden text-muted-foreground hover:text-foreground sm:inline-flex"
              >
                <Link to="/auth">Entrar</Link>
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

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 w-9 px-0 text-foreground md:hidden"
                aria-label="Abrir menu de navegação"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(20rem,88vw)] border-border/60 bg-background p-0">
              <SheetHeader className="border-b border-border/60 px-6 py-5 text-left">
                <SheetTitle className="font-serif text-base tracking-[0.3em]">DOUTIVA</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-3 py-4">
                {NAV_LINKS.map((item) => {
                  const className =
                    "rounded-sm px-3 py-3 text-base text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground";
                  return item.kind === "anchor" ? (
                    <SheetClose asChild key={item.to}>
                      <a href={item.to} className={className}>
                        {item.label}
                      </a>
                    </SheetClose>
                  ) : (
                    <SheetClose asChild key={item.to}>
                      <Link to={item.to} className={className}>
                        {item.label}
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>
              {!signedIn ? (
                <div className="mt-auto border-t border-border/60 px-6 py-5 sm:hidden">
                  <SheetClose asChild>
                    <Button asChild variant="outline" className="w-full rounded-sm">
                      <Link to="/auth">Entrar</Link>
                    </Button>
                  </SheetClose>
                </div>
              ) : null}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
