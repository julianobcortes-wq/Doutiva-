import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BadgeCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/credenciais")({
  head: () => ({
    meta: [
      { title: "Credenciais de Médico Mentor — Doutiva" },
      {
        name: "description",
        content: "Cadastre CRM, RQE e especialidade para atuar como Médico Mentor na Doutiva.",
      },
    ],
  }),
  component: CredentialsPage,
});

const UFS =
  "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ");
const empty = { full_name: "", crm: "", crm_uf: "SP", rqe: "", specialty: "", bio: "" };

function CredentialsPage() {
  const [f, setF] = useState(empty);
  const [verified, setVerified] = useState(false);
  const [exists, setExists] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("pending");
  const [queue, setQueue] = useState<
    Array<{ user_id: string; full_name: string; crm: string; crm_uf: string; status: string }>
  >([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase
      .from("mentor_credentials")
      .select("*")
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setExists(true);
        setVerified(data.verified);
        setStatus((data as { status?: string }).status ?? (data.verified ? "verified" : "pending"));
        setF({
          full_name: data.full_name,
          crm: data.crm,
          crm_uf: data.crm_uf,
          rqe: data.rqe ?? "",
          specialty: data.specialty ?? "",
          bio: data.bio ?? "",
        });
      });
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: admin } = await supabase.rpc("has_role", {
        _user_id: u.user.id,
        _role: "admin",
      });
      setIsAdmin(!!admin);
      if (!admin) return;
      const { data: rows } = await supabase
        .from("mentor_credentials")
        .select("user_id, full_name, crm, crm_uf, status")
        .neq("status", "verified")
        .limit(20);
      setQueue((rows as typeof queue) ?? []);
    })();
  }, []);

  async function save() {
    if (f.full_name.trim().length < 3 || !/^\d{3,8}$/.test(f.crm.trim()))
      return toast.error("Informe nome completo e CRM (somente números).");
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      setBusy(false);
      return;
    }
    const row = {
      ...f,
      crm: f.crm.trim(),
      rqe: f.rqe.trim() || null,
      specialty: f.specialty.trim() || null,
      bio: f.bio.trim() || null,
      user_id: u.user.id,
      updated_at: new Date().toISOString(),
    };
    const { error } = exists
      ? await supabase.from("mentor_credentials").update(row).eq("user_id", u.user.id)
      : await supabase.from("mentor_credentials").insert(row);
    setBusy(false);
    if (error) return toast.error("Não foi possível salvar.");
    setExists(true);
    toast.success("Credenciais enviadas para conferência do conselho editorial.");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Médico Mentor</p>
        <h1 className="mt-2 text-3xl font-light">Suas credenciais</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          O conselho editorial confere CRM e RQE antes de você assinar revisões de aulas.
        </p>
        {exists && (
          <p
            className={`mt-3 inline-flex items-center gap-2 text-sm ${verified ? "text-primary" : "text-muted-foreground"}`}
          >
            <BadgeCheck className="h-4 w-4" />{" "}
            {verified ? "Credenciais verificadas" : "Aguardando conferência"}
          </p>
        )}
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label>Nome completo</Label>
          <Input value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} />
        </div>
        <div>
          <Label>CRM</Label>
          <Input
            inputMode="numeric"
            value={f.crm}
            onChange={(e) => setF({ ...f, crm: e.target.value })}
          />
        </div>
        <div>
          <Label>UF</Label>
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={f.crm_uf}
            onChange={(e) => setF({ ...f, crm_uf: e.target.value })}
          >
            {UFS.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>RQE (opcional)</Label>
          <Input value={f.rqe} onChange={(e) => setF({ ...f, rqe: e.target.value })} />
        </div>
        <div>
          <Label>Especialidade</Label>
          <Input value={f.specialty} onChange={(e) => setF({ ...f, specialty: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <Label>Mini bio</Label>
          <Textarea value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} />
        </div>
      </div>
      <Button disabled={busy} onClick={save}>
        {exists ? "Atualizar credenciais" : "Enviar credenciais"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Status atual: {status}. A verificação usa conferência editorial (CRM/UF); integração com CFM
        fica pronta para plugar quando houver fonte oficial.
      </p>

      {isAdmin && (
        <section className="mt-10 space-y-3 border-t border-border/60 pt-8">
          <h2 className="text-xl font-light">Fila editorial (admin)</h2>
          {queue.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma credencial pendente.</p>
          )}
          {queue.map((q) => (
            <div
              key={q.user_id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-border/60 p-4"
            >
              <div className="text-sm">
                {q.full_name} · CRM {q.crm}/{q.crm_uf} · {q.status}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={async () => {
                    const { data } = await supabase.rpc("verify_mentor_credentials", {
                      _user_id: q.user_id,
                      _approve: true,
                      _notes: "Conferido manualmente",
                    });
                    if ((data as { ok?: boolean })?.ok) {
                      toast.success("Aprovado");
                      setQueue((xs) => xs.filter((x) => x.user_id !== q.user_id));
                    } else toast.error("Falha ao aprovar");
                  }}
                >
                  Aprovar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await supabase.rpc("verify_mentor_credentials", {
                      _user_id: q.user_id,
                      _approve: false,
                      _notes: "Documentação insuficiente",
                    });
                    toast.message("Rejeitado");
                    setQueue((xs) => xs.filter((x) => x.user_id !== q.user_id));
                  }}
                >
                  Rejeitar
                </Button>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
