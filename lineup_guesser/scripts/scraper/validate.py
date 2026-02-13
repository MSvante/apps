#!/usr/bin/env python3
"""Validate the generated matches.json dataset."""

import json
import sys
from pathlib import Path

from formation_mapper import formation_to_positions

DEFAULT_PATH = Path(__file__).parent / "../../src/data/matches.json"

REQUIRED_MATCH_FIELDS = {"id", "date", "season", "homeTeam", "awayTeam", "score", "homeLineup", "awayLineup"}
REQUIRED_PLAYER_FIELDS = {"name", "lastName", "lastNameNormalized", "nationality", "nationalityFlag", "age", "shirtNumber", "position"}
VALID_POSITIONS = {"GK", "DEF", "MID", "FWD"}


def validate(path: Path) -> bool:
    with open(path, encoding="utf-8") as f:
        matches = json.load(f)

    errors = []
    warnings = []

    if not isinstance(matches, list):
        print("ERROR: Root must be an array")
        return False

    print(f"Validating {len(matches)} matches...")

    for i, match in enumerate(matches):
        prefix = f"Match {i} ({match.get('id', '?')})"

        # Check required fields
        missing = REQUIRED_MATCH_FIELDS - set(match.keys())
        if missing:
            errors.append(f"{prefix}: missing fields {missing}")
            continue

        # Validate each lineup
        for side in ["homeLineup", "awayLineup"]:
            lineup = match[side]
            formation = lineup.get("formation", "")
            players = lineup.get("players", [])

            # Check player count
            if len(players) != 11:
                errors.append(f"{prefix} {side}: has {len(players)} players, expected 11")
                continue

            # Check formation parses
            try:
                positions = formation_to_positions(formation)
            except ValueError as e:
                errors.append(f"{prefix} {side}: invalid formation '{formation}': {e}")
                continue

            # Check each player
            for j, player in enumerate(players):
                p_prefix = f"{prefix} {side} player {j}"
                p_missing = REQUIRED_PLAYER_FIELDS - set(player.keys())
                if p_missing:
                    errors.append(f"{p_prefix}: missing fields {p_missing}")

                if player.get("position") not in VALID_POSITIONS:
                    errors.append(f"{p_prefix}: invalid position '{player.get('position')}'")

                if not player.get("lastNameNormalized"):
                    errors.append(f"{p_prefix}: empty lastNameNormalized")

                if player.get("age", 0) <= 0:
                    warnings.append(f"{p_prefix}: age is {player.get('age', 0)}")

                if player.get("shirtNumber", 0) <= 0:
                    warnings.append(f"{p_prefix}: shirtNumber is {player.get('shirtNumber', 0)}")

                if not player.get("nationalityFlag"):
                    warnings.append(f"{p_prefix}: no flag for '{player.get('nationality')}'")

    # Report
    if warnings:
        print(f"\n{len(warnings)} warnings:")
        for w in warnings[:20]:
            print(f"  WARN: {w}")
        if len(warnings) > 20:
            print(f"  ... and {len(warnings) - 20} more")

    if errors:
        print(f"\n{len(errors)} errors:")
        for e in errors:
            print(f"  ERROR: {e}")
        return False

    print(f"\nAll {len(matches)} matches valid!")
    return True


if __name__ == "__main__":
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PATH
    if not path.exists():
        print(f"File not found: {path}")
        sys.exit(1)

    ok = validate(path)
    sys.exit(0 if ok else 1)
