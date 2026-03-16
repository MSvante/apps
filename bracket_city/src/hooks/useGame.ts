import { useReducer, useCallback, useEffect } from "react";
import type { Puzzle, GameState } from "../types/puzzle.ts";
import { INITIAL_SCORE, WRONG_GUESS_PENALTY, HINT_PENALTY } from "../constants/scoring.ts";
import { initBracketStates, allBracketsSolved, getSolvableBracketIds } from "../utils/puzzle.ts";
import { checkAnswer } from "../utils/normalize.ts";
import { saveDailyState, saveStats, dateKey, type DailyState } from "../utils/daily.ts";

type Action =
  | { type: "SELECT_BRACKET"; id: string }
  | { type: "GUESS"; answer: string }
  | { type: "HINT" };

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

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "SELECT_BRACKET":
      return { ...state, activeBracketId: action.id };

    case "GUESS": {
      const { activeBracketId, puzzle, brackets, score } = state;
      if (!activeBracketId) return state;
      const correctAnswer = findBracketAnswer(puzzle, activeBracketId);
      if (checkAnswer(action.answer, correctAnswer)) {
        const newBrackets = {
          ...brackets,
          [activeBracketId]: { ...brackets[activeBracketId], solved: true },
        };
        const complete = allBracketsSolved(newBrackets);
        const solvable = complete ? [] : getSolvableBracketIds(puzzle.segments, newBrackets);
        return {
          ...state,
          brackets: newBrackets,
          activeBracketId: solvable.length === 1 ? solvable[0] : null,
          phase: complete ? "COMPLETE" : "PLAYING",
        };
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

    case "HINT": {
      const { activeBracketId, brackets, score } = state;
      if (!activeBracketId || brackets[activeBracketId].hintUsed) return state;
      return {
        ...state,
        score: Math.max(0, score - HINT_PENALTY),
        brackets: {
          ...brackets,
          [activeBracketId]: { ...brackets[activeBracketId], hintUsed: true },
        },
      };
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
  return {
    phase: daily.completed ? "COMPLETE" : "PLAYING",
    puzzle,
    brackets: daily.brackets,
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
  const useHint = useCallback(() => dispatch({ type: "HINT" }), []);

  return { state, selectBracket, guess, useHint };
}
