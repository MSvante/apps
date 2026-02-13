"""HTML parsing for lineup and formation data from FBref match pages."""

import re
import logging

from bs4 import BeautifulSoup, Tag

logger = logging.getLogger(__name__)


def parse_match_lineups(soup: BeautifulSoup) -> dict:
    """
    Parse lineup data from an FBref match page.
    Returns dict with home/away lineup info.
    """
    result = {"home": None, "away": None}

    lineup_divs = soup.select("div.lineup")
    if len(lineup_divs) < 2:
        logger.warning("Could not find two lineup divs")
        return result

    for i, side in enumerate(["home", "away"]):
        div = lineup_divs[i]
        result[side] = _parse_lineup_div(div)

    return result


def _parse_lineup_div(div: Tag) -> dict | None:
    """Parse a single lineup div to extract formation and player list."""
    formation = None
    players = []

    # Formation is often in the heading
    heading = div.find(["th", "td"], string=re.compile(r"\d+-\d+"))
    if heading:
        match = re.search(r"(\d+(?:-\d+)+)", heading.get_text())
        if match:
            formation = match.group(1)

    # Players are in table rows
    rows = div.select("tr")
    for row in rows:
        # Skip header rows and sub rows
        th = row.find("th")
        if th and th.get("data-stat") == "player":
            continue

        tds = row.find_all("td")
        if not tds:
            continue

        player_data = _parse_player_row(tds)
        if player_data:
            players.append(player_data)

        # Stop after 11 starters (before subs section)
        if len(players) >= 11:
            break

    if len(players) != 11:
        logger.warning(f"Found {len(players)} starters, expected 11")
        return None

    return {"formation": formation, "players": players}


def _parse_player_row(tds: list[Tag]) -> dict | None:
    """Parse a table row into player data."""
    if not tds:
        return None

    # Find the player name cell (usually has an <a> tag)
    name_cell = None
    for td in tds:
        if td.find("a"):
            name_cell = td
            break

    if not name_cell:
        return None

    link = name_cell.find("a")
    if not link:
        return None

    name = link.get_text(strip=True)
    href = link.get("href", "")

    # Try to find shirt number
    shirt_number = 0
    number_cell = tds[0] if tds else None
    if number_cell:
        text = number_cell.get_text(strip=True)
        if text.isdigit():
            shirt_number = int(text)

    return {
        "name": name,
        "href": href,
        "shirtNumber": shirt_number,
    }


def parse_player_page(soup: BeautifulSoup) -> dict:
    """Parse a player's FBref page for nationality, birth date, etc."""
    info = {
        "nationality": "",
        "birth_date": "",
    }

    # Nationality from player meta
    meta = soup.select_one("div#meta")
    if meta:
        # Look for nationality
        for p_tag in meta.find_all("p"):
            text = p_tag.get_text()
            if "National Team" in text or "Citizenship" in text:
                a_tag = p_tag.find("a")
                if a_tag:
                    info["nationality"] = a_tag.get_text(strip=True)
                break

        # Birth date
        birth_span = meta.select_one("span#necro-birth")
        if birth_span:
            info["birth_date"] = birth_span.get("data-birth", "")

    return info
