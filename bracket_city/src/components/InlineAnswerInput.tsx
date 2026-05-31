import { useState, useRef, useEffect } from "react";
import type { BracketSegment, BracketState } from "../types/puzzle.ts";

interface Props {
  bracket: BracketSegment;
  bracketState: BracketState;
  onGuess: (answer: string) => void;
}

/**
 * The answer field rendered *inline* in the sentence, in place of the active
 * bracket. Typing happens here so the sentence visibly assembles as you solve.
 */
export default function InlineAnswerInput({ bracket, bracketState, onGuess }: Props) {
  const [value, setValue] = useState("");
  const [shake, setShake] = useState(false);
  const [prevWrongGuesses, setPrevWrongGuesses] = useState(bracketState.wrongGuesses);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus when mounted for the active bracket. This component remounts per
  // bracket (keyed in BracketSegment), so a mount effect is enough.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Shake and clear on a wrong guess. Adjust state during render (the pattern
  // React recommends over an effect) and reset when the animation finishes.
  if (bracketState.wrongGuesses > prevWrongGuesses) {
    setPrevWrongGuesses(bracketState.wrongGuesses);
    setShake(true);
    setValue("");
  }

  const peekHint = bracketState.peeked ? bracket.answer[0].toUpperCase() : null;

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (value.trim()) onGuess(value);
    }
    // Don't let Space bubble up to the bracket's keyboard handler.
    e.stopPropagation();
  }

  return (
    <span
      className={`inline-flex items-baseline ${shake ? "animate-shake" : ""}`}
      onAnimationEnd={() => setShake(false)}
    >
      {peekHint && (
        <span className="text-amber-400 font-bold mr-0.5">{peekHint}</span>
      )}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        size={Math.max(value.length + 1, 8)}
        placeholder="…"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Your answer"
        className="bg-transparent text-amber-200 font-semibold
                   placeholder-amber-300/40 outline-none
                   border-b border-amber-300/60 focus:border-amber-300
                   px-0.5 min-w-0"
      />
    </span>
  );
}
