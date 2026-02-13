import { describe, it, expect } from "vitest";
import { getFormationPositions } from "../formations";

describe("getFormationPositions", () => {
  it("returns 11 positions for 4-4-2", () => {
    const positions = getFormationPositions("4-4-2");
    expect(positions).toHaveLength(11);
  });

  it("returns 11 positions for 4-2-3-1", () => {
    const positions = getFormationPositions("4-2-3-1");
    expect(positions).toHaveLength(11);
  });

  it("returns 11 positions for 3-4-2-1", () => {
    const positions = getFormationPositions("3-4-2-1");
    expect(positions).toHaveLength(11);
  });

  it("GK is at the top of the pitch", () => {
    const positions = getFormationPositions("4-3-3");
    expect(positions[0].top).toBeLessThan(10);
    expect(positions[0].left).toBe(50);
  });

  it("all positions are within bounds", () => {
    const formations = ["4-4-2", "4-3-3", "4-2-3-1", "3-5-2", "5-3-2", "4-1-2-1-2"];
    for (const f of formations) {
      const positions = getFormationPositions(f);
      for (const pos of positions) {
        expect(pos.top).toBeGreaterThanOrEqual(0);
        expect(pos.top).toBeLessThanOrEqual(100);
        expect(pos.left).toBeGreaterThanOrEqual(10);
        expect(pos.left).toBeLessThanOrEqual(90);
      }
    }
  });

  it("handles unknown formations by parsing the string", () => {
    const positions = getFormationPositions("4-2-2-2");
    expect(positions).toHaveLength(11);
  });
});
