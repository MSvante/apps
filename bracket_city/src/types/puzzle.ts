export interface TextSegment {
  type: "text";
  value: string;
}

export interface BracketSegment {
  type: "bracket";
  id: string;
  answer: string;
  clue: string | PuzzleSegment[];
}

export type PuzzleSegment = TextSegment | BracketSegment;

export interface Puzzle {
  id: string;
  date: string;
  event: string;
  segments: PuzzleSegment[];
}

export interface BracketState {
  solved: boolean;
  hintUsed: boolean;
  wrongGuesses: number;
}

export interface GameState {
  phase: "PLAYING" | "COMPLETE";
  puzzle: Puzzle;
  brackets: Record<string, BracketState>;
  activeBracketId: string | null;
  score: number;
}
