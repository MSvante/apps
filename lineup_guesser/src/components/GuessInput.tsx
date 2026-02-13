import { useState, useRef, useEffect } from "react";
import type { GuessResult } from "../types/game";

interface GuessInputProps {
  onSubmit: (name: string) => void;
  lastGuessResult: GuessResult;
  disabled: boolean;
}

export function GuessInput({
  onSubmit,
  lastGuessResult,
  disabled,
}: GuessInputProps) {
  const [value, setValue] = useState("");
  const [feedbackClass, setFeedbackClass] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (lastGuessResult === "correct") {
      setValue("");
      setFeedbackClass("animate-flash-correct");
    } else if (lastGuessResult === "incorrect") {
      setFeedbackClass("animate-shake");
    } else if (lastGuessResult === "duplicate") {
      setFeedbackClass("animate-shake");
    }

    if (lastGuessResult) {
      const timer = setTimeout(() => setFeedbackClass(""), 600);
      return () => clearTimeout(timer);
    }
  }, [lastGuessResult]);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled, lastGuessResult]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSubmit(value.trim());
    }
  };

  const feedbackMessage =
    lastGuessResult === "correct"
      ? "Correct!"
      : lastGuessResult === "incorrect"
        ? "Not in the lineup"
        : lastGuessResult === "duplicate"
          ? "Already guessed"
          : null;

  const feedbackColor =
    lastGuessResult === "correct"
      ? "text-green-400"
      : "text-red-400";

  return (
    <div className={`${feedbackClass}`}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type a player's last name..."
          disabled={disabled}
          className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm
            text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400
            disabled:opacity-50 disabled:cursor-not-allowed"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:text-gray-500
            text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors
            disabled:cursor-not-allowed"
        >
          Guess
        </button>
      </form>
      {feedbackMessage && (
        <div className={`text-xs mt-1 ${feedbackColor} animate-slide-in`}>
          {feedbackMessage}
        </div>
      )}
    </div>
  );
}
