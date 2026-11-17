/**
 * Faculty access is normally `has_role('admin')` in Postgres.
 * Permanent QA accounts can be allowlisted here when service-role
 * grants are unavailable (e.g. after a Supabase project restore).
 */
export const PERMANENT_TEST_FACULTY_EMAILS = new Set([
  "professor.teste@doutiva.com",
]);

export function isPermanentTestFaculty(email: string | null | undefined): boolean {
  if (!email) return false;
  return PERMANENT_TEST_FACULTY_EMAILS.has(email.trim().toLowerCase());
}

type FacultyContext = {
  supabase: { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown }> };
  userId: string;
  claims?: { email?: string | null; [key: string]: unknown };
  email?: string | null;
};

export async function resolveIsAdmin(context: FacultyContext): Promise<boolean> {
  const email =
    context.email ??
    (typeof context.claims?.email === "string" ? context.claims.email : null);
  if (isPermanentTestFaculty(email)) return true;
  try {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return !!data;
  } catch {
    return false;
  }
}
