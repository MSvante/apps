import { useState } from "react";
import type { Puzzle, BracketSegment as BracketSegmentType } from "../types/puzzle.ts";
import { useGame, pickPuzzle } from "../hooks/useGame.ts";
import { collectBrackets } from "../utils/puzzle.ts";
import PuzzleSentence from "./PuzzleSentence.tsx";
import AnswerInput from "./AnswerInput.tsx";
import ScoreBar from "./ScoreBar.tsx";
import GameSummary from "./GameSummary.tsx";
import puzzlesData from "../data/puzzles.json";

const puzzles = puzzlesData as Puzzle[];

function findBracket(segments: Puzzle["segments"], id: string): BracketSegmentType | null {
  for (const seg of segments) {
    if (seg.type === "bracket") {
      if (seg.id === id) return seg;
      if (Array.isArray(seg.clue)) {
        const found = findBracket(seg.clue, id);
        if (found) return found;
      }
    }
  }
  return null;
}

export default function GameContainer() {
  const [currentPuzzle] = useState(() => pickPuzzle(puzzles)!);
  const { state, selectBracket, guess, useHint, newPuzzle } = useGame(currentPuzzle);
  const { phase, puzzle, brackets, activeBracketId, score } = state;

  const allBrackets = collectBrackets(puzzle.segments);
  const solvedCount = allBrackets.filter((b) => brackets[b.id]?.solved).length;
  const activeBracket = activeBracketId
    ? findBracket(puzzle.segments, activeBracketId)
    : null;

  function handlePlayAgain() {
    const next = pickPuzzle(puzzles);
    if (next) newPuzzle(next);
  }

  if (phase === "COMPLETE") {
    return (
      <GameSummary
        score={score}
        event={puzzle.event}
        date={puzzle.date}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  return (
    <div>
      <ScoreBar score={score} solvedCount={solvedCount} totalCount={allBrackets.length} />

      <div className="bg-gray-800/30 rounded-xl p-5 md:p-8">
        <PuzzleSentence
          segments={puzzle.segments}
          bracketStates={brackets}
          activeBracketId={activeBracketId}
          onSelect={selectBracket}
        />

        {activeBracket && (
          <AnswerInput
            bracket={activeBracket}
            bracketState={brackets[activeBracketId!]}
            onGuess={guess}
            onHint={useHint}
          />
        )}

        {!activeBracket && (
          <p className="mt-6 text-gray-500 text-sm italic">
            Click a highlighted bracket to start solving.
          </p>
        )}
      </div>
    </div>
  );
}
