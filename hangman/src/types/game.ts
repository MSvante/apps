export interface Headline {
  title: string
  source: string
}

export type GamePhase = "LOADING" | "PLAYING" | "HEADLINE_RESULT" | "SESSION_COMPLETE" | "ERROR"

export type HeadlineResult = "solved" | "failed"

export interface GameState {
  phase: GamePhase
  headlines: Headline[]
  currentIndex: number
  hiddenWordIndex: number
  guessedLetters: Set<string>
  wrongGuesses: string[]
  result: HeadlineResult | null
  results: HeadlineResult[]
  errorMessage: string | null
  hintsUsed: number
}

export type GameAction =
  | { type: "LOAD_HEADLINES"; headlines: Headline[] }
  | { type: "LOAD_ERROR"; message: string }
  | { type: "GUESS_LETTER"; letter: string }
  | { type: "NEXT_HEADLINE" }
  | { type: "NEW_SESSION" }
  | { type: "USE_HINT" }
