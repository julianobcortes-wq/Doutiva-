import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/certifications")({
  head: () => ({
    meta: [
      { title: "Certificados — Doutiva" },
      { name: "description", content: "Certificados com carga horária e código público de verificação." },
    ],
  }),
  component: CertificationsPage,
});

type Row = { id: string; title: string; total: number; done: number; hours: number; cert?: { code: string; issued_at: string } };

function CertificationsPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const [{ data: courses }, { data: lessons }, { data: prog }, { data: certs }] = await Promise.all([
      supabase.from("courses").select("id, title").eq("published", true),
      supabase.from("lessons").select("id, course_id, duration_minutes").eq("status", "published"),
      supabase.from("lesson_progress").select("lesson_id"),
      supabase.from("certificates").select("course_id, code, issued_at"),
    ]);
    const done = new Set((prog ?? []).map((p) => p.lesson_id));
    setRows(
      (courses ?? []).map((c) => {
        const ls = (lessons ?? []).filter((l) => l.course_id === c.id);
        const cert = (certs ?? []).find((x) => x.course_id === c.id);
        return {
          id: c.id, title: c.title, total: ls.length,
          done: ls.filter((l) => done.has(l.id)).length,
          hours: Math.round(ls.reduce((s, l) => s + (l.duration_minutes ?? 0), 0) / 6) / 10,
          cert: cert ? { code: cert.code, issued_at: cert.issued_at } : undefined,
        };
      }).filter((r) => r.total > 0),
    );
  }
  useEffect(() => { load(); }, []);

  async function issue(id: string) {
    setBusy(id);
    const { data, error } = await supabase.rpc("issue_certificate", { _course_id: id });
    setBusy(null);
    if (error) return toast.error("Não foi possível emitir agora.");
    const r = data as { issued: boolean };
    if (!r.issued) return toast.error("Conclua todas as aulas para emitir.");
    toast.success("Certificado emitido.");
    load();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Certificados</p>
        <h1 className="mt-2 text-3xl font-light">Sua formação, verificável</h1>
        <p className="mt-2 text-sm text-muted-foreground">Conclua todas as aulas de um curso para emitir o certificado com carga horária e código público.</p>
      </header>
      {!rows ? <p className="text-sm text-muted-foreground">Carregando…</p> : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum curso publicado ainda.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((r) => {
            const pct = Math.round((r.done / r.total) * 100);
            const ready = r.done >= r.total;
            return (
              <div key={r.id} className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-start gap-3">
                  {r.cert ? <CheckCircle2 className="h-5 w-5 text-primary" /> : ready ? <Award className="h-5 w-5 text-primary" /> : <Lock className="h-5 w-5 text-muted-foreground" />}
                  <div className="flex-1">
                    <h3 className="font-light">{r.title}</h3>
                    <p className="text-xs text-muted-foreground">{r.hours} h · {r.done}/{r.total} aulas</p>
                  </div>
                </div>
                <div className="mt-4 h-1 rounded bg-muted"><div className="h-1 rounded bg-primary" style={{ width: `${pct}%` }} /></div>
                <div className="mt-4">
                  {r.cert ? (
                    <div className="text-xs">
                      <p className="text-muted-foreground">Código <span className="font-mono text-foreground">{r.cert.code}</span></p>
                      <Link to="/verificar/$code" params={{ code: r.cert.code }} className="text-primary underline">Ver certificado público</Link>
                    </div>
                  ) : (
                    <Button size="sm" disabled={!ready || busy === r.id} onClick={() => issue(r.id)}>
                      {ready ? "Emitir certificado" : `Faltam ${r.total - r.done} aulas`}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
