import type { Match, Lineup } from "./match";

export type GamePhase = "PLAYING" | "COMPLETE";
export type HintLevel = 0 | 1 | 2;
export type GuessResult = "correct" | "incorrect" | "duplicate" | null;

export interface SlotState {
  guessed: boolean;
  givenUp: boolean;
  hintsRevealed: HintLevel;
  lettersRevealed: number;
}

export interface GameState {
  phase: GamePhase;
  match: Match;
  team: "home" | "away";
  lineup: Lineup;
  slots: SlotState[];
  selectedSlotIndex: number | null;
  score: number;
  lastGuessResult: GuessResult;
  lastGuessedSlotIndex: number | null;
}
