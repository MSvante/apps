"""PulseLive Premier League API client with rate limiting and caching."""

import json
import time
import logging
import hashlib
from pathlib import Path

import requests

logger = logging.getLogger(__name__)

API_BASE = "https://footballapi.pulselive.com/football"
REQUEST_DELAY = 0.5  # seconds between requests (API is generous but be polite)


class PLClient:
    """HTTP client for the PulseLive PL API."""

    def __init__(self, cache_dir: Path | None = None):
        self.session = requests.Session()
        self.session.headers.update(
            {
                "Origin": "https://www.premierleague.com",
                "Referer": "https://www.premierleague.com/",
            }
        )
        self.last_request_time = 0.0
        self.cache_dir = cache_dir or Path(__file__).parent / ".cache"
        self.cache_dir.mkdir(exist_ok=True)

    def _rate_limit(self):
        elapsed = time.time() - self.last_request_time
        if elapsed < REQUEST_DELAY:
            time.sleep(REQUEST_DELAY - elapsed)

    def _cache_path(self, url: str, params: dict | None = None) -> Path:
        key = url + (json.dumps(params, sort_keys=True) if params else "")
        url_hash = hashlib.md5(key.encode()).hexdigest()
        return self.cache_dir / f"{url_hash}.json"

    def get_json(self, url: str, params: dict | None = None, use_cache: bool = True) -> dict:
        cache_file = self._cache_path(url, params)

        if use_cache and cache_file.exists():
            return json.loads(cache_file.read_text(encoding="utf-8"))

        self._rate_limit()
        logger.debug(f"Fetching: {url}")

        response = self.session.get(url, params=params, timeout=30)
        response.raise_for_status()
        self.last_request_time = time.time()

        data = response.json()
        if use_cache:
            cache_file.write_text(json.dumps(data), encoding="utf-8")

        return data

    def get_seasons(self) -> list[dict]:
        """Get all PL season IDs."""
        data = self.get_json(
            f"{API_BASE}/competitions/1/compseasons",
            params={"page": "0", "pageSize": "100"},
        )
        return data.get("content", [])

    def get_fixtures(self, season_id: int, page: int = 0, page_size: int = 40) -> dict:
        """Get fixtures for a season (paginated)."""
        return self.get_json(
            f"{API_BASE}/fixtures",
            params={
                "comps": "1",
                "compSeasons": str(season_id),
                "pageSize": str(page_size),
                "page": str(page),
                "sort": "asc",
            },
        )

    def get_all_fixture_ids(self, season_id: int) -> list[int]:
        """Get all fixture IDs for a season."""
        fixture_ids = []
        page = 0
        while True:
            data = self.get_fixtures(season_id, page=page)
            content = data.get("content", [])
            if not content:
                break
            for match in content:
                fixture_ids.append(int(match["id"]))
            # Check if there are more pages
            page_info = data.get("pageInfo", {})
            if page >= page_info.get("numPages", 1) - 1:
                break
            page += 1
        return fixture_ids

    def get_match_detail(self, fixture_id: int) -> dict:
        """Get full match detail including lineups."""
        return self.get_json(f"{API_BASE}/fixtures/{fixture_id}")
