import type { Player } from "../types/match";
import type { SlotState } from "../types/game";
import { getNextHintCost, getHintLabel } from "../utils/scoring";
import { MAX_HINTS } from "../constants/scoring";

interface HintPanelProps {
  player: Player;
  slot: SlotState;
  onRequestHint: () => void;
}

export function HintPanel({ player, slot, onRequestHint }: HintPanelProps) {
  if (slot.guessed) {
    return (
      <div className="bg-gray-800 rounded-lg p-3 text-sm">
        <div className="text-green-400 font-medium">{player.name}</div>
        <div className="text-gray-400 text-xs mt-1">
          {player.nationalityFlag} {player.nationality} &middot; Age{" "}
          {player.age} &middot; #{player.shirtNumber}
        </div>
      </div>
    );
  }

  const nextCost = getNextHintCost(slot.hintsRevealed);
  const nextLabel = getHintLabel(slot.hintsRevealed + 1);

  // Show revealed hints
  const revealedHints: { label: string; value: string }[] = [];
  if (slot.hintsRevealed >= 1)
    revealedHints.push({
      label: "Nationality",
      value: `${player.nationalityFlag} ${player.nationality}`,
    });
  if (slot.hintsRevealed >= 2)
    revealedHints.push({ label: "Age", value: `${player.age}` });
  if (slot.hintsRevealed >= 3)
    revealedHints.push({
      label: "Shirt #",
      value: `${player.shirtNumber}`,
    });
  if (slot.hintsRevealed >= 4)
    revealedHints.push({
      label: "Starts with",
      value: `${player.lastName[0].toUpperCase()}`,
    });

  return (
    <div className="bg-gray-800 rounded-lg p-3 text-sm">
      <div className="text-gray-400 text-xs mb-2 uppercase tracking-wide">
        {player.position} &middot; Hints
      </div>

      {revealedHints.length > 0 && (
        <div className="space-y-1 mb-2">
          {revealedHints.map((h) => (
            <div key={h.label} className="flex justify-between">
              <span className="text-gray-500">{h.label}</span>
              <span className="text-white">{h.value}</span>
            </div>
          ))}
        </div>
      )}

      {slot.hintsRevealed < MAX_HINTS ? (
        <button
          onClick={onRequestHint}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white py-1.5 rounded
            text-xs font-medium transition-colors"
        >
          Reveal {nextLabel} (-{nextCost} pts)
        </button>
      ) : (
        <div className="text-gray-500 text-xs text-center">
          All hints revealed
        </div>
      )}
    </div>
  );
}
