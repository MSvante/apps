import { useState, useRef, useEffect } from "react";
import type { BracketSegment, BracketState } from "../types/puzzle.ts";
import { getClueText } from "../utils/puzzle.ts";

interface Props {
  bracket: BracketSegment;
  bracketState: BracketState;
  solvingChain: BracketSegment[];
  onGuess: (answer: string) => void;
  onHint: () => void;
}

export default function AnswerInput({ bracket, bracketState, solvingChain, onGuess, onHint }: Props) {
  const [value, setValue] = useState("");
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevWrongGuesses = useRef(bracketState.wrongGuesses);

  useEffect(() => {
    setValue("");
    inputRef.current?.focus();
  }, [bracket.id]);

  useEffect(() => {
    if (bracketState.wrongGuesses > prevWrongGuesses.current) {
      setShake(true);
      setValue("");
      const timer = setTimeout(() => setShake(false), 500);
      prevWrongGuesses.current = bracketState.wrongGuesses;
      return () => clearTimeout(timer);
    }
  }, [bracketState.wrongGuesses]);

  const clueText = getClueText(bracket);
  const hint = bracketState.hintUsed ? bracket.answer[0].toUpperCase() + "..." : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    onGuess(value);
  }

  // The chain goes from deepest (current) to root, so reverse for display
  const displayChain = [...solvingChain].reverse();

  return (
    <div className={`mt-6 animate-slide-up ${shake ? "animate-shake" : ""}`}>
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 space-y-3">
        {/* Solving chain - shows path from sentence down to current bracket */}
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

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Clue</div>
            <div className="text-white font-medium leading-snug">{clueText}</div>
          </div>
          {hint && (
            <div className="shrink-0 bg-amber-400/10 border border-amber-400/30 rounded-lg px-3 py-1.5">
              <div className="text-xs text-amber-400/70 mb-0.5">Starts with</div>
              <div className="text-amber-400 font-bold text-lg leading-none">{hint}</div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Your answer..."
            className="flex-1 bg-gray-900/50 border border-gray-600/50 rounded-lg px-4 py-2.5 text-white
                       placeholder-gray-600
                       focus:outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/30
                       transition-colors"
            autoComplete="off"
          />
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600
                       text-gray-900 font-bold px-5 py-2.5 rounded-lg transition-colors"
          >
            Guess
          </button>
          {!bracketState.hintUsed && (
            <button
              type="button"
              onClick={onHint}
              className="bg-gray-800 hover:bg-gray-700 active:bg-gray-600
                         text-gray-400 hover:text-gray-200
                         px-3 py-2.5 rounded-lg transition-colors text-sm border border-gray-700/50"
              title="Reveal first letter (-15 pts)"
            >
              Hint
            </button>
          )}
        </form>

        {bracketState.wrongGuesses > 0 && (
          <div className="text-xs text-red-400/70">
            {bracketState.wrongGuesses} wrong {bracketState.wrongGuesses === 1 ? "guess" : "guesses"}
          </div>
        )}
      </div>
    </div>
  );
}
