import { useState } from "react";
import type { GuessEntry } from "../types/game";

interface GuessHistoryProps {
  guessHistory: GuessEntry[];
}

const RESULT_STYLE: Record<GuessEntry["result"], string> = {
  correct: "text-green-400",
  incorrect: "text-red-400",
  duplicate: "text-gray-500",
};

const RESULT_LABEL: Record<GuessEntry["result"], string> = {
  correct: "Correct",
  incorrect: "Wrong",
  duplicate: "Duplicate",
};

export function GuessedList({ guessHistory }: GuessHistoryProps) {
  const [open, setOpen] = useState(false);

  const filtered = guessHistory.filter((e) => e.result !== "duplicate");

  if (filtered.length === 0) return null;

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors"
      >
        <span>
          Guess history{" "}
          <span className="text-gray-500">({filtered.length})</span>
        </span>
        <span className="text-gray-500 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-3 pb-2 space-y-1 max-h-40 overflow-y-auto">
          {[...filtered].reverse().map((entry, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-white">{entry.name}</span>
              <span className={RESULT_STYLE[entry.result]}>
                {RESULT_LABEL[entry.result]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
