"""
FindThem Flask backend — serves NamUs missing persons data to the React frontend.
"""

import logging
import os
import threading
from flask import Flask, jsonify, request
from flask_cors import CORS

from namus_fetcher import get_cases, is_cache_valid, CACHE_FILE

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=["*"])

# Background refresh state
_refresh_lock = threading.Lock()
_refresh_in_progress = False


def _background_refresh():
    global _refresh_in_progress
    with _refresh_lock:
        if _refresh_in_progress:
            return
        _refresh_in_progress = True
    try:
        logger.info("Starting background cache refresh...")
        get_cases(force_refresh=True)
        logger.info("Background cache refresh complete.")
    except Exception as e:
        logger.error(f"Background refresh failed: {e}")
    finally:
        with _refresh_lock:
            _refresh_in_progress = False


@app.route("/api/cases", methods=["GET"])
def cases():
    """
    Returns all missing persons cases.
    Query params:
      - state: filter by state abbreviation (e.g. WA)
      - gender: filter by gender (Male/Female/Unknown)
      - age_min / age_max: filter by age range
      - refresh: if 'true', trigger a background cache refresh
    """
    trigger_refresh = request.args.get("refresh", "").lower() == "true"

    if trigger_refresh and not _refresh_in_progress:
        t = threading.Thread(target=_background_refresh, daemon=True)
        t.start()

    try:
        all_cases = get_cases()
    except Exception as e:
        logger.error(f"Failed to get cases: {e}")
        return jsonify({"error": "Failed to fetch cases from NamUs", "cases": []}), 500

    # Apply optional server-side filters
    state_filter = request.args.get("state", "").upper()
    gender_filter = request.args.get("gender", "")
    age_min = request.args.get("age_min", type=int)
    age_max = request.args.get("age_max", type=int)

    filtered = all_cases

    if state_filter:
        filtered = [c for c in filtered if c.get("state") == state_filter]

    if gender_filter:
        filtered = [c for c in filtered if (c.get("gender") or "").lower() == gender_filter.lower()]

    if age_min is not None or age_max is not None:
        def age_matches(case):
            age_str = case.get("age", "")
            # Parse "25–30" or "25" formats
            try:
                if "–" in age_str or "-" in age_str:
                    parts = age_str.replace("–", "-").split("-")
                    lo, hi = int(parts[0]), int(parts[1])
                else:
                    lo = hi = int(age_str)
            except (ValueError, IndexError):
                return True  # Keep unknown ages
            if age_min is not None and hi < age_min:
                return False
            if age_max is not None and lo > age_max:
                return False
            return True
        filtered = [c for c in filtered if age_matches(c)]

    return jsonify({
        "total": len(filtered),
        "cases": filtered,
        "cacheValid": is_cache_valid(),
        "refreshInProgress": _refresh_in_progress,
    })


@app.route("/api/status", methods=["GET"])
def status():
    cache_exists = CACHE_FILE.exists()
    return jsonify({
        "status": "ok",
        "cacheExists": cache_exists,
        "cacheValid": is_cache_valid(),
        "refreshInProgress": _refresh_in_progress,
    })


@app.route("/api/refresh", methods=["POST"])
def trigger_refresh():
    """Manually trigger a cache refresh in the background."""
    if _refresh_in_progress:
        return jsonify({"message": "Refresh already in progress"}), 202
    t = threading.Thread(target=_background_refresh, daemon=True)
    t.start()
    return jsonify({"message": "Cache refresh started in background"}), 202


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
