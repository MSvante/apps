import { useMemo } from "react";
import { useGame } from "../hooks/useGame";
import { getFormationPositions } from "../utils/formations";
import { MatchHeader } from "./MatchHeader";
import { ScoreBoard } from "./ScoreBoard";
import { Pitch } from "./Pitch";
import { GuessInput } from "./GuessInput";
import { HintPanel } from "./HintPanel";
import { GameSummary } from "./GameSummary";

export function GameContainer() {
  const {
    state,
    newGame,
    selectSlot,
    submitGuess,
    requestHint,
    giveUp,
    clearFeedback,
  } = useGame();

  const positions = useMemo(
    () => getFormationPositions(state.lineup.formation),
    [state.lineup.formation]
  );

  const handleSelectSlot = (index: number) => {
    if (state.phase === "COMPLETE") return;
    selectSlot(state.selectedSlotIndex === index ? null : index);
  };

  const handleSubmitGuess = (name: string) => {
    clearFeedback();
    // Small delay so React clears previous feedback first
    setTimeout(() => submitGuess(name), 0);
  };

  const selectedPlayer =
    state.selectedSlotIndex !== null
      ? state.lineup.players[state.selectedSlotIndex]
      : null;
  const selectedSlot =
    state.selectedSlotIndex !== null
      ? state.slots[state.selectedSlotIndex]
      : null;

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
      <MatchHeader match={state.match} team={state.team} />

      <ScoreBoard score={state.score} slots={state.slots} />

      <Pitch
        players={state.lineup.players}
        slots={state.slots}
        positions={positions}
        selectedSlotIndex={state.selectedSlotIndex}
        lastGuessedSlotIndex={state.lastGuessedSlotIndex}
        phase={state.phase}
        onSelectSlot={handleSelectSlot}
      />

      {state.phase === "PLAYING" && (
        <>
          <GuessInput
            onSubmit={handleSubmitGuess}
            lastGuessResult={state.lastGuessResult}
            disabled={false}
          />

          {selectedPlayer && selectedSlot && (
            <HintPanel
              player={selectedPlayer}
              slot={selectedSlot}
              onRequestHint={requestHint}
            />
          )}

          <div className="text-center">
            <button
              onClick={giveUp}
              className="text-gray-600 hover:text-gray-400 text-xs transition-colors"
            >
              Give Up
            </button>
          </div>
        </>
      )}

      {state.phase === "COMPLETE" && (
        <GameSummary
          players={state.lineup.players}
          slots={state.slots}
          score={state.score}
          onPlayAgain={newGame}
        />
      )}
    </div>
  );
}
