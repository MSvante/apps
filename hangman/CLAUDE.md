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

Game state lives entirely in `src/hooks/useGame.ts` (useReducer). Components are pure UI. There is no static puzzle data — headlines are fetched live on load.

```
src/
├── hooks/useGame.ts        # All game state; phases, guesses, hints, results
├── api/news.ts             # Fetches headlines from newsdata.io in parallel batches
├── components/
│   ├── GameContainer.tsx   # Orchestrates fetch, phases, error/loading states
│   ├── HeadlineDisplay.tsx # Renders headline; hides target word as underscores
│   ├── Keyboard.tsx        # QWERTY UI + physical keyboard listener
│   ├── HangmanDrawing.tsx  # SVG figure with animated stroke-draw per wrong guess
│   ├── ScoreBar.tsx        # Dot indicators per headline (solved/failed/current)
│   └── GameSummary.tsx     # End-of-session summary with all headlines
├── utils/headline.ts       # Display char logic, smart hidden-word picker
├── constants/config.ts     # API key, domain batches, MAX_WRONG_GUESSES=5, HINT_MAX=3
└── types/game.ts           # Headline, GameState, GamePhase, GameAction types
```

## Game Logic

**Phases:** `LOADING` → `PLAYING` → `HEADLINE_RESULT` → (repeat) → `SESSION_COMPLETE`. An `ERROR` phase handles API failures.

**Per headline:** One word is hidden (shown as underscores); all other words are displayed in gray. Max 5 wrong guesses before the headline is failed.

**Hidden word selection (`pickHiddenWordIndex` in `utils/headline.ts`):** Avoids the first 2 and last 2 words. Prefers words with 3+ actual letters. Falls back to any eligible word if needed.

**Guessing:** `guessLetter()` checks if the letter appears in the hidden word. Wrong guesses are tracked in an array; reaching `MAX_WRONG_GUESSES` (5) triggers failure. Win is detected when all letters of the hidden word have been guessed.

**Hints:** Reveal a random unrevealed correct letter from the hidden word. They do **not** count as wrong guesses. Max 3 hints per session (shared across headlines, tracked via `hintsUsed`).

**Display chars:** Non-alphabetic characters (numbers, punctuation) in the hidden word are always shown. Letters are shown only if guessed or when the puzzle is revealed after failure.

**Keyboard:** Both click and physical keypress are handled. Buttons are coloured green (correct) or red (wrong) after use, with a pop animation on correct guesses.

**Hangman drawing:** SVG with `strokeDasharray` animation (`animate-draw-in`). X eyes appear only on failure; smile on win. 6 stages + face expressions = 8 states total.

## API & Headline Fetching (`src/api/news.ts`)

Fetches from newsdata.io in 3 parallel batches (5 domains each, 15 domains total). Filters: title must be ≥10 letters and ≤120 characters. Results are deduplicated by title and shuffled.

API key and domain list are in `src/constants/config.ts`. Error codes handled: 429 (rate limit), 401/403 (bad key).

The API key is committed to the repo — it is a free-tier public key with rate limits, not a secret.
