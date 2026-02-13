import type { SlotState } from "../types/game";
import { MAX_SCORE } from "../constants/scoring";

interface ScoreBoardProps {
  score: number;
  slots: SlotState[];
}

export function ScoreBoard({ score, slots }: ScoreBoardProps) {
  const guessed = slots.filter((s) => s.guessed).length;

  return (
    <div className="flex items-center justify-between text-sm px-2 py-2 bg-gray-800 rounded-lg">
      <div className="text-gray-400">
        <span className="text-white font-bold">{guessed}</span>/11 guessed
      </div>
      <div className="text-gray-400">
        Score:{" "}
        <span className="text-white font-bold">{score}</span>
        <span className="text-gray-600">/{MAX_SCORE}</span>
      </div>
    </div>
  );
}
