import { POINTS_PER_CORRECT_GUESS, HINT_COSTS } from "../constants/scoring";
import type { HintLevel } from "../types/game";

/**
 * Calculate the points earned for guessing a player given the number of hints revealed.
 * Floor at 0.
 */
export function calculateSlotScore(hintsRevealed: HintLevel): number {
  let score = POINTS_PER_CORRECT_GUESS;
  for (let i = 1; i <= hintsRevealed; i++) {
    score -= HINT_COSTS[i] ?? 0;
  }
  return Math.max(0, score);
}

/**
 * Calculate the cost of the next hint for a slot.
 */
export function getNextHintCost(currentHints: HintLevel): number | null {
  if (currentHints >= 4) return null;
  return HINT_COSTS[(currentHints + 1) as number] ?? null;
}

/**
 * Get the label for a hint level.
 */
export function getHintLabel(level: number): string {
  switch (level) {
    case 1:
      return "Nationality";
    case 2:
      return "Age";
    case 3:
      return "Shirt Number";
    case 4:
      return "First Letter";
    default:
      return "";
  }
}
