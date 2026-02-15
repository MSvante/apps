import { useState, useRef, useEffect } from "react";
import type { Player } from "../types/match";
import type { SlotState, GuessResult } from "../types/game";
import { getNextHintCost, getHintLabel } from "../utils/scoring";
import { MAX_HINTS, LETTER_REVEAL_COST } from "../constants/scoring";

interface GuessPopupProps {
  player: Player;
  slot: SlotState;
  lastGuessResult: GuessResult;
  onSubmit: (name: string) => void;
  onRequestHint: () => void;
  onRevealLetter: () => void;
  onGiveUpSlot: () => void;
  onClose: () => void;
}

export function GuessPopup({
  player,
  slot,
  lastGuessResult,
  onSubmit,
  onRequestHint,
  onRevealLetter,
  onGiveUpSlot,
  onClose,
}: GuessPopupProps) {
  const [value, setValue] = useState("");
  const [feedbackClass, setFeedbackClass] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (lastGuessResult === "correct") {
      setValue("");
      setFeedbackClass("animate-flash-correct");
    } else if (lastGuessResult === "incorrect") {
      setValue("");
      setFeedbackClass("animate-shake");
    } else if (lastGuessResult === "duplicate") {
      setValue("");
      setFeedbackClass("animate-shake");
    }

    if (lastGuessResult) {
      const timer = setTimeout(() => setFeedbackClass(""), 600);
      return () => clearTimeout(timer);
    }
  }, [lastGuessResult]);

  // Re-focus input after feedback clears
  useEffect(() => {
    inputRef.current?.focus();
  }, [lastGuessResult]);

  // Close on click outside popup
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
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
    lastGuessResult === "correct" ? "text-green-400" : "text-red-400";

  // If player is already guessed, show info only
  if (slot.guessed) {
    return (
      <div
        ref={popupRef}
        className="absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-slide-in w-[90%] max-w-[260px] sm:max-w-[280px]"
      >
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl min-w-[200px]">
          <div className="text-green-400 font-medium text-sm">
            {player.name}
          </div>
          <div className="text-gray-400 text-xs mt-1">
            {player.nationalityFlag} {player.nationality} &middot; Age{" "}
            {player.age} &middot; #{player.shirtNumber}
          </div>
        </div>
      </div>
    );
  }

  // Hint content
  const revealedHints: { label: string; value: string }[] = [];
  if (slot.hintsRevealed >= 1)
    revealedHints.push({
      label: "Nationality",
      value: `${player.nationalityFlag} ${player.nationality}`,
    });
  if (slot.hintsRevealed >= 2)
    revealedHints.push({ label: "Age", value: `${player.age}` });
  if (slot.hintsRevealed >= 3)
    revealedHints.push({ label: "Shirt #", value: `${player.shirtNumber}` });
  if (slot.hintsRevealed >= 4)
    revealedHints.push({
      label: "Starts with",
      value: `${player.lastName[0].toUpperCase()}`,
    });

  const nextCost = getNextHintCost(slot.hintsRevealed);
  const nextLabel = getHintLabel(slot.hintsRevealed + 1);

  // Letter reveal display — only show revealed letters, no placeholders for remaining
  const nameLength = player.lastName.length;
  const canRevealMoreLetters = slot.lettersRevealed < nameLength;
  const letterDisplay = slot.lettersRevealed > 0
    ? player.lastName.slice(0, slot.lettersRevealed) + "…"
    : null;

  return (
    <div
      ref={popupRef}
      className="absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-slide-in w-[90%] max-w-[280px] sm:max-w-[300px]"
    >
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl sm:min-w-[220px]">
        {/* Position label */}
        <div className="text-gray-400 text-xs mb-2 uppercase tracking-wide">
          {player.position}
        </div>

        {/* Revealed hints */}
        {revealedHints.length > 0 && (
          <div className="space-y-1 mb-2">
            {revealedHints.map((h) => (
              <div key={h.label} className="flex justify-between text-xs">
                <span className="text-gray-500">{h.label}</span>
                <span className="text-white">{h.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Letter reveal display */}
        {letterDisplay && (
          <div className="bg-gray-900/80 rounded px-2 py-1.5 mb-2 text-center">
            <span className="text-yellow-300 font-mono text-sm tracking-widest">
              {letterDisplay}
            </span>
          </div>
        )}

        {/* Hint button */}
        {slot.hintsRevealed < MAX_HINTS ? (
          <button
            onClick={onRequestHint}
            className="w-full bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white py-2 sm:py-1 rounded
              text-sm sm:text-xs font-medium transition-colors mb-1.5"
          >
            Reveal {nextLabel} (-{nextCost} pts)
          </button>
        ) : null}

        {/* Reveal letter button */}
        {canRevealMoreLetters ? (
          <button
            onClick={onRevealLetter}
            className="w-full bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-yellow-300 py-2 sm:py-1 rounded
              text-sm sm:text-xs font-medium transition-colors mb-2"
          >
            Reveal letter (-{LETTER_REVEAL_COST} pt)
          </button>
        ) : (
          <div className="text-gray-500 text-xs text-center mb-2">
            All letters revealed
          </div>
        )}

        {/* Guess input */}
        <div className={feedbackClass}>
          <form onSubmit={handleSubmit} className="flex gap-1.5">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Last name..."
              className="flex-1 bg-gray-900 border border-gray-600 rounded px-2 py-2 sm:py-1.5 text-base sm:text-xs
                text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400
                min-w-0"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              data-1p-ignore
            />
            <button
              type="submit"
              disabled={!value.trim()}
              className="bg-yellow-600 hover:bg-yellow-500 active:bg-yellow-400 disabled:bg-gray-700 disabled:text-gray-500
                text-white px-3 py-2 sm:py-1.5 rounded text-sm sm:text-xs font-medium transition-colors
                disabled:cursor-not-allowed shrink-0"
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

        {/* Per-player give up */}
        <button
          onClick={onGiveUpSlot}
          className="w-full text-gray-600 hover:text-gray-400 text-xs transition-colors mt-2 py-1"
        >
          Give up this player
        </button>
      </div>
    </div>
  );
}
