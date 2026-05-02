"""
Geocodes location strings to lat/lng using Nominatim (OpenStreetMap).
Includes a simple in-memory cache to avoid duplicate requests.
"""

import logging
import time
from functools import lru_cache

import requests

logger = logging.getLogger(__name__)

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
NOMINATIM_HEADERS = {
    "User-Agent": "FindThem-MissingPersonsMap/1.0 (educational project)",
    "Accept-Language": "en",
}

_geo_cache = {}


def geocode_location(query: str):
    """Return {'lat': float, 'lng': float} for a location string, or None."""
    if not query or not query.strip():
        return None

    key = query.lower().strip()
    if key in _geo_cache:
        return _geo_cache[key]

    params = {
        "q": query,
        "format": "json",
        "limit": 1,
        "countrycodes": "us",
        "addressdetails": 0,
    }

    try:
        resp = requests.get(
            NOMINATIM_URL,
            params=params,
            headers=NOMINATIM_HEADERS,
            timeout=10,
        )
        resp.raise_for_status()
        results = resp.json()
        if results:
            result = results[0]
            coords = {
                "lat": float(result["lat"]),
                "lng": float(result["lon"]),
            }
            _geo_cache[key] = coords
            return coords
    except Exception as e:
        logger.warning(f"Geocoding failed for '{query}': {e}")

    _geo_cache[key] = None
    return None
