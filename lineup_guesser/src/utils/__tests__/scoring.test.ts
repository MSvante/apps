import { describe, it, expect } from "vitest";
import { calculateSlotScore, getNextHintCost } from "../scoring";
import type { HintLevel } from "../../types/game";

describe("calculateSlotScore", () => {
  it("gives full points with no hints", () => {
    expect(calculateSlotScore(0 as HintLevel)).toBe(10);
  });

  it("subtracts 2 for one hint", () => {
    expect(calculateSlotScore(1 as HintLevel)).toBe(8);
  });

  it("subtracts 2+3 for two hints", () => {
    expect(calculateSlotScore(2 as HintLevel)).toBe(5);
  });

  it("subtracts 2+3+4 for three hints", () => {
    expect(calculateSlotScore(3 as HintLevel)).toBe(1);
  });

  it("floors at 0 for four hints", () => {
    expect(calculateSlotScore(4 as HintLevel)).toBe(0);
  });
});

describe("getNextHintCost", () => {
  it("returns 2 for first hint", () => {
    expect(getNextHintCost(0 as HintLevel)).toBe(2);
  });

  it("returns 3 for second hint", () => {
    expect(getNextHintCost(1 as HintLevel)).toBe(3);
  });

  it("returns 4 for third hint", () => {
    expect(getNextHintCost(2 as HintLevel)).toBe(4);
  });

  it("returns 5 for fourth hint", () => {
    expect(getNextHintCost(3 as HintLevel)).toBe(5);
  });

  it("returns null when all hints used", () => {
    expect(getNextHintCost(4 as HintLevel)).toBeNull();
  });
});
