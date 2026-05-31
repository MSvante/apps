import type { BracketSegment as BracketSegmentType, BracketState } from "../types/puzzle.ts";
import { isSolvable, findDeepestSolvable, nestingDepth } from "../utils/puzzle.ts";
import InlineAnswerInput from "./InlineAnswerInput.tsx";

const DEPTH_COLORS = [
  { border: "border-amber-400/70", bg: "bg-amber-400/8", text: "text-amber-300" },
  { border: "border-sky-400/70", bg: "bg-sky-400/8", text: "text-sky-300" },
  { border: "border-pink-400/70", bg: "bg-pink-400/8", text: "text-pink-300" },
  { border: "border-emerald-400/70", bg: "bg-emerald-400/8", text: "text-emerald-300" },
];

interface Props {
  segment: BracketSegmentType;
  bracketStates: Record<string, BracketState>;
  activeBracketId: string | null;
  onSelect: (id: string) => void;
  onGuess: (answer: string) => void;
  depth?: number;
}

export default function BracketSegment({
  segment,
  bracketStates,
  activeBracketId,
  onSelect,
  onGuess,
  depth = 0,
}: Props) {
  const state = bracketStates[segment.id];
  if (!state) return null;

  if (state.solved) {
    return (
      <span className={`font-bold solved-pop fill-in ${state.revealed ? "text-amber-300/80" : "text-emerald-400"}`}>
        {segment.answer}
      </span>
    );
  }

  const solvable = isSolvable(segment, bracketStates);
  const isActive = activeBracketId === segment.id;
  const color = DEPTH_COLORS[depth % DEPTH_COLORS.length];

  if (solvable) {
    // Active bracket: the inline input takes its place so the sentence is the
    // typing surface and visibly fills in on a correct answer.
    if (isActive) {
      return (
        <span
          className={`
            inline-flex items-baseline rounded-md border-b-2 px-1.5 py-0.5 mx-0.5
            ${color.border} ${color.bg} bracket-active ring-1 ring-amber-400/50 ${color.text}
          `}
        >
          [
          <InlineAnswerInput
            key={segment.id}
            bracket={segment}
            bracketState={state}
            onGuess={onGuess}
          />
          ]
        </span>
      );
    }

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
          inline cursor-pointer rounded-md border-b-2 px-1.5 py-0.5 mx-0.5
          ${color.border} ${color.bg}
          bracket-solvable text-gray-300 hover:text-white
        `}
      >
        [{clueText}]
      </span>
    );
  }

  // Not solvable — show as a compact locked blank
  // Clicking drills down to the deepest solvable bracket inside
  const layers = nestingDepth(segment, bracketStates);
  const hasSolvableInside = findDeepestSolvable(segment, bracketStates) !== null;

  function handleClick() {
    const deepest = findDeepestSolvable(segment, bracketStates);
    if (deepest) onSelect(deepest);
  }

  return (
    <span
      role={hasSolvableInside ? "button" : undefined}
      tabIndex={hasSolvableInside ? 0 : undefined}
      onClick={hasSolvableInside ? handleClick : undefined}
      onKeyDown={hasSolvableInside ? (e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      } : undefined}
      className={`
        inline rounded-md px-1.5 py-0.5 mx-0.5
        border-b-2 border-dashed border-gray-600/50
        bg-gray-800/30 text-gray-500
        ${hasSolvableInside ? "cursor-pointer hover:bg-gray-700/30 hover:text-gray-400 transition-colors" : ""}
      `}
    >
      {"_".repeat(Math.min(segment.answer.length, 8))}
      {layers > 1 && (
        <span className="text-xs text-gray-600 ml-1" title={`${layers} layers deep`}>
          {"·".repeat(Math.min(layers, 5))}
        </span>
      )}
    </span>
  );
}
