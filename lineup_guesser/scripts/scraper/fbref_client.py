"""FBref HTTP client with rate limiting and caching via soccerdata."""

import time
import logging
from pathlib import Path

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

FBREF_BASE = "https://fbref.com"
REQUEST_DELAY = 5  # seconds between requests


class FBrefClient:
    """HTTP client for FBref with rate limiting."""

    def __init__(self, cache_dir: Path | None = None):
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": (
                    "Mozilla/5.0 (compatible; lineup-guesser-scraper/1.0; "
                    "educational project)"
                ),
            }
        )
        self.last_request_time = 0.0
        self.cache_dir = cache_dir or Path(__file__).parent / ".cache"
        self.cache_dir.mkdir(exist_ok=True)

    def _rate_limit(self):
        elapsed = time.time() - self.last_request_time
        if elapsed < REQUEST_DELAY:
            sleep_time = REQUEST_DELAY - elapsed
            logger.debug(f"Rate limiting: sleeping {sleep_time:.1f}s")
            time.sleep(sleep_time)

    def _cache_path(self, url: str) -> Path:
        """Generate a cache file path for a URL."""
        import hashlib

        url_hash = hashlib.md5(url.encode()).hexdigest()
        return self.cache_dir / f"{url_hash}.html"

    def get(self, url: str, use_cache: bool = True) -> str:
        """Fetch a URL with caching and rate limiting."""
        cache_file = self._cache_path(url)

        if use_cache and cache_file.exists():
            logger.debug(f"Cache hit: {url}")
            return cache_file.read_text(encoding="utf-8")

        self._rate_limit()
        logger.info(f"Fetching: {url}")

        response = self.session.get(url, timeout=30)
        response.raise_for_status()
        self.last_request_time = time.time()

        html = response.text
        if use_cache:
            cache_file.write_text(html, encoding="utf-8")

        return html

    def get_soup(self, url: str, use_cache: bool = True) -> BeautifulSoup:
        """Fetch a URL and return a BeautifulSoup object."""
        html = self.get(url, use_cache=use_cache)
        return BeautifulSoup(html, "lxml")
