import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type Entitlement = {
  id: string;
  kind: string;
  title: string;
  payload: Record<string, unknown>;
  status: string;
  expires_at: string | null;
  created_at: string;
};

export const listEntitlements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("entitlements")
      .select("id, kind, title, payload, status, expires_at, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return (data ?? []) as Entitlement[];
  });

export const getProtocolDocument = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ context, data }) => {
    const { data: entitled } = await context.supabase
      .from("entitlements")
      .select("id, payload, status, expires_at")
      .eq("status", "active")
      .limit(50);
    const ok = (entitled ?? []).some((e) => {
      const slug = (e.payload as { document_slug?: string } | null)?.document_slug;
      const expired = e.expires_at && new Date(e.expires_at).getTime() < Date.now();
      return !expired && slug === data.slug;
    });
    if (!ok && !(await isAdmin(context)))
      throw new Error("Resgate o protocolo no Marketplace para acessar.");
    const { data: doc, error } = await context.supabase
      .from("protocol_documents")
      .select("slug, title, body_markdown")
      .eq("slug", data.slug)
      .eq("active", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!doc) throw new Error("Documento não encontrado.");
    return doc as { slug: string; title: string; body_markdown: string };
  });

async function isAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  return !!data;
}
