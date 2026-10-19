import { describe, it, expect } from "vitest";
import { badgeFor, PASS, scorePercent } from "@/lib/quiz";

describe("certificate rule", () => {
  it("requires 80% to pass", () => {
    expect(PASS).toBe(80);
    expect(badgeFor(scorePercent(8, 10))).toBe("silver");
    expect(badgeFor(scorePercent(7, 10))).toBe("bronze");
  });
});
