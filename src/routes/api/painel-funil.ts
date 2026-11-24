import { createFileRoute } from "@tanstack/react-router";
import { MKT_HUB_PUBLISHABLE_KEY, MKT_HUB_URL } from "@/lib/mkt-hub";

/**
 * Funil da plataforma para o painel de marketing: só contagens, nunca dados pessoais.
 * Agrupa cadastros por dia e origem (UTMs gravadas no cadastro) e conta quantos
 * fizeram o mapa de lacunas, começaram aula, fizeram caso diário e assinaram.
 * Exige a chave do painel no cabeçalho x-painel-chave, conferida no hub de marketing.
 */

type Linha = {
  dia: string;
  origem: string;
  meio: string;
  campanha: string;
  conteudo: string;
  cadastros: number;
  mapa: number;
  aula: number;
  caso: number;
  assinou: number;
};

const DIA = /^\d{4}-\d{2}-\d{2}$/;

function diaBrasilia(iso: string): string {
  const t = new Date(iso).getTime() - 3 * 60 * 60 * 1000;
  return new Date(t).toISOString().slice(0, 10);
}

async function chaveValida(chave: string): Promise<boolean> {
  if (!chave || chave.length > 200) return false;
  try {
    const res = await fetch(`${MKT_HUB_URL}/rest/v1/rpc/mkt_chave_ok`, {
      method: "POST",
      headers: { apikey: MKT_HUB_PUBLISHABLE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ p_chave: chave }),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok && (await res.json()) === true;
  } catch {
    return false;
  }
}

function texto(v: unknown, max = 120): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export const Route = createFileRoute("/api/painel-funil")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const semCache = { "Cache-Control": "no-store" };
        const url = new URL(request.url);
        const inicio = url.searchParams.get("inicio") ?? "";
        const fim = url.searchParams.get("fim") ?? "";
        if (!DIA.test(inicio) || !DIA.test(fim) || fim < inicio) {
          return Response.json({ error: "periodo invalido" }, { status: 400, headers: semCache });
        }
        if (!(await chaveValida(request.headers.get("x-painel-chave") ?? ""))) {
          return Response.json({ error: "chave invalida" }, { status: 401, headers: semCache });
        }

        // Usa o banco de produção (o mesmo do login), ignorando um SUPABASE_URL antigo que ainda exista no Vercel.
        const { createClient } = await import("@supabase/supabase-js");
        const { getSupabaseServerUrl } = await import("@/integrations/supabase/env.server");
        const urlBanco = getSupabaseServerUrl();
        const chaveServico = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
        const tipoChave = chaveServico.startsWith("sb_secret_") ? "sb_secret" : chaveServico.startsWith("eyJ") ? "jwt" : chaveServico ? "outro" : "ausente";
        const diag = { banco: (() => { try { return new URL(urlBanco).hostname.split(".")[0]; } catch { return null; } })(), chave: tipoChave };
        if (!chaveServico) {
          return Response.json({ error: "falha ao ler cadastros", ...diag }, { status: 502, headers: semCache });
        }
        const supabaseAdmin = createClient(urlBanco, chaveServico, {
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
        });
        // Algumas tabelas do funil (ex.: user_subscriptions) não estão nos tipos gerados.
        type Consulta = PromiseLike<{ data: { user_id: string }[] | null }> & {
          in: (coluna: string, valores: string[]) => Consulta;
        };
        const db = supabaseAdmin as unknown as {
          from: (tabela: string) => { select: (colunas: string) => Consulta };
        };

        // Contas da equipe (qualquer papel em user_roles) ficam fora das contagens.
        const { data: papeis } = await db.from("user_roles").select("user_id");
        const equipe = new Set((papeis ?? []).map((p) => p.user_id));

        const usuarios: { id: string; created_at: string; meta: Record<string, unknown> }[] = [];
        for (let page = 1; page <= 50; page++) {
          const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
          if (error) {
            return Response.json(
              { error: "falha ao ler cadastros", detalhe: String(error.message).slice(0, 160), status: (error as { status?: number }).status ?? null, ...diag },
              { status: 502, headers: semCache },
            );
          }
          for (const u of data.users) {
            if (equipe.has(u.id)) continue;
            usuarios.push({ id: u.id, created_at: u.created_at, meta: (u.user_metadata ?? {}) as Record<string, unknown> });
          }
          if (data.users.length < 1000) break;
        }

        const ids = usuarios.map((u) => u.id);
        const comMapa = new Set<string>();
        const comAula = new Set<string>();
        const comCaso = new Set<string>();
        const assinantes = new Set<string>();
        const lotes: string[][] = [];
        for (let i = 0; i < ids.length; i += 500) lotes.push(ids.slice(i, i + 500));
        for (const lote of lotes) {
          const [m1, m2, a, c, s] = await Promise.all([
            db.from("mastery_by_topic").select("user_id").in("user_id", lote),
            db.from("brain_sessions").select("user_id").in("user_id", lote),
            db.from("lesson_progress").select("user_id").in("user_id", lote),
            db.from("daily_case_attempts").select("user_id").in("user_id", lote),
            db.from("user_subscriptions").select("user_id").in("user_id", lote).in("status", ["active", "trialing"]),
          ]);
          for (const r of m1.data ?? []) comMapa.add(r.user_id);
          for (const r of m2.data ?? []) comMapa.add(r.user_id);
          for (const r of a.data ?? []) comAula.add(r.user_id);
          for (const r of c.data ?? []) comCaso.add(r.user_id);
          for (const r of s.data ?? []) assinantes.add(r.user_id);
        }

        const grupos = new Map<string, Linha>();
        const base = { cadastros: 0, mapa: 0, aula: 0, caso: 0, assinou: 0 };
        for (const u of usuarios) {
          const flags = {
            mapa: comMapa.has(u.id) ? 1 : 0,
            aula: comAula.has(u.id) ? 1 : 0,
            caso: comCaso.has(u.id) ? 1 : 0,
            assinou: assinantes.has(u.id) ? 1 : 0,
          };
          base.cadastros += 1;
          base.mapa += flags.mapa;
          base.aula += flags.aula;
          base.caso += flags.caso;
          base.assinou += flags.assinou;

          const dia = diaBrasilia(u.created_at);
          if (dia < inicio || dia > fim) continue;
          const linha = {
            dia,
            origem: texto(u.meta["utm_source"], 80).toLowerCase(),
            meio: texto(u.meta["utm_medium"], 80).toLowerCase(),
            campanha: texto(u.meta["utm_campaign"]),
            conteudo: texto(u.meta["utm_content"]),
          };
          const chave = [linha.dia, linha.origem, linha.meio, linha.campanha, linha.conteudo].join("|");
          const g = grupos.get(chave) ?? { ...linha, cadastros: 0, mapa: 0, aula: 0, caso: 0, assinou: 0 };
          g.cadastros += 1;
          g.mapa += flags.mapa;
          g.aula += flags.aula;
          g.caso += flags.caso;
          g.assinou += flags.assinou;
          grupos.set(chave, g);
        }

        return Response.json(
          { linhas: [...grupos.values()], base_total: base, lido_em: new Date().toISOString() },
          { headers: semCache },
        );
      },
    },
  },
});
