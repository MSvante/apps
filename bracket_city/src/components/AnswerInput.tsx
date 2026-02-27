import { useState, useRef, useEffect } from "react";
import type { BracketSegment, BracketState } from "../types/puzzle.ts";
import { getClueText } from "../utils/puzzle.ts";

interface Props {
  bracket: BracketSegment;
  bracketState: BracketState;
  onGuess: (answer: string) => void;
  onHint: () => void;
}

export default function AnswerInput({ bracket, bracketState, onGuess, onHint }: Props) {
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

  return (
    <div className={`mt-6 ${shake ? "animate-shake" : ""}`}>
      <div className="text-sm text-gray-400 mb-2">
        Clue: <span className="text-white font-medium">{clueText}</span>
      </div>
      {hint && (
        <div className="text-sm text-amber-400 mb-2">
          Starts with: <span className="font-bold">{hint}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type your answer..."
          className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white
                     focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          autoComplete="off"
        />
        <button
          type="submit"
          className="bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold px-5 py-2 rounded-lg transition-colors"
        >
          Guess
        </button>
        {!bracketState.hintUsed && (
          <button
            type="button"
            onClick={onHint}
            className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Hint (-15)
          </button>
        )}
      </form>
    </div>
  );
}
