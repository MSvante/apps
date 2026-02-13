import type { Player } from "../types/match";
import type { SlotState, GamePhase } from "../types/game";
import type { SlotPosition } from "../utils/formations";
import { PlayerSlot } from "./PlayerSlot";

interface PitchProps {
  players: Player[];
  slots: SlotState[];
  positions: SlotPosition[];
  selectedSlotIndex: number | null;
  lastGuessedSlotIndex: number | null;
  phase: GamePhase;
  onSelectSlot: (index: number) => void;
}

export function Pitch({
  players,
  slots,
  positions,
  selectedSlotIndex,
  lastGuessedSlotIndex,
  phase,
  onSelectSlot,
}: PitchProps) {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="pitch rounded-lg overflow-hidden" style={{ aspectRatio: "3 / 4" }}>
        {/* Penalty boxes */}
        <div className="pitch-penalty-top" />
        <div className="pitch-penalty-bottom" />

        {/* Player slots */}
        {players.map((player, i) => (
          <PlayerSlot
            key={i}
            player={player}
            slot={slots[i]}
            position={positions[i]}
            index={i}
            isSelected={selectedSlotIndex === i}
            isRevealed={phase === "COMPLETE" && !slots[i].guessed}
            wasJustGuessed={lastGuessedSlotIndex === i}
            onSelect={onSelectSlot}
          />
        ))}
      </div>
    </div>
  );
}
