import { parseFormation } from "../constants/formations";

export interface SlotPosition {
  top: number;  // percentage
  left: number; // percentage
}

/**
 * Given a formation string (e.g. "4-2-3-1"), compute absolute positions
 * for each of the 11 players on the pitch as { top%, left% }.
 *
 * Players are ordered GK first, then defense → attack (top to bottom visually).
 * GK is placed at the top of the pitch (defending), attackers at the bottom.
 */
export function getFormationPositions(formation: string): SlotPosition[] {
  const rows = parseFormation(formation);
  const positions: SlotPosition[] = [];

  // GK at the top
  positions.push({ top: 6, left: 50 });

  const totalRows = rows.length;
  // Spread rows evenly from ~18% to ~88% of the pitch height
  const topStart = 18;
  const topEnd = 88;

  rows.forEach((count, rowIndex) => {
    const top =
      totalRows === 1
        ? (topStart + topEnd) / 2
        : topStart + (rowIndex / (totalRows - 1)) * (topEnd - topStart);

    for (let i = 0; i < count; i++) {
      // Spread players evenly across the width
      const left = ((i + 1) / (count + 1)) * 100;
      // Clamp to avoid edges
      const clampedLeft = Math.max(10, Math.min(90, left));
      positions.push({ top, left: clampedLeft });
    }
  });

  return positions;
}
