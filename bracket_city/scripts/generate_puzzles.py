#!/usr/bin/env python3
"""
Generate bracket puzzles from historical events using Claude API.
Reads events.json (from scrape_wikipedia.py) and outputs src/data/puzzles.json.
"""

import json
import sys
import random
from pathlib import Path

import anthropic

PROMPT_TEMPLATE = """You are a puzzle designer for "Bracket City", a word puzzle game.

Given a historical event sentence, create a bracket puzzle where some words are replaced by [bracketed clues]. Brackets can be nested — solving inner brackets reveals context for outer brackets.

RULES:
1. Replace 5-8 interesting words with bracketed clues
2. Nest 2-4 of the brackets (inner brackets provide context for outer brackets)
3. Each bracket has: an "id" (unique string), an "answer" (the word it replaces), and a "clue"
4. If a bracket has nested children, its "clue" is an array of segments. Otherwise "clue" is a string.
5. Clues should be clever but solvable — wordplay, definitions, associations
6. The reconstructed sentence (replacing all brackets with their answers) must exactly reproduce the original sentence

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
        {{ "type": "bracket", "id": "b2a", "answer": "inner_word", "clue": "inner clue" }},
        {{ "type": "text", "value": " more clue text" }}
      ]
    }}
  ]
}}

IMPORTANT:
- Output ONLY the JSON object, no markdown fences, no explanation
- Use simple bracket IDs like b1, b2, b2a, b3, etc.
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


def generate_puzzle(client: anthropic.Anthropic, event: dict, puzzle_id: str) -> dict | None:
    """Generate a single puzzle from an event using Claude."""
    prompt = PROMPT_TEMPLATE.format(sentence=event["sentence"])

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

        # Validate
        if not validate_puzzle(segments, event["sentence"]):
            print(f"  WARNING: Reconstruction mismatch for '{event['sentence'][:50]}...'")
            return None

        ids = collect_ids(segments)
        if len(ids) != len(set(ids)):
            print(f"  WARNING: Duplicate bracket IDs")
            return None

        return {
            "id": puzzle_id,
            "date": event["date"],
            "event": event["sentence"],
            "segments": segments,
        }

    except (json.JSONDecodeError, KeyError, IndexError) as e:
        print(f"  ERROR: {e}")
        return None


def main():
    events_path = Path("events.json")
    if not events_path.exists():
        print("events.json not found. Run scrape_wikipedia.py first.")
        sys.exit(1)

    events = json.loads(events_path.read_text())
    print(f"Loaded {len(events)} events")

    # Sample a subset if there are many
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 30
    if len(events) > count:
        events = random.sample(events, count)
        print(f"Sampled {count} events")

    client = anthropic.Anthropic()  # Uses ANTHROPIC_API_KEY env var
    puzzles = []

    for i, event in enumerate(events):
        print(f"[{i + 1}/{len(events)}] Generating puzzle for: {event['sentence'][:60]}...")
        puzzle = generate_puzzle(client, event, str(i + 1))
        if puzzle:
            puzzles.append(puzzle)
            print(f"  OK ({len(collect_ids(puzzle['segments']))} brackets)")
        else:
            print(f"  SKIPPED")

    output_path = Path(__file__).parent.parent / "src" / "data" / "puzzles.json"
    output_path.write_text(json.dumps(puzzles, indent=2))
    print(f"\nDone! Generated {len(puzzles)} puzzles → {output_path}")


if __name__ == "__main__":
    main()
