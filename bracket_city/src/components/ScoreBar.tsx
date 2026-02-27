import { getRank } from "../utils/scoring.ts";
import { INITIAL_SCORE } from "../constants/scoring.ts";

interface Props {
  score: number;
  solvedCount: number;
  totalCount: number;
}

export default function ScoreBar({ score, solvedCount, totalCount }: Props) {
  const rank = getRank(score);
  const pct = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  return (
    <div className="flex items-center justify-between text-sm mb-4">
      <div className="flex items-center gap-3">
        <span className="text-amber-400 font-bold">
          {score}/{INITIAL_SCORE}
        </span>
        <span className="text-gray-500">|</span>
        <span className="text-gray-400">{rank}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-gray-400">
          {solvedCount}/{totalCount}
        </span>
      </div>
    </div>
  );
}
