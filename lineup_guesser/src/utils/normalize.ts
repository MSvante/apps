/**
 * Normalize a string for accent-insensitive comparison.
 * Uses NFD decomposition to strip diacritics, then lowercases.
 */
export function normalizeForComparison(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
