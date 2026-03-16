import type { Headline, HeadlineResult } from "../types/game.ts"

interface Props {
  headlines: Headline[]
  results: HeadlineResult[]
  onPlayAgain: () => void
}

export default function GameSummary({ headlines, results, onPlayAgain }: Props) {
  const solved = results.filter(r => r === "solved").length

  return (
    <div className="space-y-6 animate-fade-slide-up">
      <div className="text-center space-y-2">
        <h2 className="text-lg font-semibold text-gray-400 uppercase tracking-wide">Session Complete</h2>
        <p className="text-5xl font-extrabold">
          <span className="text-emerald-600">{solved}</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-800">{results.length}</span>
        </p>
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        {results.map((result, i) => (
          <div
            key={i}
            className={`
              p-3 rounded-lg text-sm animate-fade-slide-up
              border-l-4
              ${result === "solved"
                ? "bg-emerald-50 border-l-emerald-500 border border-emerald-200"
                : "bg-red-50 border-l-red-400 border border-red-200"
              }
            `}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <p className="text-gray-700 font-medium">{headlines[i].title}</p>
            <p className="text-gray-400 text-xs mt-1">{headlines[i].source}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onPlayAgain}
        className="w-full max-w-md mx-auto block px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-400 hover:to-orange-300 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
      >
        Play Again
      </button>
    </div>
  )
}
