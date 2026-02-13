# Apps

A collection of interactive web games and puzzles, hosted with GitHub Pages.

**Live site:** [https://msvante.github.io/apps/](https://msvante.github.io/apps/)

## Games

### Calendar Puzzle

A daily puzzle based on the [DragonFjord A-Puzzle-A-Day](https://www.dragonfjord.com/product/a-puzzle-a-day/). Place 8 unique pieces on a 7x7 calendar grid to cover every cell except today's month and day.

- Rotate and flip pieces to find the solution
- New challenge every day

### PL Lineup Guesser

A Premier League lineup guessing game built with React and TypeScript. A random historic match is selected and you guess all 11 players in the starting lineup.

- Supports 20+ formations
- Progressive hint system (nationality, age, shirt number, first letter) with point costs
- 10 points per correct guess, max 110 per lineup
- Flexible name matching with alternate names

## Tech Stack

- **Calendar Puzzle** — Vanilla HTML/CSS/JavaScript
- **Lineup Guesser** — React 19, TypeScript, Vite, Tailwind CSS
- **Data scraping** — Python scripts (fbref)

## Development

```bash
# Lineup Guesser
cd lineup_guesser
npm install
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Run ESLint
```

## Project Structure

```
├── index.html              Landing page / app hub
├── kalender/               Calendar Puzzle (standalone)
└── lineup_guesser/         PL Lineup Guesser (React app)
    ├── src/
    │   ├── components/     React UI components
    │   ├── hooks/          Game state management
    │   ├── data/           Match data (JSON)
    │   ├── constants/      Formations, scoring, nationalities
    │   ├── types/          TypeScript interfaces
    │   └── utils/          Helpers (scoring, normalization)
    └── scripts/scraper/    Python data scrapers
```
