import { useState } from "react";
import type { Player } from "../types/match";
import type { SlotState } from "../types/game";

interface GuessedListProps {
  players: Player[];
  slots: SlotState[];
}

const POSITION_ORDER = { GK: 0, DEF: 1, MID: 2, FWD: 3 } as const;

export function GuessedList({ players, slots }: GuessedListProps) {
  const [open, setOpen] = useState(false);

  const guessedPlayers = players
    .map((player, i) => ({ player, slot: slots[i] }))
    .filter(({ slot }) => slot.guessed)
    .sort(
      (a, b) =>
        POSITION_ORDER[a.player.position] - POSITION_ORDER[b.player.position]
    );

  if (guessedPlayers.length === 0) return null;

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors"
      >
        <span>
          Guessed players{" "}
          <span className="text-gray-500">({guessedPlayers.length})</span>
        </span>
        <span className="text-gray-500 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-3 pb-2 space-y-1">
          {guessedPlayers.map(({ player }) => (
            <div
              key={player.name}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-green-300">{player.name}</span>
              <span className="text-gray-500 uppercase">{player.position}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
