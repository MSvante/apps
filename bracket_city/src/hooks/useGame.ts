import { useReducer, useCallback, useEffect } from "react";
import type { Puzzle, GameState, BracketState } from "../types/puzzle.ts";
import { INITIAL_SCORE, WRONG_GUESS_PENALTY, PEEK_PENALTY, REVEAL_PENALTY } from "../constants/scoring.ts";
import { initBracketStates, allBracketsSolved, getSolvableBracketIds } from "../utils/puzzle.ts";
import { checkAnswer } from "../utils/normalize.ts";
import { saveDailyState, saveStats, dateKey, type DailyState } from "../utils/daily.ts";

type Action =
  | { type: "SELECT_BRACKET"; id: string }
  | { type: "GUESS"; answer: string }
  | { type: "PEEK" }
  | { type: "REVEAL" };

function findBracketAnswer(puzzle: Puzzle, id: string): string {
  const search = (segments: Puzzle["segments"]): string | null => {
    for (const seg of segments) {
      if (seg.type === "bracket") {
        if (seg.id === id) return seg.answer;
        if (Array.isArray(seg.clue)) {
          const found = search(seg.clue);
          if (found) return found;
        }
      }
    }
    return null;
  };
  return search(puzzle.segments) ?? "";
}

/**
 * Mark the active bracket solved, then recompute completion and auto-advance.
 * Shared by a correct guess and by Reveal. `extra` lets Reveal flag the bracket.
 */
function solveActiveBracket(
  state: GameState,
  extra: Partial<BracketState> = {},
  scoreDelta = 0,
): GameState {
  const { activeBracketId, puzzle, brackets, score } = state;
  if (!activeBracketId) return state;
  const newBrackets = {
    ...brackets,
    [activeBracketId]: { ...brackets[activeBracketId], solved: true, ...extra },
  };
  const complete = allBracketsSolved(newBrackets);
  const solvable = complete ? [] : getSolvableBracketIds(puzzle.segments, newBrackets);
  return {
    ...state,
    score: Math.max(0, score - scoreDelta),
    brackets: newBrackets,
    activeBracketId: solvable.length === 1 ? solvable[0] : null,
    phase: complete ? "COMPLETE" : "PLAYING",
  };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "SELECT_BRACKET":
      return { ...state, activeBracketId: action.id };

    case "GUESS": {
      const { activeBracketId, puzzle, brackets, score } = state;
      if (!activeBracketId) return state;
      const correctAnswer = findBracketAnswer(puzzle, activeBracketId);
      if (checkAnswer(action.answer, correctAnswer)) {
        return solveActiveBracket(state);
      }
      // Wrong guess
      return {
        ...state,
        score: Math.max(0, score - WRONG_GUESS_PENALTY),
        brackets: {
          ...brackets,
          [activeBracketId]: {
            ...brackets[activeBracketId],
            wrongGuesses: brackets[activeBracketId].wrongGuesses + 1,
          },
        },
      };
    }

    case "PEEK": {
      const { activeBracketId, brackets, score } = state;
      if (!activeBracketId || brackets[activeBracketId].peeked) return state;
      return {
        ...state,
        score: Math.max(0, score - PEEK_PENALTY),
        brackets: {
          ...brackets,
          [activeBracketId]: { ...brackets[activeBracketId], peeked: true },
        },
      };
    }

    case "REVEAL": {
      const { activeBracketId, brackets } = state;
      if (!activeBracketId || brackets[activeBracketId].solved) return state;
      return solveActiveBracket(state, { revealed: true }, REVEAL_PENALTY);
    }

    default:
      return state;
  }
}

function createInitialState(puzzle: Puzzle): GameState {
  return {
    phase: "PLAYING",
    puzzle,
    brackets: initBracketStates(puzzle.segments),
    activeBracketId: null,
    score: INITIAL_SCORE,
  };
}

function restoreFromDaily(puzzle: Puzzle, daily: DailyState): GameState {
  // Default new fields so saves from before peek/reveal still load cleanly.
  const brackets: Record<string, BracketState> = {};
  for (const [id, b] of Object.entries(daily.brackets)) {
    brackets[id] = { ...b, peeked: b.peeked ?? false, revealed: b.revealed ?? false };
  }
  return {
    phase: daily.completed ? "COMPLETE" : "PLAYING",
    puzzle,
    brackets,
    activeBracketId: daily.activeBracketId,
    score: daily.score,
  };
}

export function useGame(puzzle: Puzzle, savedState?: DailyState | null) {
  const [state, dispatch] = useReducer(
    reducer,
    puzzle,
    (p) => savedState ? restoreFromDaily(p, savedState) : createInitialState(p),
  );

  // Save state to localStorage on every change
  useEffect(() => {
    const dailyState: DailyState = {
      dateKey: dateKey(),
      completed: state.phase === "COMPLETE",
      score: state.score,
      brackets: state.brackets,
      activeBracketId: state.activeBracketId,
    };
    saveDailyState(dailyState);

    // Save stats when completing
    if (state.phase === "COMPLETE") {
      saveStats(state.score);
    }
  }, [state]);

  const selectBracket = useCallback((id: string) => dispatch({ type: "SELECT_BRACKET", id }), []);
  const guess = useCallback((answer: string) => dispatch({ type: "GUESS", answer }), []);
  const peek = useCallback(() => dispatch({ type: "PEEK" }), []);
  const reveal = useCallback(() => dispatch({ type: "REVEAL" }), []);

  return { state, selectBracket, guess, peek, reveal };
}
