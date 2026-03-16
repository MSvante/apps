import { useEffect } from "react"

interface Props {
  guessedLetters: Set<string>
  wrongGuesses: string[]
  onGuess: (letter: string) => void
  disabled: boolean
}

const ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
]

const ROW_PADDING = ["", "pl-3 sm:pl-4", "pl-6 sm:pl-8"]

export default function Keyboard({ guessedLetters, wrongGuesses, onGuess, disabled }: Props) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (disabled) return
      const key = e.key.toUpperCase()
      if (/^[A-Z]$/.test(key) && !guessedLetters.has(key)) {
        onGuess(key)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [disabled, guessedLetters, onGuess])

  const wrongSet = new Set(wrongGuesses)

  return (
    <div className="space-y-1.5 select-none">
      {ROWS.map((row, ri) => (
        <div key={ri} className={`flex justify-center gap-1 sm:gap-1.5 ${ROW_PADDING[ri]}`}>
          {row.map(letter => {
            const guessed = guessedLetters.has(letter)
            const wrong = wrongSet.has(letter)

            let colorClass = "bg-white border-gray-200 hover:bg-gray-100 text-gray-700 shadow-sm"
            if (guessed && wrong) {
              colorClass = "bg-red-100 border-red-200 text-red-400"
            } else if (guessed) {
              colorClass = "bg-emerald-100 border-emerald-200 text-emerald-600 animate-tile-pop"
            }

            return (
              <button
                key={letter}
                onClick={() => onGuess(letter)}
                disabled={guessed || disabled}
                className={`
                  w-8 h-11 sm:w-10 sm:h-12 rounded-lg font-bold text-sm sm:text-base
                  border transition-all duration-150
                  active:scale-95
                  ${colorClass}
                  ${guessed ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                {letter}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
