# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm run dev       # Start Vite dev server
npm run build     # TypeScript check + Vite bundle
npm run lint      # ESLint
npm run preview   # Preview production build
```

## Architecture

Game state lives entirely in `src/hooks/useGame.ts` (useReducer). Components are pure UI.

```
src/
├── hooks/useGame.ts        # All game state and logic; auto-saves to localStorage
├── components/
│   ├── GameContainer.tsx     # Orchestrates daily puzzle loading and game phases
│   ├── PuzzleSentence.tsx    # Renders the full sentence with brackets
│   ├── BracketSegment.tsx    # Individual bracket; color-coded by nesting depth
│   ├── InlineAnswerInput.tsx # The answer field rendered inline, in place of the active bracket
│   └── ClueBar.tsx           # Slim bar under the sentence: clue, solving chain, Peek/Reveal
├── utils/
│   ├── puzzle.ts           # Tree traversal: solvability, deepest bracket, solving chain, puzzleDifficulty
│   ├── scoring.ts          # Performance → rank (Kingmaker, Mayor, Commuter)
│   ├── normalize.ts        # trim().toLowerCase() only — no diacritics handling
│   └── daily.ts            # Daily puzzle selection, localStorage persistence, stats
├── constants/scoring.ts    # INITIAL_SCORE=100, WRONG/PEEK_PENALTY=10, REVEAL_PENALTY=25, rank tiers
├── types/puzzle.ts         # Puzzle, Bracket, Segment, GameState types
└── data/puzzles.json       # All puzzles keyed by MM-DD date
```

## Game Logic

**Puzzle structure:** A puzzle is a sentence broken into `text` and `bracket` segments. Each bracket has an `answer` and a `clue` — the clue can itself contain nested brackets, forming a dependency tree.

**Solving order:** A bracket is only solvable when all brackets inside its clue are already solved. `isSolvable()` and `getSolvableBracketIds()` in `utils/puzzle.ts` enforce this.

**Locked bracket behaviour:** Clicking a locked bracket drills down to its deepest solvable child rather than selecting the parent.

**Solving chain:** `buildSolvingChain()` traces the ancestor path from the active bracket to the root, displayed as a breadcrumb in `ClueBar` so the player sees context.

**Inline answer entry:** The active bracket renders an inline `<input>` (`InlineAnswerInput`) in place of its clue, so the sentence is the typing surface and visibly assembles as brackets are solved. The clue and assist buttons live in the slim `ClueBar` beneath the sentence.

**Scoring:** Starts at 100. Each wrong guess −10, each peek −10, each reveal −25. Minimum 0. Rank updates live.

**Peek vs. Reveal:** `Peek` reveals the answer's first letter (−10, once per bracket). `Reveal` fills in the full answer and auto-advances (−25), flagging the bracket as `revealed`.

**Ranks:** Mirror the real Bracket City tiers (`utils/scoring.ts`, `getRank`): **Kingmaker** (flawless — no wrong guesses, peeks, or reveals), **Mayor** (no reveals and score ≥ 70), **Commuter** (everything else).

**Difficulty:** `puzzleDifficulty()` derives Easy/Medium/Tough from total bracket count + max nesting depth (puzzles.json has no difficulty field). Shown as 🟢/🟡/🔴 and in the share string.

**Answer matching:** `normalize.ts` does `trim().toLowerCase()` only — no fuzzy matching, no diacritics stripping.

**Auto-advance:** After a correct guess, if exactly one solvable bracket remains it is auto-selected.

## Puzzle Data Format

`src/data/puzzles.json` — loaded as a separate Rollup chunk (code splitting in `vite.config.ts`).

```json
{
  "01-01": [
    {
      "id": "jan01_1",
      "date": "January 1, 1773",
      "event": "The hymn 'Amazing Grace' was first published.",
      "segments": [
        { "type": "text", "value": "The " },
        {
          "type": "bracket",
          "id": "b1",
          "answer": "hymn",
          "clue": [
            { "type": "text", "value": "song you'd hear in a " },
            {
              "type": "bracket",
              "id": "b1a",
              "answer": "choir",
              "clue": "group that sings in harmony"
            }
          ]
        }
      ]
    }
  ]
}
```

`clue` is either a plain string (leaf bracket) or an array of `text`/`bracket` segments (nested). If multiple puzzles exist for the same date, `daily.ts` rotates through them using `year % puzzles.length`.

## Persistence

`useGame.ts` saves full game state to localStorage on every state change. `daily.ts` separately tracks stats (games played, streak, average score). Stats distinguish "played today" from page-refresh to avoid double-counting streaks.
