"""One-off script to reprocess matches.json: remove pre-2010 matches and re-apply name extraction."""

import json
import sys
from pathlib import Path

from normalize import normalize_name, extract_last_name

MATCHES_PATH = Path(__file__).resolve().parent.parent.parent / "src" / "data" / "matches.json"
MIN_DATE = "2010-01-01"


def reprocess_player(player: dict) -> dict:
    """Re-apply extract_last_name with updated overrides."""
    name = player["name"]
    last_name, alternate_names = extract_last_name(name)

    player["lastName"] = last_name
    player["lastNameNormalized"] = normalize_name(last_name)

    if alternate_names:
        player["alternateNames"] = alternate_names
    elif "alternateNames" in player:
        del player["alternateNames"]

    return player


def main():
    with open(MATCHES_PATH, "r", encoding="utf-8") as f:
        matches = json.load(f)

    original_count = len(matches)

    # Remove pre-2010 matches
    matches = [m for m in matches if m["date"] >= MIN_DATE]
    removed = original_count - len(matches)
    print(f"Removed {removed} pre-2010 matches ({original_count} → {len(matches)})")

    # Re-apply name extraction to all players
    names_changed = 0
    for match in matches:
        for side in ["homeLineup", "awayLineup"]:
            lineup = match.get(side, {})
            for player in lineup.get("players", []):
                old_last = player.get("lastName", "")
                reprocess_player(player)
                if player["lastName"] != old_last:
                    names_changed += 1
                    print(f"  {player['name']}: {old_last!r} → {player['lastName']!r}")

    print(f"Updated {names_changed} player last names")

    # Verify no pre-2010 matches remain
    earliest = min(m["date"] for m in matches)
    print(f"Earliest match date: {earliest}")
    assert earliest >= MIN_DATE, f"Still have pre-2010 matches! Earliest: {earliest}"

    with open(MATCHES_PATH, "w", encoding="utf-8") as f:
        json.dump(matches, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"Wrote {len(matches)} matches to {MATCHES_PATH}")


if __name__ == "__main__":
    main()
