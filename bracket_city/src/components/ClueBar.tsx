import type { BracketSegment, BracketState } from "../types/puzzle.ts";
import { getClueText } from "../utils/puzzle.ts";
import { PEEK_PENALTY, REVEAL_PENALTY } from "../constants/scoring.ts";

interface Props {
  bracket: BracketSegment;
  bracketState: BracketState;
  solvingChain: BracketSegment[];
  onPeek: () => void;
  onReveal: () => void;
}

/**
 * Compact bar pinned under the sentence. Shows the active bracket's clue and
 * the Peek / Reveal assists. Typing happens inline in the sentence, not here.
 */
export default function ClueBar({ bracket, bracketState, solvingChain, onPeek, onReveal }: Props) {
  const clueText = getClueText(bracket);

  // The chain goes from deepest (current) to root, so reverse for display.
  const displayChain = [...solvingChain].reverse();

  return (
    <div className="mt-6 animate-slide-up">
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 space-y-3">
        {/* Solving chain — path from the sentence down to the current bracket */}
        {displayChain.length > 1 && (
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            {displayChain.map((seg, i) => {
              const isCurrent = i === displayChain.length - 1;
              return (
                <span key={seg.id} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-gray-600">&rsaquo;</span>}
                  <span className={
                    isCurrent
                      ? "bg-amber-400/15 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded font-medium"
                      : "text-gray-500 bg-gray-800 px-2 py-0.5 rounded border border-gray-700/50"
                  }>
                    {"_".repeat(Math.min(seg.answer.length, 6))}
                  </span>
                </span>
              );
            })}
          </div>
        )}

        <div>
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Clue</div>
          <div className="text-white font-medium leading-snug">{clueText}</div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            Type your answer in the sentence, then press <kbd className="text-gray-400">Enter</kbd>.
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={onPeek}
              disabled={bracketState.peeked}
              className="bg-gray-800 hover:bg-gray-700 active:bg-gray-600
                         text-gray-300 hover:text-white
                         disabled:opacity-40 disabled:cursor-default
                         px-3 py-1.5 rounded-lg transition-colors text-sm border border-gray-700/50"
              title={`Reveal the first letter (-${PEEK_PENALTY} pts)`}
            >
              👀 Peek
            </button>
            <button
              type="button"
              onClick={onReveal}
              className="bg-gray-800 hover:bg-gray-700 active:bg-gray-600
                         text-gray-300 hover:text-white
                         px-3 py-1.5 rounded-lg transition-colors text-sm border border-gray-700/50"
              title={`Reveal the full answer and move on (-${REVEAL_PENALTY} pts)`}
            >
              💡 Reveal
            </button>
          </div>
        </div>

        {bracketState.wrongGuesses > 0 && (
          <div className="text-xs text-red-400/70">
            {bracketState.wrongGuesses} wrong {bracketState.wrongGuesses === 1 ? "guess" : "guesses"}
          </div>
        )}
      </div>
    </div>
  );
}
