# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm run dev       # Start Vite dev server
npm run build     # TypeScript check + Vite bundle
npm run lint      # ESLint
npm run preview   # Preview production build

npx vitest run              # Run all tests
npx vitest run src/utils/__tests__/scoring.test.ts  # Run a single test file
```

## Architecture

Game state lives entirely in `src/hooks/useGame.ts` (useReducer). Components are pure UI — they receive state and dispatch actions.

```
src/
├── hooks/useGame.ts        # All game state and logic
├── components/             # Pure UI components
├── utils/
│   ├── normalize.ts        # Name normalization + fuzzy matching
│   ├── scoring.ts          # Point calculation per slot
│   └── formations.ts       # Formation string → pixel positions on pitch
├── constants/
│   ├── scoring.ts          # POINTS_PER_CORRECT_GUESS=10, HINT_COSTS, etc.
│   ├── formations.ts       # Formation string parsing
│   └── nationalities.ts    # Nationality → flag emoji map
├── types/
│   ├── match.ts            # Player, Lineup, Match
│   └── game.ts             # GameState, SlotState, GamePhase, HintLevel
└── data/matches.json       # All match data
```

## Game Logic

**Guess flow:** `submitGuess()` runs exact match → fuzzy match → duplicate check. A guess only matches a player whose position matches the selected slot (GK/DEF/MID/FWD).

**Name matching:**
1. Normalize: NFD decompose → strip diacritics (U+0300–U+036F) → lowercase → trim. "Özil" → "ozil".
2. Exact match against `lastNameNormalized` and `alternateNames`.
3. Fuzzy match with Levenshtein: threshold = 1 if name ≤6 chars, 2 if >6 chars.

**Scoring:** 10 points base per correct guess. Hint 1 (nationality) costs −2, hint 2 (age) costs −3. After 2 hints, letters are revealed one-by-one at −1 each. Floor at 0.

**Hint sequence:** nationality → age → letters one by one. There is no 3rd standard hint; after 2 hints it switches to letter-by-letter reveal.

**Avoiding repeats:** Played match IDs are stored in localStorage (capped at 100). Fresh matches are always picked first; once the pool is exhausted any match is allowed.

## Match Data Format

`src/data/matches.json` is an array of matches scraped from PulseLive via `scripts/scraper/`.

```json
{
  "id": "6917",
  "date": "2010-01-20",
  "season": "2009/10",
  "homeTeam": "Liverpool",
  "awayTeam": "Tottenham Hotspur",
  "score": "2-0",
  "homeLineup": {
    "formation": "5-4-1",
    "players": [
      {
        "name": "Pepe Reina",
        "lastName": "Reina",
        "lastNameNormalized": "reina",
        "alternateNames": [],
        "nationality": "Spain",
        "nationalityFlag": "🇪🇸",
        "age": 27,
        "shirtNumber": 25,
        "position": "GK"
      }
    ]
  },
  "awayLineup": { }
}
```

Players are always sorted GK → DEF → MID → FWD. `alternateNames` may be absent.

## Data Scraper (`scripts/scraper/`)

Python pipeline: PulseLive API → parse → transform → validate → `matches.json`.

- `scrape_matches.py` — entry point; fetches matches, samples per season, calls transform
- `parsers.py` — converts raw API JSON to intermediate format
- `transform.py` — maps nationalities to flags, extracts last names, computes age at match date
- `normalize.py` — Python mirror of the JS normalization (must stay in sync)
- `fbref_client.py` — HTTP client with 0.5s rate limiting and disk cache in `.cache/`
- `validate.py` — QA checks on output JSON
- `reprocess.py` — one-off re-application of `extract_last_name()` when override rules change

**Single-name overrides** (Fred, Fabinho, Jorginho, etc.) are hardcoded in `transform.py`. Add new ones there when scraped data is wrong.

When `normalize.py` changes, the JS `src/utils/normalize.ts` must change to match, and vice versa.
