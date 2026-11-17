import { describe, expect, it } from "vitest";
import { isPermanentTestFaculty, resolveIsAdmin } from "./faculty-access";

describe("faculty-access", () => {
  it("recognizes the permanent professor test email", () => {
    expect(isPermanentTestFaculty("professor.teste@doutiva.com")).toBe(true);
    expect(isPermanentTestFaculty("Professor.Teste@doutiva.com")).toBe(true);
    expect(isPermanentTestFaculty("aluno.teste@doutiva.com")).toBe(false);
  });

  it("grants admin via allowlist without has_role", async () => {
    const ok = await resolveIsAdmin({
      supabase: {
        rpc: async () => {
          throw new Error("should not call rpc for allowlisted faculty");
        },
      },
      userId: "uid",
      email: "professor.teste@doutiva.com",
    });
    expect(ok).toBe(true);
  });

  it("falls back to has_role for normal users", async () => {
    const ok = await resolveIsAdmin({
      supabase: {
        rpc: async () => ({ data: true }),
      },
      userId: "uid",
      email: "aluno.teste@doutiva.com",
    });
    expect(ok).toBe(true);
  });
});
