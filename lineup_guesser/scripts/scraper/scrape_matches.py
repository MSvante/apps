#!/usr/bin/env python3
"""
Main orchestrator for scraping Premier League match lineups from FBref.

Usage:
    python scrape_matches.py [--seasons 2023-2024 2022-2023] [--per-season 25] [--output ../../src/data/matches.json]
"""

import argparse
import json
import logging
import random
import re
import sys
from pathlib import Path

from fbref_client import FBrefClient
from parsers import parse_match_lineups, parse_player_page
from transform import transform_all

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
logger = logging.getLogger(__name__)

FBREF_PL_SEASONS_URL = "https://fbref.com/en/comps/9/history/Premier-League-Seasons"
DEFAULT_OUTPUT = Path(__file__).parent / "../../src/data/matches.json"

# Seasons to scrape (FBref format)
DEFAULT_SEASONS = [
    f"{y}-{y+1}" for y in range(2005, 2025)
]


def get_season_match_urls(client: FBrefClient, season: str) -> list[dict]:
    """Get match URLs for a season from FBref."""
    url = f"https://fbref.com/en/comps/9/{season}/schedule/{season}-Premier-League-Scores-and-Fixtures"
    soup = client.get_soup(url)

    matches = []
    table = soup.select_one("table.stats_table")
    if not table:
        logger.warning(f"No schedule table found for {season}")
        return matches

    for row in table.select("tbody tr:not(.thead)"):
        # Skip spacer rows
        if "spacer" in row.get("class", []):
            continue

        date_cell = row.select_one('td[data-stat="date"]')
        home_cell = row.select_one('td[data-stat="home_team"]')
        away_cell = row.select_one('td[data-stat="away_team"]')
        score_cell = row.select_one('td[data-stat="score"]')

        if not all([date_cell, home_cell, away_cell, score_cell]):
            continue

        score_link = score_cell.find("a") if score_cell else None
        if not score_link:
            continue

        match_date = date_cell.get_text(strip=True)
        home_team = home_cell.get_text(strip=True)
        away_team = away_cell.get_text(strip=True)
        score_text = score_link.get_text(strip=True)
        match_href = score_link.get("href", "")

        # Convert score format "2–1" → "2-1"
        score_text = score_text.replace("\u2013", "-")

        if match_href and re.match(r"\d{4}-\d{2}-\d{2}", match_date):
            matches.append({
                "date": match_date,
                "home_team": home_team,
                "away_team": away_team,
                "score": score_text,
                "href": match_href,
                "season": season.replace("-", "/"),
            })

    logger.info(f"Found {len(matches)} matches for {season}")
    return matches


def scrape_match_details(client: FBrefClient, match: dict) -> dict | None:
    """Scrape lineup details for a single match."""
    match_url = f"https://fbref.com{match['href']}"
    soup = client.get_soup(match_url)

    lineups = parse_match_lineups(soup)
    if not lineups["home"] or not lineups["away"]:
        logger.warning(f"Missing lineup data for {match['date']} {match['home_team']} vs {match['away_team']}")
        return None

    match_id = match["href"].split("/")[-2] if "/" in match["href"] else match["date"]

    result = {
        "id": match_id,
        "date": match["date"],
        "season": match["season"],
        "home_team": match["home_team"],
        "away_team": match["away_team"],
        "score": match["score"],
        "home_lineup": lineups["home"],
        "away_lineup": lineups["away"],
    }

    # Enrich player data with nationality/age from player pages
    for side in ["home", "away"]:
        for player in result[f"{side}_lineup"]["players"]:
            if player.get("href"):
                try:
                    player_url = f"https://fbref.com{player['href']}"
                    player_soup = client.get_soup(player_url)
                    player_info = parse_player_page(player_soup)
                    player.update(player_info)
                except Exception as e:
                    logger.warning(f"Failed to fetch player {player['name']}: {e}")

    return result


def main():
    parser = argparse.ArgumentParser(description="Scrape PL lineups from FBref")
    parser.add_argument(
        "--seasons",
        nargs="*",
        default=DEFAULT_SEASONS,
        help="Seasons to scrape (e.g., 2023-2024)",
    )
    parser.add_argument(
        "--per-season",
        type=int,
        default=25,
        help="Number of matches to sample per season",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help="Output JSON file path",
    )
    args = parser.parse_args()

    client = FBrefClient()
    all_raw_matches: list[dict] = []

    for season in args.seasons:
        logger.info(f"Processing season {season}...")
        match_list = get_season_match_urls(client, season)

        if not match_list:
            continue

        # Sample matches
        sample_size = min(args.per_season, len(match_list))
        sampled = random.sample(match_list, sample_size)
        logger.info(f"Sampling {sample_size} matches from {season}")

        for i, match in enumerate(sampled):
            logger.info(
                f"  [{i+1}/{sample_size}] {match['date']} "
                f"{match['home_team']} vs {match['away_team']}"
            )
            try:
                details = scrape_match_details(client, match)
                if details:
                    all_raw_matches.append(details)
            except Exception as e:
                logger.error(f"  Failed: {e}")

    logger.info(f"Total raw matches collected: {len(all_raw_matches)}")

    # Transform and write
    count = transform_all(all_raw_matches, args.output)
    logger.info(f"Wrote {count} matches to {args.output}")


if __name__ == "__main__":
    main()
