"""Transform raw scraped data into the final JSON schema."""

import json
from datetime import datetime
from pathlib import Path

from normalize import normalize_name, extract_last_name
from formation_mapper import formation_to_positions

# Common nationality → flag emoji map
NATIONALITY_FLAGS: dict[str, str] = {
    "Afghanistan": "\U0001f1e6\U0001f1eb",
    "Albania": "\U0001f1e6\U0001f1f1",
    "Algeria": "\U0001f1e9\U0001f1ff",
    "Argentina": "\U0001f1e6\U0001f1f7",
    "Australia": "\U0001f1e6\U0001f1fa",
    "Austria": "\U0001f1e6\U0001f1f9",
    "Belgium": "\U0001f1e7\U0001f1ea",
    "Brazil": "\U0001f1e7\U0001f1f7",
    "Bulgaria": "\U0001f1e7\U0001f1ec",
    "Cameroon": "\U0001f1e8\U0001f1f2",
    "Canada": "\U0001f1e8\U0001f1e6",
    "Chile": "\U0001f1e8\U0001f1f1",
    "Colombia": "\U0001f1e8\U0001f1f4",
    "Costa Rica": "\U0001f1e8\U0001f1f7",
    "Croatia": "\U0001f1ed\U0001f1f7",
    "Czech Republic": "\U0001f1e8\U0001f1ff",
    "Czechia": "\U0001f1e8\U0001f1ff",
    "Denmark": "\U0001f1e9\U0001f1f0",
    "DR Congo": "\U0001f1e8\U0001f1e9",
    "Ecuador": "\U0001f1ea\U0001f1e8",
    "Egypt": "\U0001f1ea\U0001f1ec",
    "England": "\U0001F3F4\U000E0067\U000E0062\U000E0065\U000E006E\U000E0067\U000E007F",
    "Finland": "\U0001f1eb\U0001f1ee",
    "France": "\U0001f1eb\U0001f1f7",
    "Gabon": "\U0001f1ec\U0001f1e6",
    "Georgia": "\U0001f1ec\U0001f1ea",
    "Germany": "\U0001f1e9\U0001f1ea",
    "Ghana": "\U0001f1ec\U0001f1ed",
    "Greece": "\U0001f1ec\U0001f1f7",
    "Guinea": "\U0001f1ec\U0001f1f3",
    "Honduras": "\U0001f1ed\U0001f1f3",
    "Hungary": "\U0001f1ed\U0001f1fa",
    "Iceland": "\U0001f1ee\U0001f1f8",
    "Iran": "\U0001f1ee\U0001f1f7",
    "Ireland": "\U0001f1ee\U0001f1ea",
    "Republic of Ireland": "\U0001f1ee\U0001f1ea",
    "Israel": "\U0001f1ee\U0001f1f1",
    "Italy": "\U0001f1ee\U0001f1f9",
    "Ivory Coast": "\U0001f1e8\U0001f1ee",
    "Jamaica": "\U0001f1ef\U0001f1f2",
    "Japan": "\U0001f1ef\U0001f1f5",
    "Kenya": "\U0001f1f0\U0001f1ea",
    "Mexico": "\U0001f1f2\U0001f1fd",
    "Morocco": "\U0001f1f2\U0001f1e6",
    "Netherlands": "\U0001f1f3\U0001f1f1",
    "New Zealand": "\U0001f1f3\U0001f1ff",
    "Nigeria": "\U0001f1f3\U0001f1ec",
    "Northern Ireland": "\U0001F1EC\U0001F1E7",
    "Norway": "\U0001f1f3\U0001f1f4",
    "Paraguay": "\U0001f1f5\U0001f1fe",
    "Peru": "\U0001f1f5\U0001f1ea",
    "Poland": "\U0001f1f5\U0001f1f1",
    "Portugal": "\U0001f1f5\U0001f1f9",
    "Romania": "\U0001f1f7\U0001f1f4",
    "Russia": "\U0001f1f7\U0001f1fa",
    "Scotland": "\U0001F3F4\U000E0067\U000E0062\U000E0073\U000E0063\U000E0074\U000E007F",
    "Senegal": "\U0001f1f8\U0001f1f3",
    "Serbia": "\U0001f1f7\U0001f1f8",
    "Slovakia": "\U0001f1f8\U0001f1f0",
    "Slovenia": "\U0001f1f8\U0001f1ee",
    "South Africa": "\U0001f1ff\U0001f1e6",
    "South Korea": "\U0001f1f0\U0001f1f7",
    "Spain": "\U0001f1ea\U0001f1f8",
    "Sweden": "\U0001f1f8\U0001f1ea",
    "Switzerland": "\U0001f1e8\U0001f1ed",
    "Togo": "\U0001f1f9\U0001f1ec",
    "Tunisia": "\U0001f1f9\U0001f1f3",
    "Turkey": "\U0001f1f9\U0001f1f7",
    "Ukraine": "\U0001f1fa\U0001f1e6",
    "United States": "\U0001f1fa\U0001f1f8",
    "Uruguay": "\U0001f1fa\U0001f1fe",
    "Venezuela": "\U0001f1fb\U0001f1ea",
    "Wales": "\U0001F3F4\U000E0067\U000E0062\U000E0077\U000E006C\U000E0073\U000E007F",
    "Zambia": "\U0001f1ff\U0001f1f2",
    "Zimbabwe": "\U0001f1ff\U0001f1fc",
    "Cote d'Ivoire": "\U0001f1e8\U0001f1ee",
    "Mali": "\U0001f1f2\U0001f1f1",
    "Benin": "\U0001f1e7\U0001f1ef",
    "Congo DR": "\U0001f1e8\U0001f1e9",
    "Gambia": "\U0001f1ec\U0001f1f2",
    "Guinea-Bissau": "\U0001f1ec\U0001f1fc",
    "Kosovo": "\U0001f1fd\U0001f1f0",
    "Burkina Faso": "\U0001f1e7\U0001f1eb",
    "Sierra Leone": "\U0001f1f8\U0001f1f1",
    "Mozambique": "\U0001f1f2\U0001f1ff",
}


def get_flag(nationality: str) -> str:
    """Get flag emoji for a nationality. Returns empty string if unknown."""
    return NATIONALITY_FLAGS.get(nationality, "")


def calculate_age(birth_date: str, match_date: str) -> int:
    """Calculate age at the time of the match."""
    try:
        birth = datetime.strptime(birth_date, "%Y-%m-%d")
        match = datetime.strptime(match_date, "%Y-%m-%d")
        age = match.year - birth.year
        if (match.month, match.day) < (birth.month, birth.day):
            age -= 1
        return age
    except (ValueError, TypeError):
        return 0


def transform_player(
    raw_player: dict,
    match_date: str,
    position: str,
) -> dict:
    """Transform raw player data into the final schema."""
    name = raw_player["name"]
    last_name, alternate_names = extract_last_name(name)
    nationality = raw_player.get("nationality", "")

    player = {
        "name": name,
        "lastName": last_name,
        "lastNameNormalized": normalize_name(last_name),
        "nationality": nationality,
        "nationalityFlag": get_flag(nationality),
        "age": calculate_age(raw_player.get("birth_date", ""), match_date),
        "shirtNumber": raw_player.get("shirtNumber", 0),
        "position": position,
    }

    if alternate_names:
        player["alternateNames"] = alternate_names

    return player


def transform_match(raw_match: dict) -> dict | None:
    """Transform a raw match dict into the final schema."""
    match_date = raw_match["date"]

    result = {
        "id": raw_match["id"],
        "date": match_date,
        "season": raw_match["season"],
        "homeTeam": raw_match["home_team"],
        "awayTeam": raw_match["away_team"],
        "score": raw_match["score"],
    }

    for side in ["home", "away"]:
        raw_lineup = raw_match.get(f"{side}_lineup")
        if not raw_lineup or not raw_lineup.get("formation"):
            return None

        formation = raw_lineup["formation"]
        try:
            positions = formation_to_positions(formation)
        except ValueError as e:
            print(f"  Skipping match {raw_match['id']}: {e}")
            return None

        players = []
        raw_players = raw_lineup.get("players", [])
        if len(raw_players) != 11:
            return None

        for i, raw_player in enumerate(raw_players):
            player = transform_player(raw_player, match_date, positions[i])
            players.append(player)

        result[f"{side}Lineup"] = {
            "formation": formation,
            "players": players,
        }

    return result


def transform_all(raw_matches: list[dict], output_path: Path) -> int:
    """Transform all raw matches and write to JSON."""
    transformed = []
    for raw in raw_matches:
        match = transform_match(raw)
        if match:
            transformed.append(match)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(transformed, f, ensure_ascii=False, indent=2)

    return len(transformed)
