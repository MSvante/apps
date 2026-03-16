import { useState } from "react";
import { getRank } from "../utils/scoring.ts";
import { INITIAL_SCORE } from "../constants/scoring.ts";
import { loadStats } from "../utils/daily.ts";

interface Props {
  score: number;
  totalBrackets: number;
  event: string;
  date: string;
  puzzleNum: number;
  dateStr: string;
}

function rankColor(rank: string): string {
  switch (rank) {
    case "Kingmaker": return "text-amber-400";
    case "Mayor": return "text-violet-400";
    case "Resident": return "text-blue-400";
    case "Local": return "text-gray-400";
    default: return "text-gray-500";
  }
}

function scoreMessage(score: number): string {
  if (score >= 100) return "Flawless!";
  if (score >= 80) return "Excellent work!";
  if (score >= 50) return "Well played!";
  if (score >= 20) return "Not bad!";
  return "Better luck next time!";
}

function scoreEmoji(score: number): string {
  if (score >= 100) return "🟩🟩🟩🟩🟩";
  if (score >= 80) return "🟩🟩🟩🟩⬛";
  if (score >= 60) return "🟩🟩🟩⬛⬛";
  if (score >= 40) return "🟩🟩⬛⬛⬛";
  if (score >= 20) return "🟩⬛⬛⬛⬛";
  return "⬛⬛⬛⬛⬛";
}

export default function GameSummary({ score, totalBrackets, event, date, puzzleNum, dateStr }: Props) {
  const rank = getRank(score);
  const pct = Math.round((score / INITIAL_SCORE) * 100);
  const stats = loadStats();
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const text = [
      `Bracket City #${puzzleNum}`,
      scoreEmoji(score),
      `Score: ${score}/${INITIAL_SCORE} — ${rank}`,
    ].join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="text-center space-y-8 py-6 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold text-gray-300 mb-1">Puzzle Complete</h2>
        <p className="text-gray-500">{scoreMessage(score)}</p>
      </div>

      {/* Score ring */}
      <div className="flex justify-center">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60" cy="60" r="52"
              fill="none" stroke="#1f2937" strokeWidth="8"
            />
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke={score >= 80 ? "#fbbf24" : score >= 50 ? "#60a5fa" : "#ef4444"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${pct * 3.267} 326.7`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-white tabular-nums">{score}</span>
            <span className="text-xs text-gray-500">of {INITIAL_SCORE}</span>
          </div>
        </div>
      </div>

      <div>
        <span className={`text-lg font-bold uppercase tracking-wider ${rankColor(rank)}`}>
          {rank}
        </span>
        <p className="text-xs text-gray-600 mt-1">{totalBrackets} brackets solved</p>
      </div>

      {/* Stats */}
      {stats.gamesPlayed > 0 && (
        <div className="flex justify-center gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{stats.gamesPlayed}</div>
            <div className="text-xs text-gray-500">Played</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{Math.round(stats.totalScore / stats.gamesPlayed)}</div>
            <div className="text-xs text-gray-500">Avg Score</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{stats.currentStreak}</div>
            <div className="text-xs text-gray-500">Streak</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{stats.maxStreak}</div>
            <div className="text-xs text-gray-500">Max</div>
          </div>
        </div>
      )}

      {/* Event reveal */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 max-w-lg mx-auto text-left">
        <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">The event</div>
        <p className="text-gray-300 leading-relaxed mb-2">{event}</p>
        <p className="text-sm text-gray-500">{date}</p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <button
          onClick={handleShare}
          className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600
                     text-gray-900 font-bold px-8 py-3 rounded-xl
                     text-lg transition-colors"
        >
          {copied ? "Copied!" : "Share Result"}
        </button>
        <p className="text-gray-600 text-sm">
          Next puzzle: tomorrow — {dateStr}
        </p>
      </div>
    </div>
  );
}
