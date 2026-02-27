export const INITIAL_SCORE = 100;
export const WRONG_GUESS_PENALTY = 10;
export const HINT_PENALTY = 15;

export const RANKS = [
  { name: "Kingmaker", minScore: 100 },
  { name: "Mayor", minScore: 80 },
  { name: "Resident", minScore: 50 },
  { name: "Local", minScore: 20 },
  { name: "Commuter", minScore: 0 },
] as const;
