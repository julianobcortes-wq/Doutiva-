import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getMastery, getTopics, nextSessionTopics } from "@/lib/brain/brain.server";
import type { MasteryMap, MasteryRow, ClinicalTopic } from "@/lib/brain/types";

export const getClinicalTopics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ClinicalTopic[]> => {
    return getTopics(context.supabase as never);
  });

export const getMyMasteryMap = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MasteryMap> => {
    return getMastery(context.supabase as never, context.userId);
  });

export const getNextBrainTopics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MasteryRow[]> => {
    return nextSessionTopics(context.supabase as never, context.userId, 3);
  });
