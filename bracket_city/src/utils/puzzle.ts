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
    states[b.id] = { solved: false, peeked: false, revealed: false, wrongGuesses: 0 };
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

/**
 * Find the deepest solvable bracket inside a given bracket.
 * Returns the ID of the deepest solvable bracket, or null if none found.
 */
export function findDeepestSolvable(
  segment: BracketSegment,
  bracketStates: Record<string, BracketState>,
): string | null {
  if (bracketStates[segment.id]?.solved) return null;
  if (isSolvable(segment, bracketStates)) return segment.id;

  // Recurse into children
  if (Array.isArray(segment.clue)) {
    for (const child of segment.clue) {
      if (child.type === "bracket") {
        const found = findDeepestSolvable(child, bracketStates);
        if (found) return found;
      }
    }
  }
  return null;
}

/**
 * Build the solving chain from the deepest solvable bracket up to the given root bracket.
 * Returns an array of bracket IDs from deepest to shallowest (root).
 */
export function buildSolvingChain(
  root: BracketSegment,
  targetId: string,
  bracketStates: Record<string, BracketState>,
): BracketSegment[] {
  const chain: BracketSegment[] = [];

  function walk(seg: BracketSegment): boolean {
    if (bracketStates[seg.id]?.solved) return false;
    if (seg.id === targetId) {
      chain.push(seg);
      return true;
    }
    if (Array.isArray(seg.clue)) {
      for (const child of seg.clue) {
        if (child.type === "bracket" && walk(child)) {
          chain.push(seg);
          return true;
        }
      }
    }
    return false;
  }

  walk(root);
  return chain; // deepest first, root last
}

export type Difficulty = "Easy" | "Medium" | "Tough";

export const DIFFICULTY_EMOJI: Record<Difficulty, string> = {
  Easy: "🟢",
  Medium: "🟡",
  Tough: "🔴",
};

/**
 * Derive a puzzle's difficulty deterministically from its shape.
 * puzzles.json has no difficulty field, so we combine the total number of
 * brackets with the deepest nesting (against an all-unsolved state).
 */
export function puzzleDifficulty(segments: PuzzleSegment[]): Difficulty {
  const total = collectBrackets(segments).length;
  let maxDepth = 0;
  for (const seg of segments) {
    if (seg.type === "bracket") {
      maxDepth = Math.max(maxDepth, nestingDepth(seg, {}));
    }
  }
  // Weight depth more heavily — deep nesting is what makes a puzzle hard.
  const complexity = total + maxDepth * 2;
  if (complexity <= 12) return "Easy";
  if (complexity <= 20) return "Medium";
  return "Tough";
}

/**
 * Count the nesting depth of a bracket.
 */
export function nestingDepth(
  segment: BracketSegment,
  bracketStates: Record<string, BracketState>,
): number {
  if (bracketStates[segment.id]?.solved) return 0;
  if (typeof segment.clue === "string") return 1;
  let maxChild = 0;
  for (const child of segment.clue) {
    if (child.type === "bracket" && !bracketStates[child.id]?.solved) {
      maxChild = Math.max(maxChild, nestingDepth(child, bracketStates));
    }
  }
  return 1 + maxChild;
}
