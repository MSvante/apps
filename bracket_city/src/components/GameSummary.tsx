import { getRank } from "../utils/scoring.ts";
import { INITIAL_SCORE } from "../constants/scoring.ts";

interface Props {
  score: number;
  event: string;
  date: string;
  onPlayAgain: () => void;
}

export default function GameSummary({ score, event, date, onPlayAgain }: Props) {
  const rank = getRank(score);

  return (
    <div className="text-center space-y-6 py-8">
      <h2 className="text-3xl font-bold text-amber-400">Puzzle Complete!</h2>

      <div className="space-y-1">
        <p className="text-5xl font-bold text-white">
          {score}/{INITIAL_SCORE}
        </p>
        <p className="text-xl text-gray-400">
          Rank: <span className="text-amber-400 font-bold">{rank}</span>
        </p>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-5 max-w-lg mx-auto">
        <p className="text-sm text-gray-500 mb-1">{date}</p>
        <p className="text-gray-300 leading-relaxed">{event}</p>
      </div>

      <button
        onClick={onPlayAgain}
        className="bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold px-8 py-3 rounded-xl
                   text-lg transition-colors"
      >
        Play Again
      </button>
    </div>
  );
}
