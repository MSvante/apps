import type { Puzzle, BracketState } from "../types/puzzle.ts";

/** Format a Date as "MM-DD" key for puzzle lookup. */
export function dateKey(date: Date = new Date()): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

/** Puzzle number: day-of-year (1-indexed). */
export function puzzleNumber(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/** Format date for display: "March 16, 2026" */
export function formatDate(date: Date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

type DailyPuzzleMap = Record<string, Puzzle[]>;

/**
 * Get today's puzzle. Deterministic — same puzzle for everyone on the same day.
 * If multiple puzzles exist for a day, uses the year to rotate through them.
 */
export function getDailyPuzzle(
  puzzleMap: DailyPuzzleMap,
  date: Date = new Date(),
): Puzzle | null {
  const key = dateKey(date);
  const puzzles = puzzleMap[key];
  if (!puzzles || puzzles.length === 0) return null;
  // Use year to rotate if there are multiple puzzles for the same day
  const index = date.getFullYear() % puzzles.length;
  return puzzles[index];
}

const DAILY_STATE_KEY = "bracket_city_daily";

export interface DailyState {
  dateKey: string;
  completed: boolean;
  score: number;
  brackets: Record<string, BracketState>;
  activeBracketId: string | null;
}

export function loadDailyState(): DailyState | null {
  try {
    const raw = localStorage.getItem(DAILY_STATE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw) as DailyState;
    // Only return if it's for today
    if (state.dateKey !== dateKey()) return null;
    return state;
  } catch {
    return null;
  }
}

export function saveDailyState(state: DailyState): void {
  localStorage.setItem(DAILY_STATE_KEY, JSON.stringify(state));
}

const STATS_KEY = "bracket_city_stats";

export interface Stats {
  gamesPlayed: number;
  totalScore: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate: string; // "YYYY-MM-DD"
}

export function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { gamesPlayed: 0, totalScore: 0, currentStreak: 0, maxStreak: 0, lastPlayedDate: "" };
    return JSON.parse(raw);
  } catch {
    return { gamesPlayed: 0, totalScore: 0, currentStreak: 0, maxStreak: 0, lastPlayedDate: "" };
  }
}

export function saveStats(score: number): void {
  const stats = loadStats();
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // Don't double-count
  if (stats.lastPlayedDate === todayStr) return;

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  stats.gamesPlayed += 1;
  stats.totalScore += score;
  stats.currentStreak = stats.lastPlayedDate === yesterdayStr ? stats.currentStreak + 1 : 1;
  stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
  stats.lastPlayedDate = todayStr;

  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}
