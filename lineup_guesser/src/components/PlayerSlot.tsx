import { useEffect, useState } from "react";
import type { Player } from "../types/match";
import type { SlotState } from "../types/game";
import type { SlotPosition } from "../utils/formations";

interface PlayerSlotProps {
  player: Player;
  slot: SlotState;
  position: SlotPosition;
  index: number;
  isSelected: boolean;
  isRevealed: boolean; // true when game is complete and slot wasn't guessed
  wasJustGuessed: boolean;
  onSelect: (index: number) => void;
}

export function PlayerSlot({
  player,
  slot,
  position,
  index,
  isSelected,
  isRevealed,
  wasJustGuessed,
  onSelect,
}: PlayerSlotProps) {
  const [flashClass, setFlashClass] = useState("");

  useEffect(() => {
    if (wasJustGuessed) {
      setFlashClass("animate-flash-correct");
      const timer = setTimeout(() => setFlashClass(""), 600);
      return () => clearTimeout(timer);
    }
  }, [wasJustGuessed]);

  const showName = slot.guessed || isRevealed;

  let bgClass = "bg-gray-700/80 border-gray-600";
  if (slot.guessed) {
    bgClass = "bg-green-900/80 border-green-500";
  } else if (isRevealed) {
    bgClass = "bg-red-900/60 border-red-500/50";
  } else if (isSelected) {
    bgClass = "bg-yellow-900/80 border-yellow-400";
  }

  // Hint badges
  const hints: string[] = [];
  if (slot.hintsRevealed >= 1) hints.push(player.nationalityFlag);
  if (slot.hintsRevealed >= 2) hints.push(`${player.age}y`);
  if (slot.hintsRevealed >= 3) hints.push(`#${player.shirtNumber}`);
  if (slot.hintsRevealed >= 4)
    hints.push(`${player.lastName[0].toUpperCase()}...`);

  return (
    <div
      className={`absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2 cursor-pointer select-none`}
      style={{ top: `${position.top}%`, left: `${position.left}%` }}
      onClick={() => onSelect(index)}
    >
      <div
        className={`
          w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center
          text-[10px] sm:text-xs font-bold transition-all duration-200
          ${bgClass} ${flashClass}
        `}
      >
        {showName ? (
          <span className="text-center leading-tight px-0.5 truncate max-w-[3rem] sm:max-w-[3.5rem]">
            {player.lastName.length > 8
              ? player.lastName.slice(0, 7) + "."
              : player.lastName}
          </span>
        ) : (
          <span className="text-gray-400 text-[9px] sm:text-[10px]">
            {player.position}
          </span>
        )}
      </div>

      {/* Hint badges below the circle */}
      {hints.length > 0 && !showName && (
        <div className="flex gap-0.5 mt-0.5 animate-slide-in">
          {hints.map((hint, i) => (
            <span
              key={i}
              className="text-[8px] sm:text-[9px] bg-gray-800/90 px-1 rounded text-gray-300"
            >
              {hint}
            </span>
          ))}
        </div>
      )}

      {/* Show full name below when guessed/revealed */}
      {showName && (
        <div
          className={`text-[8px] sm:text-[10px] mt-0.5 font-medium text-center whitespace-nowrap ${
            slot.guessed ? "text-green-300" : "text-red-300"
          }`}
        >
          {player.name}
        </div>
      )}
    </div>
  );
}
