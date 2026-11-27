import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { studioMe } from "@/lib/studio.functions";

export const studioMeQuery = { queryKey: ["studio-me"], queryFn: () => studioMe() };

export function StudioGate({ children }: { children: ReactNode }) {
  const { data, isLoading } = useQuery(studioMeQuery);

  if (isLoading || !data)
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center text-sm text-muted-foreground">
        Carregando Estúdio…
      </div>
    );
  if (data.isAdmin) return <>{children}</>;

  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <ShieldCheck className="mx-auto h-8 w-8 text-gold" />
      <h1 className="mt-4 text-3xl font-extralight">Estúdio de Cursos</h1>
      <p className="mt-3 text-sm font-light text-muted-foreground">
        O Estúdio é restrito ao corpo docente Doutiva. Peça acesso ao administrador.
      </p>
    </div>
  );
}
