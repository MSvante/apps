"""Name normalization utilities for Python side."""

import unicodedata


def normalize_name(name: str) -> str:
    """
    Normalize a name for accent-insensitive comparison.
    Uses NFD decomposition to strip diacritics, then lowercases.
    """
    nfkd = unicodedata.normalize("NFD", name)
    stripped = "".join(c for c in nfkd if unicodedata.category(c) != "Mn")
    return stripped.lower().strip()


# Players known by single names or with common alternate names
SINGLE_NAME_OVERRIDES: dict[str, dict] = {
    "Fred": {"lastName": "Fred", "alternateNames": []},
    "Fabinho": {"lastName": "Fabinho", "alternateNames": []},
    "Willian": {"lastName": "Willian", "alternateNames": []},
    "Fernandinho": {"lastName": "Fernandinho", "alternateNames": []},
    "Jorginho": {"lastName": "Jorginho", "alternateNames": []},
    "Richarlison": {"lastName": "Richarlison", "alternateNames": []},
    "Allan": {"lastName": "Allan", "alternateNames": []},
    "Alisson": {"lastName": "Alisson", "alternateNames": []},
    "Ederson": {"lastName": "Ederson", "alternateNames": []},
    "Nani": {"lastName": "Nani", "alternateNames": []},
    "Ramires": {"lastName": "Ramires", "alternateNames": []},
    "Oscar": {"lastName": "Oscar", "alternateNames": []},
    "Hulk": {"lastName": "Hulk", "alternateNames": []},
    "Paulinho": {"lastName": "Paulinho", "alternateNames": []},
    "Emerson": {"lastName": "Emerson", "alternateNames": []},
    "Douglas Luiz": {"lastName": "Douglas Luiz", "alternateNames": ["Douglas"]},
    "Bernardo Silva": {
        "lastName": "Silva",
        "alternateNames": ["Bernardo"],
    },
    "David Silva": {
        "lastName": "Silva",
        "alternateNames": ["David Silva"],
    },
}


def extract_last_name(full_name: str) -> tuple[str, list[str]]:
    """
    Extract last name and alternate names from a full name.
    Returns (lastName, alternateNames).
    """
    # Check overrides first
    for key, override in SINGLE_NAME_OVERRIDES.items():
        if key.lower() in full_name.lower():
            return override["lastName"], override["alternateNames"]

    parts = full_name.strip().split()
    if len(parts) == 1:
        return parts[0], []

    last = parts[-1]
    alternates: list[str] = []

    # Handle hyphenated names like "Oxlade-Chamberlain"
    if "-" in last and len(last.split("-")) > 1:
        hyphen_parts = last.split("-")
        alternates.append(hyphen_parts[-1])  # e.g., "Chamberlain"

    # Handle "van Dijk", "de Gea" etc.
    prefixes = {"van", "de", "di", "von", "el", "al", "le", "la", "dos", "da"}
    if len(parts) >= 3 and parts[-2].lower() in prefixes:
        last = f"{parts[-2]} {parts[-1]}"

    return last, alternates
