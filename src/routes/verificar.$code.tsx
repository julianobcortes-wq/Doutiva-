import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const verify = createServerFn({ method: "GET" })
  .inputValidator((d: { code: string }) => z.object({ code: z.string().min(4).max(20) }).parse(d))
  .handler(async ({ data }) => {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const sb = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      } },
    });
    const { data: rows } = await sb.rpc("verify_certificate", { _code: data.code });
    return rows?.[0] ?? null;
  });

export const Route = createFileRoute("/verificar/$code")({
  loader: ({ params }) => verify({ data: { code: params.code } }),
  head: ({ params }) => ({
    meta: [
      { title: `Verificação de certificado ${params.code} — Doutiva` },
      { name: "description", content: "Confira a autenticidade de um certificado emitido pela Doutiva." },
      { property: "og:title", content: "Verificação de certificado — Doutiva" },
      { property: "og:description", content: "Confira a autenticidade de um certificado emitido pela Doutiva." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const cert = Route.useLoaderData();
  const { code } = Route.useParams();
  const url = typeof window !== "undefined" ? window.location.href : "";
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-10 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Doutiva · Certificado</p>
        {cert ? (
          <>
            <p className="mt-6 text-sm text-muted-foreground">Certificamos que</p>
            <h1 className="mt-2 text-3xl font-light">{cert.holder_name}</h1>
            <p className="mt-4 text-sm text-muted-foreground">concluiu o curso</p>
            <h2 className="mt-1 text-xl font-light text-primary">{cert.course_title}</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Carga horária {cert.hours} h · emitido em {new Date(cert.issued_at).toLocaleDateString("pt-BR")}
            </p>
            <p className="mt-6 font-mono text-xs text-muted-foreground">Código {code.toUpperCase()} · autêntico</p>
            {url && (
              <img className="mx-auto mt-6 rounded bg-foreground p-2" width={120} height={120} alt="QR de verificação"
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(url)}`} />
            )}
          </>
        ) : (
          <p className="mt-6 text-lg font-light">Nenhum certificado encontrado com o código {code}.</p>
        )}
        <Link to="/" className="mt-8 inline-block text-xs text-muted-foreground underline">doutiva</Link>
      </div>
    </main>
  );
}
