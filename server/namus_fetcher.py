"""
Fetches missing persons cases from NamUs (www.namus.gov) for all 50 US states.

Key discovery: the API requires a `projections` array in the request body to
return actual case records. Without it, the API returns only the count with
an empty results array. No authentication required.

Results are cached to a local JSON file and refreshed every 24 hours.
"""

import json
import time
import logging
from datetime import datetime, timedelta
from pathlib import Path

import requests

from geocoder import geocode_location

logger = logging.getLogger(__name__)

NAMUS_SEARCH_URL = "https://www.namus.gov/api/CaseSets/NamUs/MissingPersons/Search"
NAMUS_CASE_BASE = "https://www.namus.gov/MissingPersons/Case#"
NAMUS_IMG_BASE = "https://www.namus.gov/api/CaseSets/NamUs/MissingPersons/Cases"
CACHE_FILE = Path(__file__).parent / "cache" / "cases.json"
CACHE_TTL_HOURS = 24
BATCH_SIZE = 250
REQUEST_DELAY = 1.2  # seconds between requests

# Fields to request from the API — unlocks the results array
PROJECTIONS = [
    "idFormatted",
    "dateOfLastContact",
    "lastName",
    "firstName",
    "computedMissingMinAge",
    "computedMissingMaxAge",
    "cityOfLastContact",
    "countyDisplayNameOfLastContact",
    "stateDisplayNameOfLastContact",
    "gender",
    "raceEthnicity",
    "namus2Number",
]

US_STATES = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
    "DC",
]

STATE_FULL_NAMES = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas",
    "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware",
    "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho",
    "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas",
    "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
    "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi",
    "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada",
    "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York",
    "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma",
    "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
    "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah",
    "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia",
    "WI": "Wisconsin", "WY": "Wyoming", "DC": "District of Columbia",
}

NAMUS_HEADERS = {
    "Content-Type": "application/json;charset=UTF-8",
    "Accept": "application/json, text/plain, */*",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Referer": "https://www.namus.gov/MissingPersons/Search",
    "Origin": "https://www.namus.gov",
}


def is_cache_valid():
    if not CACHE_FILE.exists():
        return False
    try:
        with open(CACHE_FILE) as f:
            data = json.load(f)
        cached_at = datetime.fromisoformat(data.get("cached_at", "2000-01-01"))
        return datetime.utcnow() - cached_at < timedelta(hours=CACHE_TTL_HOURS)
    except Exception:
        return False


def load_cache():
    try:
        with open(CACHE_FILE) as f:
            return json.load(f)
    except Exception:
        return None


def save_cache(cases):
    CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "cached_at": datetime.utcnow().isoformat(),
        "total": len(cases),
        "cases": cases,
    }
    with open(CACHE_FILE, "w") as f:
        json.dump(payload, f)
    logger.info(f"Cached {len(cases)} cases to {CACHE_FILE}")


def fetch_state_cases(state_abbr, skip=0, max_retries=3):
    """Fetch one page of cases for a single state, with retries on transient failures."""
    body = {
        "predicates": [
            {
                "field": "stateOfLastContact",
                "operator": "IsIn",
                "values": [STATE_FULL_NAMES.get(state_abbr, state_abbr)],
            }
        ],
        "projections": PROJECTIONS,
        "orderSpecifications": [{"field": "dateOfLastContact", "direction": "Descending"}],
        "take": BATCH_SIZE,
        "skip": skip,
    }
    for attempt in range(1, max_retries + 1):
        try:
            resp = requests.post(
                NAMUS_SEARCH_URL,
                json=body,
                headers=NAMUS_HEADERS,
                timeout=30,
            )
            resp.raise_for_status()
            return resp.json()
        except requests.RequestException as e:
            backoff = 2 ** attempt  # 2s, 4s, 8s
            logger.warning(
                f"Attempt {attempt}/{max_retries} failed for {state_abbr} (skip={skip}): {e}. "
                f"Retrying in {backoff}s..."
            )
            if attempt < max_retries:
                time.sleep(backoff)
    logger.error(f"Giving up on {state_abbr} (skip={skip}) after {max_retries} attempts.")
    return None


def parse_case(raw, state_abbr):
    """Normalize a raw NamUs case record into a clean dict."""
    namus_num = raw.get("namus2Number")
    case_id = raw.get("idFormatted") or (f"MP{namus_num}" if namus_num else "")
    state_full = STATE_FULL_NAMES.get(state_abbr, state_abbr)

    first = raw.get("firstName") or ""
    last = raw.get("lastName") or ""
    full_name = f"{first} {last}".strip() or "Unknown"

    age_from = raw.get("computedMissingMinAge")
    age_to = raw.get("computedMissingMaxAge")
    if age_from is not None and age_to is not None and age_from != age_to:
        age_display = f"{age_from}–{age_to}"
    elif age_from is not None:
        age_display = str(age_from)
    else:
        age_display = raw.get("missingAgeRangeValue") or "Unknown"

    date_raw = raw.get("dateOfLastContact", "")
    date_missing = ""
    if date_raw:
        try:
            date_missing = datetime.fromisoformat(date_raw.replace("Z", "")).strftime("%B %d, %Y")
        except Exception:
            date_missing = date_raw[:10]

    city = raw.get("cityOfLastContact") or ""
    county = raw.get("countyDisplayNameOfLastContact") or ""

    # Photo: API returns an image path; prepend base URL
    img_path = raw.get("image", "")
    if img_path and namus_num:
        photo_url = f"https://www.namus.gov{img_path}" if img_path.startswith("/") else img_path
    elif namus_num:
        photo_url = f"{NAMUS_IMG_BASE}/{namus_num}/Images/Default/Thumbnail"
    else:
        photo_url = None

    namus_url = f"{NAMUS_CASE_BASE}/{namus_num}" if namus_num else None

    geo_query = f"{city}, {state_full}" if city else state_full

    return {
        "id": case_id,
        "name": full_name,
        "age": age_display,
        "gender": raw.get("gender") or "Unknown",
        "dateMissing": date_missing,
        "city": city,
        "county": county,
        "state": state_abbr,
        "stateFull": state_full,
        "photoUrl": photo_url,
        "namusUrl": namus_url,
        "lat": None,
        "lng": None,
        "_geoQuery": geo_query,
    }


def enrich_coordinates(cases):
    """Geocode cases using Nominatim, grouping by unique city+state location."""
    location_map = {}
    for case in cases:
        query = case.get("_geoQuery", "")
        if query and query not in location_map:
            location_map[query] = None

    total = len(location_map)
    logger.info(f"Geocoding {total} unique locations via Nominatim...")

    for i, query in enumerate(location_map):
        coords = geocode_location(query)
        location_map[query] = coords
        time.sleep(1.1)  # Nominatim hard rate limit: 1 req/sec
        if i % 50 == 0:
            logger.info(f"  Geocoded {i}/{total} locations...")

    for case in cases:
        coords = location_map.get(case.get("_geoQuery", ""))
        if coords:
            case["lat"] = coords["lat"]
            case["lng"] = coords["lng"]
        case.pop("_geoQuery", None)

    return cases


def fetch_all_cases(progress_callback=None):
    """Fetch all cases from NamUs for every state, geocode, and cache."""
    all_cases = []
    total_states = len(US_STATES)

    for idx, state in enumerate(US_STATES):
        if progress_callback:
            progress_callback(idx, total_states, state)

        logger.info(f"Fetching {state} ({idx + 1}/{total_states})...")
        skip = 0
        state_cases = []

        while True:
            data = fetch_state_cases(state, skip)
            if not data:
                break

            results = data.get("results") or []
            if not results:
                break

            for raw in results:
                state_cases.append(parse_case(raw, state))

            total_count = data.get("count") or 0
            skip += BATCH_SIZE
            if skip >= total_count:
                break

            time.sleep(REQUEST_DELAY)

        logger.info(f"  → {len(state_cases)} cases from {state}")
        all_cases.extend(state_cases)

        if idx < total_states - 1:
            time.sleep(REQUEST_DELAY)

    logger.info(f"Total: {len(all_cases)} cases. Starting geocoding...")
    all_cases = enrich_coordinates(all_cases)
    save_cache(all_cases)
    return all_cases


def get_cases(force_refresh=False):
    """Return cases from cache (if valid) or fetch fresh from NamUs."""
    if not force_refresh and is_cache_valid():
        logger.info("Serving from cache.")
        cached = load_cache()
        if cached:
            return cached.get("cases", [])

    logger.info("Cache expired or missing. Fetching from NamUs...")
    return fetch_all_cases()

