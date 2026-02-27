import type { PuzzleSegment, BracketState } from "../types/puzzle.ts";
import TextSegment from "./TextSegment.tsx";
import BracketSegment from "./BracketSegment.tsx";

interface Props {
  segments: PuzzleSegment[];
  bracketStates: Record<string, BracketState>;
  activeBracketId: string | null;
  onSelect: (id: string) => void;
}

export default function PuzzleSentence({
  segments,
  bracketStates,
  activeBracketId,
  onSelect,
}: Props) {
  return (
    <p className="text-lg md:text-xl leading-relaxed">
      {segments.map((seg, i) =>
        seg.type === "text" ? (
          <TextSegment key={i} value={seg.value} />
        ) : (
          <BracketSegment
            key={seg.id}
            segment={seg}
            bracketStates={bracketStates}
            activeBracketId={activeBracketId}
            onSelect={onSelect}
          />
        ),
      )}
    </p>
  );
}
