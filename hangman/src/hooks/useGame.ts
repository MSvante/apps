import { useReducer, useCallback } from "react"
import type { GameState, GameAction, Headline } from "../types/game.ts"
import { MAX_WRONG_GUESSES, HINT_MAX } from "../constants/config.ts"
import { isWordSolved, pickHiddenWordIndex } from "../utils/headline.ts"

const initialState: GameState = {
  phase: "LOADING",
  headlines: [],
  currentIndex: 0,
  hiddenWordIndex: 0,
  guessedLetters: new Set(),
  wrongGuesses: [],
  result: null,
  results: [],
  errorMessage: null,
  hintsUsed: 0,
}

function getHiddenWord(state: GameState): string {
  const headline = state.headlines[state.currentIndex]
  return headline.title.split(" ")[state.hiddenWordIndex]
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "LOAD_HEADLINES":
      return {
        ...initialState,
        phase: "PLAYING",
        headlines: action.headlines,
        hiddenWordIndex: pickHiddenWordIndex(action.headlines[0].title),
      }

    case "LOAD_ERROR":
      return {
        ...initialState,
        phase: "ERROR",
        errorMessage: action.message,
      }

    case "GUESS_LETTER": {
      if (state.phase !== "PLAYING") return state

      const letter = action.letter.toUpperCase()
      if (state.guessedLetters.has(letter)) return state

      const newGuessed = new Set(state.guessedLetters)
      newGuessed.add(letter)

      const hiddenWord = getHiddenWord(state)
      const inWord = hiddenWord.toUpperCase().includes(letter)
      const newWrong = inWord ? state.wrongGuesses : [...state.wrongGuesses, letter]

      const solved = isWordSolved(hiddenWord, newGuessed)
      const failed = newWrong.length >= MAX_WRONG_GUESSES

      if (solved || failed) {
        const result = solved ? "solved" : "failed"
        return {
          ...state,
          phase: "HEADLINE_RESULT",
          guessedLetters: newGuessed,
          wrongGuesses: newWrong,
          result,
          results: [...state.results, result],
        }
      }

      return {
        ...state,
        guessedLetters: newGuessed,
        wrongGuesses: newWrong,
      }
    }

    case "USE_HINT": {
      if (state.phase !== "PLAYING") return state
      if (state.hintsUsed >= HINT_MAX) return state

      const hiddenWord = getHiddenWord(state)
      const unrevealed = [...new Set(
        [...hiddenWord.toUpperCase()].filter(
          ch => /[A-Z]/.test(ch) && !state.guessedLetters.has(ch)
        )
      )]

      if (unrevealed.length === 0) return state

      const letter = unrevealed[Math.floor(Math.random() * unrevealed.length)]
      const newGuessed = new Set(state.guessedLetters)
      newGuessed.add(letter)

      const solved = isWordSolved(hiddenWord, newGuessed)

      if (solved) {
        return {
          ...state,
          phase: "HEADLINE_RESULT",
          guessedLetters: newGuessed,
          hintsUsed: state.hintsUsed + 1,
          result: "solved",
          results: [...state.results, "solved"],
        }
      }

      return {
        ...state,
        guessedLetters: newGuessed,
        hintsUsed: state.hintsUsed + 1,
      }
    }

    case "NEXT_HEADLINE": {
      const nextIndex = state.currentIndex + 1
      if (nextIndex >= state.headlines.length) {
        return { ...state, phase: "SESSION_COMPLETE" }
      }
      return {
        ...state,
        phase: "PLAYING",
        currentIndex: nextIndex,
        hiddenWordIndex: pickHiddenWordIndex(state.headlines[nextIndex].title),
        guessedLetters: new Set(),
        wrongGuesses: [],
        result: null,
        hintsUsed: 0,
      }
    }

    case "NEW_SESSION":
      return { ...initialState }

    default:
      return state
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const loadHeadlines = useCallback((headlines: Headline[]) => {
    dispatch({ type: "LOAD_HEADLINES", headlines })
  }, [])

  const loadError = useCallback((message: string) => {
    dispatch({ type: "LOAD_ERROR", message })
  }, [])

  const guessLetter = useCallback((letter: string) => {
    dispatch({ type: "GUESS_LETTER", letter })
  }, [])

  const nextHeadline = useCallback(() => {
    dispatch({ type: "NEXT_HEADLINE" })
  }, [])

  const newSession = useCallback(() => {
    dispatch({ type: "NEW_SESSION" })
  }, [])

  const useHint = useCallback(() => {
    dispatch({ type: "USE_HINT" })
  }, [])

  return { state, loadHeadlines, loadError, guessLetter, nextHeadline, newSession, useHint }
}
