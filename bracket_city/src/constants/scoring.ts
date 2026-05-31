export const INITIAL_SCORE = 100;
export const WRONG_GUESS_PENALTY = 10;
export const PEEK_PENALTY = 10;
export const REVEAL_PENALTY = 25;

/**
 * Performance counts used to determine a player's rank.
 * Ranks mirror the real Bracket City tiers: Kingmaker (flawless),
 * Mayor (clean solve), Commuter (completed with heavier help).
 */
export interface Performance {
  score: number;
  wrongGuesses: number;
  peeks: number;
  reveals: number;
}

export interface Rank {
  name: string;
  emoji: string;
}

export const KINGMAKER: Rank = { name: "Kingmaker", emoji: "👑" };
export const MAYOR: Rank = { name: "Mayor", emoji: "🎖" };
export const COMMUTER: Rank = { name: "Commuter", emoji: "🚇" };

/** Score at or above which a clean (no-reveal) solve earns Mayor. */
export const MAYOR_MIN_SCORE = 70;
