import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getNotificationPrefs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await (context.supabase as any)
      .from("notification_prefs")
      .select("daily_case_email, email, whatsapp_opt_in, whatsapp_e164, updated_at")
      .eq("user_id", context.userId)
      .maybeSingle();
    return (
      data ?? {
        daily_case_email: true,
        email: null,
        whatsapp_opt_in: false,
        whatsapp_e164: null,
        updated_at: null,
      }
    );
  });

export const saveNotificationPrefs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      daily_case_email: boolean;
      email?: string | null;
      whatsapp_opt_in?: boolean;
      whatsapp_e164?: string | null;
    }) =>
      z
        .object({
          daily_case_email: z.boolean(),
          email: z.string().email().nullable().optional(),
          whatsapp_opt_in: z.boolean().optional(),
          whatsapp_e164: z.string().max(20).nullable().optional(),
        })
        .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { error } = await (context.supabase as any).from("notification_prefs").upsert({
      user_id: context.userId,
      daily_case_email: data.daily_case_email,
      email: data.email ?? null,
      whatsapp_opt_in: data.whatsapp_opt_in ?? false,
      whatsapp_e164: data.whatsapp_e164 ?? null,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
