#!/usr/bin/env python3
"""
Scrape Wikipedia's "Selected anniversaries" pages to get historical events.
Outputs events.json with {date, year, sentence} objects.
"""

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


def scrape_day(month: str, day: int) -> list[dict]:
    """Scrape events for a specific day."""
    url = BASE_URL.format(month=month, day=day)
    resp = requests.get(url, timeout=15)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")
    events = []

    # The events are in <ul> list items in the main content
    content = soup.find("div", {"class": "mw-parser-output"})
    if not content:
        return events

    for ul in content.find_all("ul"):
        for li in ul.find_all("li", recursive=False):
            text = li.get_text(strip=True)
            # Filter: should contain a year (4-digit number near start)
            # and be a meaningful sentence
            if len(text) < 30:
                continue

            # Try to extract year from start of text
            year = None
            for word in text.split()[:3]:
                cleaned = word.strip(" –-—")
                if cleaned.isdigit() and 1000 <= int(cleaned) <= 2100:
                    year = int(cleaned)
                    break

            if year:
                # Remove the year prefix to get the sentence
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


def main():
    all_events = []

    for month_idx, month in enumerate(MONTHS):
        days = DAYS_IN_MONTH[month_idx]
        for day in range(1, days + 1):
            print(f"Scraping {month} {day}...")
            try:
                events = scrape_day(month, day)
                all_events.extend(events)
                print(f"  Found {len(events)} events")
            except Exception as e:
                print(f"  Error: {e}")
            time.sleep(0.5)  # Be polite to Wikipedia

    output_path = "events.json"
    with open(output_path, "w") as f:
        json.dump(all_events, f, indent=2)

    print(f"\nDone! Saved {len(all_events)} events to {output_path}")


if __name__ == "__main__":
    main()
