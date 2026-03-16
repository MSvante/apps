#!/usr/bin/env python3
"""
Scrape Wikipedia's "Selected anniversaries" pages to get historical events.
Outputs events.json with {date, year, sentence} objects.

Usage:
  # Scrape all days of the year
  python scrape_wikipedia.py

  # Scrape a specific day
  python scrape_wikipedia.py --day "March 16"

  # Scrape a specific month
  python scrape_wikipedia.py --month March

  # Filter to a year range
  python scrape_wikipedia.py --min-year 1800 --max-year 2000
"""

import argparse
import json
import time

import requests
from bs4 import BeautifulSoup

MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

BASE_URL = "https://en.wikipedia.org/wiki/Wikipedia:Selected_anniversaries/{month}_{day}"


HEADERS = {
    "User-Agent": "BracketCityPuzzleBot/1.0 (personal project; educational game)",
}


def scrape_day(month: str, day: int, min_year: int = 1000, max_year: int = 2100) -> list[dict]:
    """Scrape events for a specific day."""
    url = BASE_URL.format(month=month, day=day)
    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")
    events = []

    content = soup.find("div", {"class": "mw-parser-output"})
    if not content:
        return events

    for ul in content.find_all("ul"):
        for li in ul.find_all("li", recursive=False):
            text = li.get_text(strip=True)
            if len(text) < 30:
                continue

            year = None
            for word in text.split()[:3]:
                cleaned = word.strip(" –-—")
                if cleaned.isdigit() and min_year <= int(cleaned) <= max_year:
                    year = int(cleaned)
                    break

            if year:
                sentence = text
                idx = text.find(str(year))
                if idx >= 0:
                    after_year = text[idx + len(str(year)):].lstrip(" –-—:,")
                    if after_year:
                        sentence = after_year

                events.append({
                    "date": f"{month} {day}, {year}",
                    "year": year,
                    "sentence": sentence,
                })

    return events


def parse_day_arg(day_str: str) -> tuple[str, int]:
    """Parse 'March 16' into ('March', 16)."""
    parts = day_str.strip().split()
    if len(parts) != 2:
        raise ValueError(f"Invalid day format: '{day_str}'. Expected 'Month Day' e.g. 'March 16'")
    month = parts[0].capitalize()
    if month not in MONTHS:
        raise ValueError(f"Unknown month: {month}")
    return month, int(parts[1])


def main():
    parser = argparse.ArgumentParser(description="Scrape Wikipedia selected anniversaries")
    parser.add_argument("--day", help="Specific day to scrape, e.g. 'March 16'")
    parser.add_argument("--month", help="Specific month to scrape, e.g. 'March'")
    parser.add_argument("--min-year", type=int, default=1000)
    parser.add_argument("--max-year", type=int, default=2100)
    parser.add_argument("--output", default="events.json")
    args = parser.parse_args()

    all_events = []

    if args.day:
        month, day = parse_day_arg(args.day)
        print(f"Scraping {month} {day}...")
        events = scrape_day(month, day, args.min_year, args.max_year)
        all_events.extend(events)
        print(f"  Found {len(events)} events")
    elif args.month:
        month = args.month.capitalize()
        if month not in MONTHS:
            print(f"Unknown month: {month}")
            return
        month_idx = MONTHS.index(month)
        days = DAYS_IN_MONTH[month_idx]
        for day in range(1, days + 1):
            print(f"Scraping {month} {day}...")
            try:
                events = scrape_day(month, day, args.min_year, args.max_year)
                all_events.extend(events)
                print(f"  Found {len(events)} events")
            except Exception as e:
                print(f"  Error: {e}")
            time.sleep(0.5)
    else:
        for month_idx, month in enumerate(MONTHS):
            days = DAYS_IN_MONTH[month_idx]
            for day in range(1, days + 1):
                print(f"Scraping {month} {day}...")
                try:
                    events = scrape_day(month, day, args.min_year, args.max_year)
                    all_events.extend(events)
                    print(f"  Found {len(events)} events")
                except Exception as e:
                    print(f"  Error: {e}")
                time.sleep(0.5)

    output_path = args.output
    with open(output_path, "w") as f:
        json.dump(all_events, f, indent=2)

    print(f"\nDone! Saved {len(all_events)} events to {output_path}")


if __name__ == "__main__":
    main()
