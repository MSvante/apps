import { useMemo } from "react";
import { useGame } from "../hooks/useGame";
import { getFormationPositions } from "../utils/formations";
import { MatchHeader } from "./MatchHeader";
import { ScoreBoard } from "./ScoreBoard";
import { Pitch } from "./Pitch";
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

  const handleClosePopup = () => {
    selectSlot(null);
  };

  return (
    <div className="max-w-lg mx-auto px-3 sm:px-4 py-2 sm:py-4 space-y-2 sm:space-y-3">
      <MatchHeader match={state.match} team={state.team} />

      <ScoreBoard score={state.score} slots={state.slots} />

      <Pitch
        players={state.lineup.players}
        slots={state.slots}
        positions={positions}
        selectedSlotIndex={state.selectedSlotIndex}
        lastGuessedSlotIndex={state.lastGuessedSlotIndex}
        lastGuessResult={state.lastGuessResult}
        phase={state.phase}
        onSelectSlot={handleSelectSlot}
        onSubmitGuess={handleSubmitGuess}
        onRequestHint={requestHint}
        onClosePopup={handleClosePopup}
      />

      {state.phase === "PLAYING" && (
        <div className="text-center">
          <button
            onClick={giveUp}
            className="text-gray-600 hover:text-gray-400 text-xs transition-colors"
          >
            Give Up
          </button>
        </div>
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
