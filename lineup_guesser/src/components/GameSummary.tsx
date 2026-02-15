import type { Player } from "../types/match";
import type { SlotState } from "../types/game";
import { calculateSlotScore } from "../utils/scoring";
import { MAX_SCORE } from "../constants/scoring";

interface GameSummaryProps {
  players: Player[];
  slots: SlotState[];
  score: number;
  onPlayAgain: () => void;
}

export function GameSummary({
  players,
  slots,
  score,
  onPlayAgain,
}: GameSummaryProps) {
  const guessedCount = slots.filter((s) => s.guessed).length;
  const givenUpCount = slots.filter((s) => s.givenUp).length;
  const percentage = Math.round((score / MAX_SCORE) * 100);

  let message = "Better luck next time!";
  if (guessedCount === 11 && score === MAX_SCORE) message = "Perfect score!";
  else if (guessedCount === 11) message = "You got them all!";
  else if (guessedCount >= 8) message = "Great effort!";
  else if (guessedCount >= 5) message = "Not bad!";

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-3">
      <div className="text-center">
        <div className="text-2xl font-bold text-white">{score}<span className="text-gray-500 text-lg">/{MAX_SCORE}</span></div>
        <div className="text-sm text-gray-400">
          {guessedCount}/11 guessed{givenUpCount > 0 && ` · ${givenUpCount} given up`} &middot; {percentage}%
        </div>
        <div className="text-yellow-400 font-medium mt-1">{message}</div>
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto">
        {players.map((player, i) => {
          const slot = slots[i];
          const pts = slot.guessed ? calculateSlotScore(slot.hintsRevealed, slot.lettersRevealed) : 0;

          return (
            <div
              key={i}
              className={`flex items-center justify-between text-xs px-2 py-1 rounded ${
                slot.guessed ? "bg-green-900/30" : "bg-red-900/30"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-6">{player.position}</span>
                <span
                  className={
                    slot.guessed ? "text-green-300" : "text-red-300"
                  }
                >
                  {player.name}
                </span>
                {slot.givenUp && (
                  <span className="text-gray-600 text-[10px]">gave up</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {(slot.hintsRevealed > 0 || slot.lettersRevealed > 0) && (
                  <span className="text-gray-600">
                    {slot.hintsRevealed > 0 && `${slot.hintsRevealed} hint${slot.hintsRevealed > 1 ? "s" : ""}`}
                    {slot.hintsRevealed > 0 && slot.lettersRevealed > 0 && ", "}
                    {slot.lettersRevealed > 0 && `${slot.lettersRevealed} letter${slot.lettersRevealed > 1 ? "s" : ""}`}
                  </span>
                )}
                <span
                  className={`font-mono ${
                    slot.guessed ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {pts > 0 ? `+${pts}` : "0"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onPlayAgain}
        className="w-full bg-yellow-600 hover:bg-yellow-500 text-white py-2 rounded-lg
          font-medium transition-colors"
      >
        Play Again
      </button>
    </div>
  );
}
