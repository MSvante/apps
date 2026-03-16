import { useEffect, useRef } from "react"
import { useGame } from "../hooks/useGame.ts"
import { fetchHeadlines } from "../api/news.ts"
import { MAX_WRONG_GUESSES, HINT_MAX } from "../constants/config.ts"
import HangmanDrawing from "./HangmanDrawing.tsx"
import HeadlineDisplay from "./HeadlineDisplay.tsx"
import Keyboard from "./Keyboard.tsx"
import ScoreBar from "./ScoreBar.tsx"
import GameSummary from "./GameSummary.tsx"

export default function GameContainer() {
  const { state, loadHeadlines, loadError, guessLetter, nextHeadline, newSession, useHint } = useGame()
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (state.phase !== "LOADING" || fetchedRef.current) return
    fetchedRef.current = true

    fetchHeadlines()
      .then(loadHeadlines)
      .catch(err => loadError(err instanceof Error ? err.message : "Failed to load headlines"))
  }, [state.phase, loadHeadlines, loadError])

  if (state.phase === "LOADING") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-loading-dot"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        <p className="text-gray-400 text-sm">Loading today's headlines...</p>
      </div>
    )
  }

  if (state.phase === "ERROR") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 animate-fade-slide-up">
        <p className="text-red-500 text-center">{state.errorMessage}</p>
        <button
          onClick={() => {
            fetchedRef.current = false
            newSession()
          }}
          className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-200 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (state.phase === "SESSION_COMPLETE") {
    return (
      <GameSummary
        headlines={state.headlines}
        results={state.results}
        onPlayAgain={() => {
          fetchedRef.current = false
          newSession()
        }}
      />
    )
  }

  const headline = state.headlines[state.currentIndex]
  const isResult = state.phase === "HEADLINE_RESULT"
  const hintsLeft = HINT_MAX - state.hintsUsed

  return (
    <div className="space-y-4 animate-fade-slide-up">
      <ScoreBar
        currentIndex={state.currentIndex}
        total={state.headlines.length}
        results={state.results}
      />

      <HangmanDrawing
        wrongCount={state.wrongGuesses.length}
        result={state.result}
      />

      <HeadlineDisplay
        title={headline.title}
        source={headline.source}
        hiddenWordIndex={state.hiddenWordIndex}
        guessedLetters={state.guessedLetters}
        result={state.result}
      />

      {isResult && (
        <div className="text-center space-y-3">
          <p className={`text-xl font-bold ${state.result === "solved" ? "text-emerald-600 animate-bounce-in" : "text-red-500 animate-shake"}`}>
            {state.result === "solved" ? "Solved!" : "Not this time..."}
          </p>
          <button
            onClick={nextHeadline}
            className="px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border border-gray-200 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            {state.currentIndex + 1 < state.headlines.length ? "Next Headline" : "See Results"}
          </button>
        </div>
      )}

      {!isResult && (
        <>
          {/* Hint button */}
          <div className="flex justify-center">
            <button
              onClick={useHint}
              disabled={hintsLeft === 0}
              className={`
                inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
                border transition-all active:scale-95
                ${hintsLeft > 0
                  ? "bg-amber-100 border-amber-300 text-amber-700 hover:bg-amber-200 cursor-pointer"
                  : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                }
              `}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a4.5 4.5 0 0 0-2.5 8.24V11a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1V9.24A4.5 4.5 0 0 0 8 1ZM6.5 13a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3Z" />
              </svg>
              Hint ({hintsLeft} left)
            </button>
          </div>

          <Keyboard
            guessedLetters={state.guessedLetters}
            wrongGuesses={state.wrongGuesses}
            onGuess={guessLetter}
            disabled={isResult}
          />

          {/* Wrong guess dots */}
          <div className="flex justify-center gap-1.5">
            {Array.from({ length: MAX_WRONG_GUESSES }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  i < state.wrongGuesses.length ? "bg-red-400" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
