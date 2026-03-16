import type { HeadlineResult } from "../types/game.ts"

interface Props {
  currentIndex: number
  total: number
  results: HeadlineResult[]
}

export default function ScoreBar({ currentIndex, total, results }: Props) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => {
        const result = results[i]
        const isCurrent = i === currentIndex && !result

        let dotClass = "w-2.5 h-2.5 rounded-full transition-all duration-300 "
        if (result === "solved") {
          dotClass += "bg-emerald-500"
        } else if (result === "failed") {
          dotClass += "bg-red-400"
        } else if (isCurrent) {
          dotClass += "bg-amber-500 ring-2 ring-amber-500/40 ring-offset-1 ring-offset-amber-50"
        } else {
          dotClass += "bg-gray-300"
        }

        return <div key={i} className={dotClass} />
      })}
    </div>
  )
}
