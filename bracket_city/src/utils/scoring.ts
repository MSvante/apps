import {
  KINGMAKER,
  MAYOR,
  COMMUTER,
  MAYOR_MIN_SCORE,
  type Performance,
  type Rank,
} from "../constants/scoring.ts";

/**
 * Determine rank from performance, not just raw score:
 * - Kingmaker: flawless — no wrong guesses, peeks, or reveals.
 * - Mayor: clean — no reveals and a high score.
 * - Commuter: completed with heavier help (reveals / many mistakes).
 */
export function getRank(perf: Performance): Rank {
  if (perf.wrongGuesses === 0 && perf.peeks === 0 && perf.reveals === 0) {
    return KINGMAKER;
  }
  if (perf.reveals === 0 && perf.score >= MAYOR_MIN_SCORE) {
    return MAYOR;
  }
  return COMMUTER;
}
