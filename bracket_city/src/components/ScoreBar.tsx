import { useState } from "react";
import { INITIAL_SCORE, type Rank } from "../constants/scoring.ts";
import { DIFFICULTY_EMOJI, type Difficulty } from "../utils/puzzle.ts";

interface Props {
  score: number;
  rank: Rank;
  difficulty: Difficulty;
  solvedCount: number;
  totalCount: number;
}

function rankClass(rank: string): string {
  switch (rank) {
    case "Kingmaker": return "rank-kingmaker";
    case "Mayor": return "rank-mayor";
    default: return "rank-commuter";
  }
}

export default function ScoreBar({ score, rank, difficulty, solvedCount, totalCount }: Props) {
  const pct = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;
  const [flash, setFlash] = useState(false);
  const [prevScore, setPrevScore] = useState(score);

  // Flash when the score changes (adjust during render, reset on animation end).
  if (score !== prevScore) {
    setPrevScore(score);
    setFlash(true);
  }

  return (
    <div className="mb-5 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`text-2xl font-extrabold tabular-nums ${flash ? "score-flash" : ""} ${score >= 80 ? "text-amber-400" : score >= 50 ? "text-white" : "text-red-400"}`}
            onAnimationEnd={() => setFlash(false)}
          >
            {score}
          </span>
          <span className="text-gray-600 text-sm font-medium">/ {INITIAL_SCORE}</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-xs text-gray-400 bg-gray-800/70 border border-gray-700/50 rounded-full px-2.5 py-0.5"
            title={`Today's difficulty: ${difficulty}`}
          >
            {DIFFICULTY_EMOJI[difficulty]} {difficulty}
          </span>
          <span className={`text-sm font-bold uppercase tracking-wider ${rankClass(rank.name)}`}>
            {rank.emoji} {rank.name}
          </span>
        </div>
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
