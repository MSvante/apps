# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A collection of interactive web games hosted at https://msvante.github.io/apps/. Each app is independently developed and has its own `CLAUDE.md`.

| App | Tech | Description |
|-----|------|-------------|
| `lineup_guesser/` | React, TypeScript, Vite, Tailwind | Guess Premier League starting lineups |
| `bracket_city/` | React, TypeScript, Vite, Tailwind | Solve nested bracket word puzzles |
| `hangman/` | React, TypeScript, Vite, Tailwind | Hangman with live news headlines |
| `kalender/` | Vanilla HTML/CSS/JS | Daily DragonFjord-style calendar puzzle |
| `pokemon/` | Vanilla HTML/CSS/JS | Pokémon silhouette guessing game |

## Deployment

The GitHub Actions workflow (`.github/workflows/deploy.yml`) builds each React app independently, then assembles the full site under `_site/` alongside the static apps before deploying to GitHub Pages.

Each Vite config uses a relative base (`base: './'`), so a build works under any subpath. When adding a new React app, set that base and add the app to the deploy workflow.

## Spilplatform

The games are also listed on the colleague game platform (see `SPILPLATFORM.md`). The platform shows each game in a sandboxed iframe. Every game's back link must post `{ type: "spilplatform:exit" }` to `window.parent` when it runs inside a frame, and navigate to `../` otherwise.
