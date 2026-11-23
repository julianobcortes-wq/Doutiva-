import { describe, expect, it } from "vitest";
import {
  DEFAULT_CLINICAL_TOPICS,
  isMissingRelationError,
  parseMetaMastery,
} from "@/lib/brain/catalog";

describe("brain catalog fallback", () => {
  it("ships 8 stable clinical topics", () => {
    expect(DEFAULT_CLINICAL_TOPICS).toHaveLength(8);
    const ids = new Set(DEFAULT_CLINICAL_TOPICS.map((t) => t.id));
    const slugs = new Set(DEFAULT_CLINICAL_TOPICS.map((t) => t.slug));
    expect(ids.size).toBe(8);
    expect(slugs.size).toBe(8);
    for (const t of DEFAULT_CLINICAL_TOPICS) {
      expect(t.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    }
  });

  it("detects missing-relation errors", () => {
    expect(isMissingRelationError({ code: "PGRST205", message: "Could not find the table" })).toBe(
      true,
    );
    expect(
      isMissingRelationError({ code: "PGRST202", message: "Could not find the function" }),
    ).toBe(true);
    expect(isMissingRelationError({ code: "42501", message: "permission denied" })).toBe(false);
  });

  it("parses mastery metadata blob", () => {
    const blob = parseMetaMastery({
      version: 1,
      rows: {
        "a1000001-d007-4000-8000-000000000001": {
          score: 40,
          band: "red",
          confidence_avg: 0.4,
          attempts: 2,
          last_seen_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      },
    });
    expect(blob.rows["a1000001-d007-4000-8000-000000000001"]?.attempts).toBe(2);
    expect(parseMetaMastery(null).rows).toEqual({});
  });
});
