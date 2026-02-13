"""Parse PulseLive API JSON responses into intermediate data structures."""

import re
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# Map API position codes to our position categories
POSITION_MAP = {
    "G": "GK",
    "D": "DEF",
    "M": "MID",
    "F": "FWD",
}


def parse_match_date(kickoff: dict) -> str | None:
    """Extract ISO date string from kickoff data."""
    # Try millis first
    millis = kickoff.get("millis")
    if millis:
        dt = datetime.utcfromtimestamp(millis / 1000)
        return dt.strftime("%Y-%m-%d")

    # Fall back to label parsing
    label = kickoff.get("label")
    if label:
        # "Sun 10 Nov 2019, 16:30"
        match = re.search(r"(\d{1,2}\s\w+\s\d{4})", label)
        if match:
            try:
                dt = datetime.strptime(match.group(1), "%d %b %Y")
                return dt.strftime("%Y-%m-%d")
            except ValueError:
                pass
    return None


def parse_birth_date(birth: dict) -> str | None:
    """Extract birth date as YYYY-MM-DD from the birth object."""
    millis = birth.get("millis") if birth else None
    if millis:
        dt = datetime.utcfromtimestamp(millis / 1000)
        return dt.strftime("%Y-%m-%d")

    label = birth.get("date", {}).get("label", "") if birth else ""
    if label:
        # "24 October 1985"
        try:
            dt = datetime.strptime(label, "%d %B %Y")
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            pass
    return None


def parse_player(player_data: dict) -> dict:
    """Parse a player entry from the API lineup."""
    name_obj = player_data.get("name", {})
    display_name = name_obj.get("display", "")
    first_name = name_obj.get("first", "")
    last_name_raw = name_obj.get("last", "")

    # Use display name as full name
    name = display_name or f"{first_name} {last_name_raw}".strip()

    # Nationality
    nat_team = player_data.get("nationalTeam", {})
    nationality = nat_team.get("country", "") if nat_team else ""

    # Birth date
    birth = player_data.get("birth", {})
    birth_date = parse_birth_date(birth) if birth else None

    # Shirt number and position
    shirt_number = player_data.get("matchShirtNumber", 0) or 0
    match_position = player_data.get("matchPosition", "")

    return {
        "name": name,
        "nationality": nationality,
        "birth_date": birth_date or "",
        "shirtNumber": shirt_number if shirt_number > 0 else 0,
        "api_position": match_position,
    }


def infer_formation(players: list[dict]) -> str:
    """
    Infer a formation string from player position counts.
    E.g. 1G + 4D + 4M + 2F → "4-4-2"
    """
    counts = {"D": 0, "M": 0, "F": 0}
    for p in players:
        pos = p.get("api_position", "")
        if pos in counts:
            counts[pos] += 1

    d, m, f = counts["D"], counts["M"], counts["F"]
    # Sanity check: should add up to 10 (excluding GK)
    if d + m + f != 10:
        return ""

    return f"{d}-{m}-{f}"


def parse_team_list(team_list: dict) -> dict | None:
    """Parse a teamList entry into lineup data."""
    lineup = team_list.get("lineup", [])
    if len(lineup) != 11:
        logger.warning(f"Lineup has {len(lineup)} players, expected 11")
        return None

    formation_obj = team_list.get("formation", {})
    formation_label = formation_obj.get("label", "") if formation_obj else ""

    players = []
    for p in lineup:
        players.append(parse_player(p))

    # If no formation from API, infer from position counts
    if not formation_label:
        formation_label = infer_formation(players)

    return {
        "formation": formation_label,
        "players": players,
    }


def parse_match(data: dict) -> dict | None:
    """
    Parse full match detail JSON into our intermediate format.
    Returns None if data is incomplete.
    """
    # Match metadata
    kickoff = data.get("kickoff", {})
    match_date = parse_match_date(kickoff)
    if not match_date:
        return None

    # Teams
    teams = data.get("teams", [])
    if len(teams) < 2:
        return None

    home_team = None
    away_team = None
    for t in teams:
        team_data = t.get("team", {})
        side = t.get("side")  # Not always present
        if not side:
            # Fall back to the "teamType" field
            side = t.get("teamType", "")
        if side == "home":
            home_team = team_data
            home_score = t.get("score", 0)
        elif side == "away":
            away_team = team_data
            away_score = t.get("score", 0)

    if not home_team or not away_team:
        # Sometimes teams are just [home, away] in order
        home_team = teams[0].get("team", {})
        home_score = teams[0].get("score", 0)
        away_team = teams[1].get("team", {})
        away_score = teams[1].get("score", 0)

    # Team lists (lineups)
    team_lists = data.get("teamLists", [])
    if len(team_lists) < 2:
        return None

    # Match team lists to home/away
    home_lineup = None
    away_lineup = None
    home_id = home_team.get("id")
    away_id = away_team.get("id")

    for tl in team_lists:
        tl_team_id = tl.get("teamId")
        if tl_team_id == home_id:
            home_lineup = parse_team_list(tl)
        elif tl_team_id == away_id:
            away_lineup = parse_team_list(tl)

    if not home_lineup or not away_lineup:
        # Fallback: assume order matches [home, away]
        if len(team_lists) >= 2:
            home_lineup = home_lineup or parse_team_list(team_lists[0])
            away_lineup = away_lineup or parse_team_list(team_lists[1])

    if not home_lineup or not away_lineup:
        return None

    # Season
    comp_season = data.get("compSeason", {})
    season_label = comp_season.get("label", "")

    return {
        "id": str(data.get("id", "")),
        "date": match_date,
        "season": season_label,
        "home_team": home_team.get("name", ""),
        "away_team": away_team.get("name", ""),
        "score": f"{home_score}-{away_score}",
        "home_lineup": home_lineup,
        "away_lineup": away_lineup,
    }
