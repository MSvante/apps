import type { BracketSegment as BracketSegmentType, BracketState } from "../types/puzzle.ts";
import { isSolvable } from "../utils/puzzle.ts";
import TextSegment from "./TextSegment.tsx";

const DEPTH_COLORS = [
  "border-amber-400 bg-amber-400/10",
  "border-sky-400 bg-sky-400/10",
  "border-pink-400 bg-pink-400/10",
  "border-emerald-400 bg-emerald-400/10",
];

interface Props {
  segment: BracketSegmentType;
  bracketStates: Record<string, BracketState>;
  activeBracketId: string | null;
  onSelect: (id: string) => void;
  depth?: number;
}

export default function BracketSegment({
  segment,
  bracketStates,
  activeBracketId,
  onSelect,
  depth = 0,
}: Props) {
  const state = bracketStates[segment.id];
  if (!state) return null;

  // Solved — show answer word with green styling
  if (state.solved) {
    return (
      <span className="font-bold text-emerald-400 transition-all duration-300 solved-flash">
        {segment.answer}
      </span>
    );
  }

  const solvable = isSolvable(segment, bracketStates);
  const isActive = activeBracketId === segment.id;
  const colorClass = DEPTH_COLORS[depth % DEPTH_COLORS.length];

  // Solvable — clickable bracket
  if (solvable) {
    const clueText =
      typeof segment.clue === "string"
        ? segment.clue
        : segment.clue
            .map((child) =>
              child.type === "text" ? child.value : child.answer,
            )
            .join("");

    return (
      <span
        role="button"
        tabIndex={0}
        onClick={() => onSelect(segment.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onSelect(segment.id);
        }}
        className={`
          inline cursor-pointer rounded border-2 px-1.5 py-0.5 mx-0.5 transition-all duration-200
          ${colorClass}
          ${isActive ? "ring-2 ring-white/60 scale-105" : "hover:brightness-125"}
          ${!isActive ? "animate-pulse-subtle" : ""}
        `}
      >
        {clueText}
      </span>
    );
  }

  // Not solvable — render children recursively
  return (
    <span
      className="inline rounded border-2 border-dashed border-gray-600 px-1 py-0.5 mx-0.5 opacity-70"
    >
      {Array.isArray(segment.clue)
        ? segment.clue.map((child, i) =>
            child.type === "text" ? (
              <TextSegment key={i} value={child.value} />
            ) : (
              <BracketSegment
                key={child.id}
                segment={child}
                bracketStates={bracketStates}
                activeBracketId={activeBracketId}
                onSelect={onSelect}
                depth={depth + 1}
              />
            ),
          )
        : segment.clue}
    </span>
  );
}
