"""Map formation strings to position categories."""

from typing import Literal

Position = Literal["GK", "DEF", "MID", "FWD"]


def formation_to_positions(formation: str) -> list[Position]:
    """
    Given a formation string like "4-2-3-1", return a list of 11 positions
    ordered GK → DEF → MID → FWD.

    The first number is always DEF, the last is always FWD,
    and everything in between is MID.
    """
    positions: list[Position] = ["GK"]

    parts = [int(x) for x in formation.split("-")]

    if len(parts) < 2:
        raise ValueError(f"Invalid formation: {formation}")

    # First group: defenders
    for _ in range(parts[0]):
        positions.append("DEF")

    # Middle groups: midfielders
    for group in parts[1:-1]:
        for _ in range(group):
            positions.append("MID")

    # Last group: forwards
    for _ in range(parts[-1]):
        positions.append("FWD")

    if len(positions) != 11:
        raise ValueError(
            f"Formation {formation} produces {len(positions)} players, expected 11"
        )

    return positions
