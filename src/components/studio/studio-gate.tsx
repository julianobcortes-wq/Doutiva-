import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { studioClaimAdmin, studioMe } from "@/lib/studio.functions";
import { toast } from "sonner";

export const studioMeQuery = { queryKey: ["studio-me"], queryFn: () => studioMe() };

export function StudioGate({ children }: { children: ReactNode }) {
  const { data, isLoading } = useQuery(studioMeQuery);
  const claim = useServerFn(studioClaimAdmin);
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  if (isLoading || !data) return <div className="mx-auto max-w-3xl px-6 py-24 text-center text-sm text-muted-foreground">Carregando Estúdio…</div>;
  if (data.isAdmin) return <>{children}</>;

  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <ShieldCheck className="mx-auto h-8 w-8 text-gold" />
      <h1 className="mt-4 text-3xl font-extralight">Estúdio de Cursos</h1>
      {!data.adminExists ? (
        <>
          <p className="mt-3 text-sm font-light text-muted-foreground">Nenhum responsável foi definido ainda. A primeira conta pessoal que ativar o Estúdio se torna a administradora da Doutiva. A conta de convidado não pode fazer isso.</p>
          <Button disabled={busy} className="mt-6 rounded-sm bg-gold text-primary-foreground hover:bg-gold-soft" onClick={async () => {
            setBusy(true);
            try {
              const r = await claim();
              if (r.ok) { toast.success("Você agora é administrador da Doutiva."); await qc.invalidateQueries({ queryKey: ["studio-me"] }); }
              else toast.error("Não foi possível ativar com esta conta. Entre com sua conta pessoal (não a de convidado).");
            } finally { setBusy(false); }
          }}>Ativar como administrador</Button>
        </>
      ) : (
        <p className="mt-3 text-sm font-light text-muted-foreground">O Estúdio é restrito ao corpo docente Doutiva. Peça acesso ao administrador.</p>
      )}
    </div>
  );
}
