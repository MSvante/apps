import type { HeadlineResult } from "../types/game.ts"
import { getDisplayChar } from "../utils/headline.ts"

interface Props {
  title: string
  source: string
  hiddenWordIndex: number
  guessedLetters: Set<string>
  result: HeadlineResult | null
}

export default function HeadlineDisplay({ title, source, hiddenWordIndex, guessedLetters, result }: Props) {
  const revealed = result !== null
  const words = title.split(" ")

  return (
    <div className="text-center space-y-3">
      <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2">
        {words.map((word, wi) => {
          const isHidden = wi === hiddenWordIndex

          if (!isHidden) {
            return (
              <span key={wi} className="text-base sm:text-lg font-bold text-gray-400">
                {word}
              </span>
            )
          }

          const colorClass = result === "solved"
            ? "text-emerald-600"
            : result === "failed"
              ? "text-red-500"
              : "text-gray-800"

          return (
            <span key={wi} className="inline-flex gap-0.5">
              {[...word].map((char, ci) => {
                const display = getDisplayChar(char, guessedLetters, revealed)
                const isLetter = /[A-Z]/i.test(char)

                return (
                  <span
                    key={ci}
                    className={`
                      inline-flex items-center justify-center
                      text-center font-mono text-base sm:text-lg font-bold
                      ${colorClass}
                      ${isLetter
                        ? "w-5 h-7 sm:w-7 sm:h-9 rounded-md bg-white border border-gray-200 shadow-sm"
                        : "w-3 h-7 sm:w-4 sm:h-9"
                      }
                      ${result === "solved" && isLetter ? "animate-flash-emerald" : ""}
                    `}
                  >
                    {display}
                  </span>
                )
              })}
            </span>
          )
        })}
      </div>
      <p className="text-xs text-gray-400 uppercase tracking-wide">{source}</p>
    </div>
  )
}
