/**
 * Maps formation strings to row definitions.
 * Each formation is an array of row sizes (excluding GK which is always 1).
 * The GK is always placed at y=92%, then rows spread upward.
 */
export const FORMATION_MAP: Record<string, number[]> = {
  "4-4-2": [4, 4, 2],
  "4-3-3": [4, 3, 3],
  "4-2-3-1": [4, 2, 3, 1],
  "4-1-4-1": [4, 1, 4, 1],
  "4-4-1-1": [4, 4, 1, 1],
  "4-5-1": [4, 5, 1],
  "4-1-2-1-2": [4, 1, 2, 1, 2],
  "3-4-3": [3, 4, 3],
  "3-5-2": [3, 5, 2],
  "3-4-2-1": [3, 4, 2, 1],
  "3-4-1-2": [3, 4, 1, 2],
  "5-3-2": [5, 3, 2],
  "5-4-1": [5, 4, 1],
  "5-2-3": [5, 2, 3],
  "4-3-2-1": [4, 3, 2, 1],
  "4-3-1-2": [4, 3, 1, 2],
  "4-1-3-2": [4, 1, 3, 2],
  "3-1-4-2": [3, 1, 4, 2],
  "4-2-2-2": [4, 2, 2, 2],
  "3-5-1-1": [3, 5, 1, 1],
};

/**
 * Parse a formation string that may not be in the predefined map.
 * Falls back to splitting by "-" and using the numbers directly.
 */
export function parseFormation(formation: string): number[] {
  if (FORMATION_MAP[formation]) {
    return FORMATION_MAP[formation];
  }
  // Fallback: split and parse
  return formation.split("-").map(Number);
}
