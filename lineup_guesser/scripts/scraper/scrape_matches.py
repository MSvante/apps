#!/usr/bin/env python3
"""
Scrape Premier League match lineups from the PulseLive API.

Usage:
    python scrape_matches.py [--per-season 30] [--output ../../src/data/matches.json]
    python scrape_matches.py --min-season-id 21 --per-season 30  # Only 2012/13+ (has formations)
"""

import argparse
import logging
import random
from pathlib import Path

from fbref_client import PLClient
from parsers import parse_match
from transform import transform_all

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
logger = logging.getLogger(__name__)

DEFAULT_OUTPUT = Path(__file__).parent / "../../src/data/matches.json"


def main():
    parser = argparse.ArgumentParser(description="Scrape PL lineups from PulseLive API")
    parser.add_argument(
        "--per-season",
        type=int,
        default=100,
        help="Number of matches to sample per season (default: 100)",
    )
    parser.add_argument(
        "--min-season-id",
        type=int,
        default=14,
        help="Minimum season ID to scrape (14=2005/06). Use 21 for 2012/13+ only (has explicit formations).",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help="Output JSON file path",
    )
    args = parser.parse_args()

    client = PLClient()

    # Get all seasons
    logger.info("Fetching season list...")
    seasons = client.get_seasons()
    seasons.sort(key=lambda s: int(s.get("id", 0)))

    # Filter to desired range
    seasons = [s for s in seasons if int(s.get("id", 0)) >= args.min_season_id]
    logger.info(f"Will process {len(seasons)} seasons (IDs {seasons[0]['id']}–{seasons[-1]['id']})")

    all_raw_matches: list[dict] = []

    for season in seasons:
        season_id = int(season["id"])
        season_label = season.get("label", str(season_id))
        logger.info(f"Processing season {season_label} (ID {season_id})...")

        # Get all fixture IDs for this season
        fixture_ids = client.get_all_fixture_ids(season_id)
        logger.info(f"  Found {len(fixture_ids)} fixtures")

        if not fixture_ids:
            continue

        # Sample
        sample_size = min(args.per_season, len(fixture_ids))
        sampled_ids = random.sample(fixture_ids, sample_size)
        logger.info(f"  Sampling {sample_size} matches")

        success = 0
        for i, fid in enumerate(sampled_ids):
            try:
                detail = client.get_match_detail(fid)
                parsed = parse_match(detail)
                if parsed:
                    # Check that we have formations (crucial for the game)
                    home_formation = parsed["home_lineup"].get("formation", "")
                    away_formation = parsed["away_lineup"].get("formation", "")
                    if not home_formation or not away_formation:
                        logger.debug(f"  Skipping {fid}: missing formation")
                        continue
                    all_raw_matches.append(parsed)
                    success += 1
                else:
                    logger.debug(f"  Skipping {fid}: incomplete data")
            except Exception as e:
                logger.warning(f"  Failed fixture {fid}: {e}")

            if (i + 1) % 10 == 0:
                logger.info(f"  Progress: {i+1}/{sample_size} ({success} valid)")

        logger.info(f"  Got {success} valid matches from {season_label}")

    logger.info(f"Total raw matches: {len(all_raw_matches)}")

    # Transform and write
    count = transform_all(all_raw_matches, args.output)
    logger.info(f"Wrote {count} matches to {args.output}")


if __name__ == "__main__":
    main()
