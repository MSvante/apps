import { useEffect, useRef, useState } from "react";
import { getRank } from "../utils/scoring.ts";
import { INITIAL_SCORE } from "../constants/scoring.ts";

interface Props {
  score: number;
  solvedCount: number;
  totalCount: number;
}

function rankClass(rank: string): string {
  switch (rank) {
    case "Kingmaker": return "rank-kingmaker";
    case "Mayor": return "rank-mayor";
    case "Resident": return "rank-resident";
    case "Local": return "rank-local";
    default: return "rank-commuter";
  }
}

export default function ScoreBar({ score, solvedCount, totalCount }: Props) {
  const rank = getRank(score);
  const pct = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;
  const [flash, setFlash] = useState(false);
  const prevScore = useRef(score);

  useEffect(() => {
    if (score !== prevScore.current) {
      setFlash(true);
      prevScore.current = score;
      const timer = setTimeout(() => setFlash(false), 300);
      return () => clearTimeout(timer);
    }
  }, [score]);

  return (
    <div className="mb-5 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`text-2xl font-extrabold tabular-nums ${flash ? "score-flash" : ""} ${score >= 80 ? "text-amber-400" : score >= 50 ? "text-white" : "text-red-400"}`}>
            {score}
          </span>
          <span className="text-gray-600 text-sm font-medium">/ {INITIAL_SCORE}</span>
        </div>
        <span className={`text-sm font-bold uppercase tracking-wider ${rankClass(rank)}`}>
          {rank}
        </span>
      </div>
      <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out progress-bar-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{solvedCount} of {totalCount} brackets solved</span>
        <span>{pct}%</span>
      </div>
    </div>
  );
}
