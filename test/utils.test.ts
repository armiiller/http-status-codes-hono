import { describe, expect, it } from "vitest";
import { clamp } from "../src/utils";

describe("clamp", () => {
  it("returns the value unchanged when within range", () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });

  it("clamps to the minimum", () => {
    expect(clamp(-10, 0, 100)).toBe(0);
  });

  it("clamps to the maximum", () => {
    expect(clamp(9999, 0, 5000)).toBe(5000);
  });

  it("handles the exact boundaries", () => {
    expect(clamp(0, 0, 5000)).toBe(0);
    expect(clamp(5000, 0, 5000)).toBe(5000);
  });
});
