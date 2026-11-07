import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { retrieveCorpus } from "@/lib/brain/librarian.server";
import {
  draftLessonForGap,
  listContentGaps,
  publishGapLesson,
  registerTopicDemand,
} from "@/lib/brain/studio-gap.server";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!data) throw new Error("Apenas admin");
}

export const brainRetrieve = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { query: string }) =>
    z.object({ query: z.string().min(2).max(200) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    return retrieveCorpus(context.supabase as never, data.query, 10);
  });

export const brainRegisterDemand = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { topicId: string; note?: string }) =>
    z.object({ topicId: z.string().uuid(), note: z.string().max(500).optional() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { hasServiceRole } = await import("@/integrations/supabase/publishable.server");
    const client = hasServiceRole()
      ? ((await import("@/integrations/supabase/client.server")).supabaseAdmin as any)
      : context.supabase;
    return registerTopicDemand(client, data.topicId, data.note);
  });

export const brainListGaps = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    return listContentGaps(context.supabase as never);
  });

export const brainDraftGap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { gapId: string }) => z.object({ gapId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { hasServiceRole } = await import("@/integrations/supabase/publishable.server");
    const client = hasServiceRole()
      ? ((await import("@/integrations/supabase/client.server")).supabaseAdmin as any)
      : context.supabase;
    return draftLessonForGap(client, data.gapId, { generatedBy: context.userId });
  });

export const brainPublishGap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { gapId: string; reviewerName: string }) =>
    z.object({ gapId: z.string().uuid(), reviewerName: z.string().min(2).max(120) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { hasServiceRole } = await import("@/integrations/supabase/publishable.server");
    const client = hasServiceRole()
      ? ((await import("@/integrations/supabase/client.server")).supabaseAdmin as any)
      : context.supabase;
    return publishGapLesson(client, data.gapId, data.reviewerName);
  });
