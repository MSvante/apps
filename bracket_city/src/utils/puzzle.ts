import type { PuzzleSegment, BracketSegment, BracketState } from "../types/puzzle.ts";

/** Collect all bracket segments from the tree (flat list). */
export function collectBrackets(segments: PuzzleSegment[]): BracketSegment[] {
  const result: BracketSegment[] = [];
  for (const seg of segments) {
    if (seg.type === "bracket") {
      result.push(seg);
      if (Array.isArray(seg.clue)) {
        result.push(...collectBrackets(seg.clue));
      }
    }
  }
  return result;
}

/** Build initial bracket state map from a segment tree. */
export function initBracketStates(segments: PuzzleSegment[]): Record<string, BracketState> {
  const brackets = collectBrackets(segments);
  const states: Record<string, BracketState> = {};
  for (const b of brackets) {
    states[b.id] = { solved: false, hintUsed: false, wrongGuesses: 0 };
  }
  return states;
}

/** Check if a bracket is solvable (all child brackets are solved). */
export function isSolvable(
  segment: BracketSegment,
  bracketStates: Record<string, BracketState>,
): boolean {
  if (bracketStates[segment.id]?.solved) return false;
  if (typeof segment.clue === "string") return true;
  return segment.clue.every(
    (child) => child.type === "text" || bracketStates[child.id]?.solved,
  );
}

/** Get all currently solvable bracket IDs. */
export function getSolvableBracketIds(
  segments: PuzzleSegment[],
  bracketStates: Record<string, BracketState>,
): string[] {
  const ids: string[] = [];
  for (const seg of segments) {
    if (seg.type === "bracket") {
      if (isSolvable(seg, bracketStates)) {
        ids.push(seg.id);
      } else if (!bracketStates[seg.id]?.solved && Array.isArray(seg.clue)) {
        ids.push(...getSolvableBracketIds(seg.clue, bracketStates));
      }
    }
  }
  return ids;
}

/** Get the clue text for a solvable bracket (children resolved to their answers). */
export function getClueText(
  segment: BracketSegment,
): string {
  if (typeof segment.clue === "string") return segment.clue;
  return segment.clue
    .map((child) => {
      if (child.type === "text") return child.value;
      return child.answer;
    })
    .join("");
}

/** Check if all brackets in the puzzle are solved. */
export function allBracketsSolved(bracketStates: Record<string, BracketState>): boolean {
  return Object.values(bracketStates).every((b) => b.solved);
}
