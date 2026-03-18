#!/usr/bin/env python3
"""
Generate bracket puzzles from historical events using Claude API.
Reads events_XX.json files and merges results into src/data/puzzles.json.

Usage:
  python generate_puzzles.py 01        # Generate January puzzles
  python generate_puzzles.py 01 02 03  # Generate Jan, Feb, Mar
  python generate_puzzles.py all       # Generate all months
"""

import json
import re
import sys
from pathlib import Path

import anthropic

MONTH_NAMES = [
    "", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]

MONTH_DAYS = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

MONTH_PREFIXES = [
    "", "jan", "feb", "mar", "apr", "may", "jun",
    "jul", "aug", "sep", "oct", "nov", "dec",
]

EVENTS_PER_DAY = 3

PROMPT_TEMPLATE = """You are a puzzle designer for "Bracket City", a word puzzle game.

Given a historical event sentence, create a bracket puzzle where some words are replaced by [bracketed clues]. Brackets can be nested — solving inner brackets reveals context for outer brackets.

RULES:
1. Replace 5-8 interesting words with bracketed clues
2. Nest 2-4 of the brackets (inner brackets provide context for outer brackets)
3. At least one bracket should be nested 3 levels deep (a bracket inside a bracket inside a bracket)
4. Each bracket has: an "id" (unique string), an "answer" (the word it replaces), and a "clue"
5. If a bracket has nested children, its "clue" is an array of segments. Otherwise "clue" is a string.
6. Clues should be clever but solvable — wordplay, definitions, associations
7. The reconstructed sentence (replacing all brackets with their answers) must exactly reproduce the original sentence

OUTPUT FORMAT — valid JSON matching this schema:
{{
  "segments": [
    {{ "type": "text", "value": "plain text" }},
    {{
      "type": "bracket",
      "id": "b1",
      "answer": "word",
      "clue": "a clue string"
    }},
    {{
      "type": "bracket",
      "id": "b2",
      "answer": "outer_word",
      "clue": [
        {{ "type": "text", "value": "clue text " }},
        {{
          "type": "bracket",
          "id": "b2a",
          "answer": "mid_word",
          "clue": [
            {{ "type": "text", "value": "inner clue " }},
            {{ "type": "bracket", "id": "b2a1", "answer": "deep_word", "clue": "deepest clue" }}
          ]
        }},
        {{ "type": "text", "value": " more clue text" }}
      ]
    }}
  ]
}}

IMPORTANT:
- Output ONLY the JSON object, no markdown fences, no explanation
- Use simple bracket IDs like b1, b2, b2a, b2a1, b3, etc.
- Every text segment between/around brackets must be included
- The concatenation of all answers and text values must reproduce the original sentence exactly

Historical event sentence:
"{sentence}"
"""


def validate_puzzle(segments: list, original: str) -> bool:
    """Check that reconstructing the puzzle gives back the original sentence."""
    def reconstruct(segs: list) -> str:
        parts = []
        for seg in segs:
            if seg["type"] == "text":
                parts.append(seg["value"])
            elif seg["type"] == "bracket":
                parts.append(seg["answer"])
        return "".join(parts)

    reconstructed = reconstruct(segments)
    return reconstructed == original


def collect_ids(segments: list) -> list[str]:
    """Collect all bracket IDs to check uniqueness."""
    ids = []
    for seg in segments:
        if seg["type"] == "bracket":
            ids.append(seg["id"])
            if isinstance(seg.get("clue"), list):
                ids.extend(collect_ids(seg["clue"]))
    return ids


def max_depth(segments: list) -> int:
    """Return the maximum nesting depth of brackets."""
    d = 0
    for seg in segments:
        if seg["type"] == "bracket":
            if isinstance(seg.get("clue"), list):
                d = max(d, 1 + max_depth(seg["clue"]))
            else:
                d = max(d, 1)
    return d


def generate_puzzle(client: anthropic.Anthropic, event: dict, puzzle_id: str, retries: int = 2) -> dict | None:
    """Generate a single puzzle from an event using Claude."""
    prompt = PROMPT_TEMPLATE.format(sentence=event["sentence"])

    for attempt in range(retries + 1):
        try:
            message = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}],
            )

            text = message.content[0].text.strip()

            # Try to parse JSON (handle potential markdown fences)
            if text.startswith("```"):
                text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()

            data = json.loads(text)
            segments = data.get("segments", data) if isinstance(data, dict) else data

            # Validate reconstruction
            if not validate_puzzle(segments, event["sentence"]):
                print(f"  WARNING: Reconstruction mismatch (attempt {attempt + 1})")
                if attempt < retries:
                    continue
                return None

            # Validate unique IDs
            ids = collect_ids(segments)
            if len(ids) != len(set(ids)):
                print(f"  WARNING: Duplicate bracket IDs (attempt {attempt + 1})")
                if attempt < retries:
                    continue
                return None

            depth = max_depth(segments)
            return {
                "id": puzzle_id,
                "date": event["date"],
                "event": event["sentence"],
                "segments": segments,
                "_depth": depth,
            }

        except (json.JSONDecodeError, KeyError, IndexError) as e:
            print(f"  ERROR: {e} (attempt {attempt + 1})")
            if attempt < retries:
                continue
            return None

    return None


def select_events(events: list, month_num: int) -> dict[int, list]:
    """Select EVENTS_PER_DAY events per day, preferring longer sentences."""
    month_name = MONTH_NAMES[month_num]
    by_day: dict[int, list] = {}

    for e in events:
        match = re.match(rf"{month_name} (\d+)", e["date"])
        if match:
            day = int(match.group(1))
            if day not in by_day:
                by_day[day] = []
            by_day[day].append(e)

    selected: dict[int, list] = {}
    for day in range(1, MONTH_DAYS[month_num] + 1):
        candidates = by_day.get(day, [])
        # Filter: prefer sentences > 40 chars, no "(pictured)" etc.
        valid = [e for e in candidates if len(e["sentence"]) > 40]
        # Sort by sentence length descending (longer = more interesting brackets)
        valid.sort(key=lambda e: len(e["sentence"]), reverse=True)
        selected[day] = valid[:EVENTS_PER_DAY]

    return selected


def process_month(client: anthropic.Anthropic, month_num: int, scripts_dir: Path) -> dict[str, list]:
    """Process a single month and return date-keyed puzzles."""
    month_str = f"{month_num:02d}"
    events_path = scripts_dir / f"events_{month_str}.json"

    if not events_path.exists():
        print(f"ERROR: {events_path} not found, skipping month {month_str}")
        return {}

    events = json.loads(events_path.read_text())
    print(f"\n{'='*60}")
    print(f"Processing {MONTH_NAMES[month_num]} ({len(events)} events)")
    print(f"{'='*60}")

    selected = select_events(events, month_num)
    results: dict[str, list] = {}
    prefix = MONTH_PREFIXES[month_num]

    total = sum(len(v) for v in selected.values())
    done = 0

    for day in range(1, MONTH_DAYS[month_num] + 1):
        date_key = f"{month_str}-{day:02d}"
        day_events = selected.get(day, [])
        day_puzzles = []

        for i, event in enumerate(day_events):
            done += 1
            puzzle_id = f"{prefix}{day:02d}_{i + 1}"
            print(f"[{done}/{total}] {date_key} #{i+1}: {event['sentence'][:60]}...")

            puzzle = generate_puzzle(client, event, puzzle_id)
            if puzzle:
                depth = puzzle.pop("_depth", 0)
                day_puzzles.append(puzzle)
                print(f"  OK ({len(collect_ids(puzzle['segments']))} brackets, depth {depth})")
            else:
                print(f"  SKIPPED")

        results[date_key] = day_puzzles

    return results


def main():
    if len(sys.argv) < 2:
        print("Usage: python generate_puzzles.py <month_num|all> [month_num ...]")
        print("  e.g.: python generate_puzzles.py 03")
        print("  e.g.: python generate_puzzles.py all")
        sys.exit(1)

    scripts_dir = Path(__file__).parent
    output_path = scripts_dir.parent / "src" / "data" / "puzzles.json"

    # Load existing puzzles
    if output_path.exists():
        existing = json.loads(output_path.read_text())
        print(f"Loaded existing puzzles.json ({len(existing)} date keys)")
    else:
        existing = {}

    # Determine which months to process
    if sys.argv[1] == "all":
        months = list(range(1, 13))
    else:
        months = [int(m) for m in sys.argv[1:]]

    client = anthropic.Anthropic()

    for month_num in months:
        if month_num < 1 or month_num > 12:
            print(f"Invalid month: {month_num}, skipping")
            continue

        results = process_month(client, month_num, scripts_dir)
        existing.update(results)

        # Write after each month so progress is saved
        # Sort keys for consistent output
        sorted_data = dict(sorted(existing.items()))
        output_path.write_text(json.dumps(sorted_data, indent=2))
        print(f"\nSaved {MONTH_NAMES[month_num]} to {output_path}")

    print(f"\nDone! {len(existing)} date keys in {output_path}")


if __name__ == "__main__":
    main()
