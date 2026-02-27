import { RANKS } from "../constants/scoring.ts";

export function getRank(score: number): string {
  const clamped = Math.max(0, score);
  for (const rank of RANKS) {
    if (clamped >= rank.minScore) return rank.name;
  }
  return RANKS[RANKS.length - 1].name;
}
