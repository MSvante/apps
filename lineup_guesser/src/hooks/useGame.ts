import { useReducer, useCallback } from "react";
import type { Match, Lineup } from "../types/match";
import type { GameState, SlotState, HintLevel, GuessResult } from "../types/game";
import { normalizeForComparison, levenshtein, fuzzyThreshold } from "../utils/normalize";
import { calculateSlotScore, getNextHintCost } from "../utils/scoring";
import { MAX_HINTS } from "../constants/scoring";
import matchesData from "../data/matches.json";

const matches = matchesData as Match[];

const PLAYED_KEY = "lineup-guesser-played";

function getPlayedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(PLAYED_KEY) || "[]");
  } catch {
    return [];
  }
}

function addPlayedId(id: string) {
  const played = getPlayedIds();
  played.push(id);
  // Keep only last 100 to avoid bloat
  const trimmed = played.slice(-100);
  localStorage.setItem(PLAYED_KEY, JSON.stringify(trimmed));
}

export function getTeams(): string[] {
  const teams = new Set<string>();
  matches.forEach((m) => {
    teams.add(m.homeTeam);
    teams.add(m.awayTeam);
  });
  return [...teams].sort();
}

function pickRandomMatch(teamFilter: string | null): Match {
  const played = getPlayedIds();
  let pool = matches;

  if (teamFilter) {
    pool = pool.filter(
      (m) => m.homeTeam === teamFilter || m.awayTeam === teamFilter
    );
  }

  const unplayed = pool.filter((m) => !played.includes(m.id));
  const finalPool = unplayed.length > 0 ? unplayed : pool;
  return finalPool[Math.floor(Math.random() * finalPool.length)];
}

function createInitialState(teamFilter: string | null = null): GameState {
  const match = pickRandomMatch(teamFilter);
  let team: "home" | "away";

  if (teamFilter) {
    team = match.homeTeam === teamFilter ? "home" : "away";
  } else {
    team = Math.random() < 0.5 ? "home" : "away";
  }

  const lineup: Lineup =
    team === "home" ? match.homeLineup : match.awayLineup;

  addPlayedId(match.id);

  return {
    phase: "PLAYING",
    match,
    team,
    lineup,
    slots: lineup.players.map(
      (): SlotState => ({ guessed: false, hintsRevealed: 0 as HintLevel })
    ),
    selectedSlotIndex: null,
    score: 0,
    lastGuessResult: null,
    lastGuessedSlotIndex: null,
  };
}

type GameAction =
  | { type: "NEW_GAME"; teamFilter: string | null }
  | { type: "SELECT_SLOT"; index: number | null }
  | { type: "SUBMIT_GUESS"; name: string }
  | { type: "REQUEST_HINT" }
  | { type: "GIVE_UP" }
  | { type: "CLEAR_FEEDBACK" };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "NEW_GAME":
      return createInitialState(action.teamFilter);

    case "SELECT_SLOT": {
      return {
        ...state,
        selectedSlotIndex: action.index,
        lastGuessResult: null,
        lastGuessedSlotIndex: null,
      };
    }

    case "SUBMIT_GUESS": {
      const normalized = normalizeForComparison(action.name);
      if (!normalized) return state;

      /** All normalized accepted names for a player. */
      function playerNames(playerIndex: number): string[] {
        const player = state.lineup.players[playerIndex];
        const names = [player.lastNameNormalized];
        if (player.alternateNames) {
          names.push(
            ...player.alternateNames.map((n) => normalizeForComparison(n))
          );
        }
        return names;
      }

      /** Check if guess matches any of a player's names exactly. */
      function exactMatch(names: string[]): boolean {
        return names.some((n) => n === normalized);
      }

      /** Check if guess fuzzy-matches any of a player's names. */
      function fuzzyMatch(names: string[]): boolean {
        return names.some((n) => {
          const threshold = fuzzyThreshold(n.length);
          return levenshtein(n, normalized) <= threshold;
        });
      }

      // Find matching unguessed player — exact first, then fuzzy
      let matchedIndex = -1;
      for (let i = 0; i < state.lineup.players.length; i++) {
        if (state.slots[i].guessed) continue;
        if (exactMatch(playerNames(i))) {
          matchedIndex = i;
          break;
        }
      }
      if (matchedIndex === -1) {
        for (let i = 0; i < state.lineup.players.length; i++) {
          if (state.slots[i].guessed) continue;
          if (fuzzyMatch(playerNames(i))) {
            matchedIndex = i;
            break;
          }
        }
      }

      if (matchedIndex === -1) {
        // Check if it's a duplicate (already guessed) — exact or fuzzy
        const isDuplicate = state.lineup.players.some((_, i) => {
          if (!state.slots[i].guessed) return false;
          const names = playerNames(i);
          return exactMatch(names) || fuzzyMatch(names);
        });

        return {
          ...state,
          lastGuessResult: isDuplicate
            ? ("duplicate" as GuessResult)
            : ("incorrect" as GuessResult),
          lastGuessedSlotIndex: null,
        };
      }

      // Correct guess
      const newSlots = [...state.slots];
      newSlots[matchedIndex] = { ...newSlots[matchedIndex], guessed: true };

      const pointsEarned = calculateSlotScore(
        newSlots[matchedIndex].hintsRevealed
      );
      const newScore = state.score + pointsEarned;
      const allGuessed = newSlots.every((s) => s.guessed);

      return {
        ...state,
        slots: newSlots,
        score: newScore,
        lastGuessResult: "correct" as GuessResult,
        lastGuessedSlotIndex: matchedIndex,
        selectedSlotIndex:
          state.selectedSlotIndex === matchedIndex
            ? null
            : state.selectedSlotIndex,
        phase: allGuessed ? "COMPLETE" : state.phase,
      };
    }

    case "REQUEST_HINT": {
      if (state.selectedSlotIndex === null) return state;
      const slot = state.slots[state.selectedSlotIndex];
      if (slot.guessed || slot.hintsRevealed >= MAX_HINTS) return state;

      const cost = getNextHintCost(slot.hintsRevealed);
      if (cost === null) return state;

      const newSlots = [...state.slots];
      newSlots[state.selectedSlotIndex] = {
        ...slot,
        hintsRevealed: (slot.hintsRevealed + 1) as HintLevel,
      };

      return {
        ...state,
        slots: newSlots,
        lastGuessResult: null,
        lastGuessedSlotIndex: null,
      };
    }

    case "GIVE_UP": {
      return {
        ...state,
        phase: "COMPLETE",
        selectedSlotIndex: null,
      };
    }

    case "CLEAR_FEEDBACK": {
      return {
        ...state,
        lastGuessResult: null,
        lastGuessedSlotIndex: null,
      };
    }

    default:
      return state;
  }
}

export function useGame(teamFilter: string | null) {
  const [state, dispatch] = useReducer(
    gameReducer,
    teamFilter,
    (filter) => createInitialState(filter)
  );

  const newGame = useCallback(
    () => dispatch({ type: "NEW_GAME", teamFilter }),
    [teamFilter]
  );
  const selectSlot = useCallback(
    (index: number | null) => dispatch({ type: "SELECT_SLOT", index }),
    []
  );
  const submitGuess = useCallback(
    (name: string) => dispatch({ type: "SUBMIT_GUESS", name }),
    []
  );
  const requestHint = useCallback(
    () => dispatch({ type: "REQUEST_HINT" }),
    []
  );
  const giveUp = useCallback(() => dispatch({ type: "GIVE_UP" }), []);
  const clearFeedback = useCallback(
    () => dispatch({ type: "CLEAR_FEEDBACK" }),
    []
  );

  return {
    state,
    newGame,
    selectSlot,
    submitGuess,
    requestHint,
    giveUp,
    clearFeedback,
  };
}
