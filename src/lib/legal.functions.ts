import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { LEGAL_VERSIONS } from "@/lib/legal-versions";

export { LEGAL_VERSIONS };

export const acceptLegal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { doc: "terms" | "privacy" | "ai_policy" }) =>
    z.object({ doc: z.enum(["terms", "privacy", "ai_policy"]) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const version = LEGAL_VERSIONS[data.doc];
    const { error } = await context.supabase
      .from("legal_acceptances")
      .upsert(
        { user_id: context.userId, doc: data.doc, version, accepted_at: new Date().toISOString() },
        { onConflict: "user_id,doc,version" },
      );
    if (error) throw new Error(error.message);
    return { ok: true, version };
  });

export const myLegalAcceptances = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("legal_acceptances")
      .select("doc, version, accepted_at")
      .eq("user_id", context.userId);
    return data ?? [];
  });
