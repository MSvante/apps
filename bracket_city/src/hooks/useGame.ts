import { useReducer, useCallback } from "react";
import type { Puzzle, GameState } from "../types/puzzle.ts";
import { INITIAL_SCORE, WRONG_GUESS_PENALTY, HINT_PENALTY } from "../constants/scoring.ts";
import { initBracketStates, allBracketsSolved, getSolvableBracketIds } from "../utils/puzzle.ts";
import { checkAnswer } from "../utils/normalize.ts";

type Action =
  | { type: "SELECT_BRACKET"; id: string }
  | { type: "GUESS"; answer: string }
  | { type: "HINT" }
  | { type: "NEW_PUZZLE"; puzzle: Puzzle };

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

    case "NEW_PUZZLE":
      return createInitialState(action.puzzle);

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

const PLAYED_KEY = "bracket_city_played";

function getPlayedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(PLAYED_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function markPlayed(id: string) {
  const played = getPlayedIds();
  if (!played.includes(id)) {
    played.push(id);
    localStorage.setItem(PLAYED_KEY, JSON.stringify(played));
  }
}

export function pickPuzzle(puzzles: Puzzle[]): Puzzle | null {
  const played = getPlayedIds();
  const unplayed = puzzles.filter((p) => !played.includes(p.id));
  if (unplayed.length > 0) {
    return unplayed[Math.floor(Math.random() * unplayed.length)];
  }
  // All played — reset and pick random
  localStorage.removeItem(PLAYED_KEY);
  return puzzles[Math.floor(Math.random() * puzzles.length)] ?? null;
}

export function useGame(puzzle: Puzzle) {
  const [state, dispatch] = useReducer(reducer, puzzle, createInitialState);

  const selectBracket = useCallback((id: string) => dispatch({ type: "SELECT_BRACKET", id }), []);
  const guess = useCallback((answer: string) => dispatch({ type: "GUESS", answer }), []);
  const useHint = useCallback(() => dispatch({ type: "HINT" }), []);
  const newPuzzle = useCallback((p: Puzzle) => {
    markPlayed(p.id);
    dispatch({ type: "NEW_PUZZLE", puzzle: p });
  }, []);

  return { state, selectBracket, guess, useHint, newPuzzle };
}
