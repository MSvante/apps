import type { Player } from "../types/match";
import type { SlotState, GamePhase, GuessResult } from "../types/game";
import type { SlotPosition } from "../utils/formations";
import { PlayerSlot } from "./PlayerSlot";
import { GuessPopup } from "./GuessPopup";

interface PitchProps {
  players: Player[];
  slots: SlotState[];
  positions: SlotPosition[];
  selectedSlotIndex: number | null;
  lastGuessedSlotIndex: number | null;
  lastGuessResult: GuessResult;
  phase: GamePhase;
  onSelectSlot: (index: number) => void;
  onSubmitGuess: (name: string) => void;
  onRequestHint: () => void;
  onGiveUpSlot: () => void;
  onClosePopup: () => void;
}

export function Pitch({
  players,
  slots,
  positions,
  selectedSlotIndex,
  lastGuessedSlotIndex,
  lastGuessResult,
  phase,
  onSelectSlot,
  onSubmitGuess,
  onRequestHint,
  onGiveUpSlot,
  onClosePopup,
}: PitchProps) {
  const selectedPlayer =
    selectedSlotIndex !== null ? players[selectedSlotIndex] : null;
  const selectedSlot =
    selectedSlotIndex !== null ? slots[selectedSlotIndex] : null;

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="pitch rounded-lg overflow-hidden relative aspect-[3/4.3] sm:aspect-[3/4]">
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
            isRevealed={phase === "COMPLETE" && !slots[i].guessed && !slots[i].givenUp}
            wasJustGuessed={lastGuessedSlotIndex === i}
            onSelect={onSelectSlot}
          />
        ))}

        {/* Guess popup overlay */}
        {phase === "PLAYING" &&
          selectedPlayer &&
          selectedSlot &&
          !selectedSlot.givenUp && (
            <GuessPopup
              player={selectedPlayer}
              slot={selectedSlot}
              lastGuessResult={lastGuessResult}
              onSubmit={onSubmitGuess}
              onRequestHint={onRequestHint}
              onGiveUpSlot={onGiveUpSlot}
              onClose={onClosePopup}
            />
          )}
      </div>
    </div>
  );
}
