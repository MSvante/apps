import type { Puzzle, BracketSegment as BracketSegmentType } from "../types/puzzle.ts";
import type { Performance } from "../constants/scoring.ts";
import { useGame } from "../hooks/useGame.ts";
import { collectBrackets, buildSolvingChain, puzzleDifficulty } from "../utils/puzzle.ts";
import { getRank } from "../utils/scoring.ts";
import { getDailyPuzzle, loadDailyState, puzzleNumber, formatDate } from "../utils/daily.ts";
import PuzzleSentence from "./PuzzleSentence.tsx";
import ClueBar from "./ClueBar.tsx";
import ScoreBar from "./ScoreBar.tsx";
import GameSummary from "./GameSummary.tsx";
import puzzlesData from "../data/puzzles.json";

const puzzleMap = puzzlesData as Record<string, Puzzle[]>;

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

/** Find the top-level bracket that contains a given bracket ID. */
function findRootBracket(segments: Puzzle["segments"], targetId: string): BracketSegmentType | null {
  for (const seg of segments) {
    if (seg.type === "bracket") {
      if (seg.id === targetId) return seg;
      if (Array.isArray(seg.clue)) {
        const found = findBracket(seg.clue, targetId);
        if (found) return seg;
      }
    }
  }
  return null;
}

export default function GameContainer() {
  const today = new Date();
  const puzzle = getDailyPuzzle(puzzleMap, today);
  const savedState = loadDailyState();

  if (!puzzle) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-gray-400 text-lg">No puzzle available for today.</p>
        <p className="text-gray-600 text-sm">Check back tomorrow!</p>
      </div>
    );
  }

  return (
    <DailyGame
      puzzle={puzzle}
      savedState={savedState}
      puzzleNum={puzzleNumber(today)}
      dateStr={formatDate(today)}
    />
  );
}

function DailyGame({
  puzzle,
  savedState,
  puzzleNum,
  dateStr,
}: {
  puzzle: Puzzle;
  savedState: ReturnType<typeof loadDailyState>;
  puzzleNum: number;
  dateStr: string;
}) {
  const { state, selectBracket, guess, peek, reveal } = useGame(puzzle, savedState);
  const { phase, brackets, activeBracketId, score } = state;

  const allBrackets = collectBrackets(puzzle.segments);
  const solvedCount = allBrackets.filter((b) => brackets[b.id]?.solved).length;
  const activeBracket = activeBracketId
    ? findBracket(puzzle.segments, activeBracketId)
    : null;

  const difficulty = puzzleDifficulty(puzzle.segments);
  const perf: Performance = {
    score,
    wrongGuesses: allBrackets.reduce((n, b) => n + (brackets[b.id]?.wrongGuesses ?? 0), 0),
    peeks: allBrackets.filter((b) => brackets[b.id]?.peeked).length,
    reveals: allBrackets.filter((b) => brackets[b.id]?.revealed).length,
  };
  const rank = getRank(perf);

  // Build solving chain: find the root bracket containing the active bracket
  // and trace the path from deepest to root
  let solvingChain: BracketSegmentType[] = [];
  if (activeBracket && activeBracketId) {
    const root = findRootBracket(puzzle.segments, activeBracketId);
    if (root && root.id !== activeBracketId) {
      solvingChain = buildSolvingChain(root, activeBracketId, brackets);
    }
  }

  if (phase === "COMPLETE") {
    return (
      <GameSummary
        score={score}
        rank={rank}
        perf={perf}
        difficulty={difficulty}
        event={puzzle.event}
        date={puzzle.date}
        dateStr={dateStr}
      />
    );
  }

  return (
    <div className="space-y-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
          #{puzzleNum}
        </span>
        <span className="text-xs text-gray-500">{dateStr}</span>
      </div>

      <ScoreBar
        score={score}
        rank={rank}
        difficulty={difficulty}
        solvedCount={solvedCount}
        totalCount={allBrackets.length}
      />

      <div className="bg-gray-900/40 rounded-xl p-5 md:p-8">
        <PuzzleSentence
          segments={puzzle.segments}
          bracketStates={brackets}
          activeBracketId={activeBracketId}
          onSelect={selectBracket}
          onGuess={guess}
        />

        {activeBracket && (
          <ClueBar
            bracket={activeBracket}
            bracketState={brackets[activeBracketId!]}
            solvingChain={solvingChain}
            onPeek={peek}
            onReveal={reveal}
          />
        )}

        {!activeBracket && (
          <p className="mt-6 text-center text-gray-600 text-sm">
            Tap a colored bracket to start solving
          </p>
        )}
      </div>
    </div>
  );
}
