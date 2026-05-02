# FindThem — Missing Persons Interactive Map

An interactive 3D map of the United States showing active missing persons cases, pulling live data directly from [NamUs (National Missing and Unidentified Persons System)](https://namus.nij.ojp.gov).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Map | Mapbox GL JS (3D globe mode) |
| Styling | Tailwind CSS |
| Backend | Python + Flask |
| Geocoding | Nominatim (OpenStreetMap) |
| Deploy | Vercel (frontend) + Railway (backend) |

---

## Local Development

### Prerequisites

- Node.js 18+
- Python 3.10+
- A Mapbox account (free tier is sufficient)

### 1. Clone & install

```bash
git clone https://github.com/youruser/findthem.git
cd findthem
```

### 2. Start the Flask backend

```bash
cd server
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run the dev server
python app.py
# → Running on http://localhost:5001
```

On first run, the server will fetch all 50 states from NamUs (~10 minutes due to rate limiting) and cache results to `server/cache/cases.json`. Subsequent starts load from cache instantly.

### 3. Start the React frontend

```bash
cd client
npm install
cp .env.example .env              # already pre-filled with the Mapbox token
npm run dev
# → http://localhost:5173
```

---

## Environment Variables

Copy `.env.example` and fill in values:

```
# client/.env
VITE_MAPBOX_TOKEN=pk.eyJ1...      # Your Mapbox public token
VITE_API_URL=http://localhost:5001

# server (Railway env vars or .env)
PORT=5001
FLASK_DEBUG=false
```

---

## Deployment

### Backend → Railway

1. Create a new Railway project, connect the `/server` directory
2. Set env vars: `PORT=8080` (Railway sets this automatically)
3. Railway will detect `Procfile` and run: `gunicorn app:app`
4. Copy the Railway public URL

### Frontend → Vercel

1. Import the `/client` directory into Vercel
2. Set env vars:
   - `VITE_MAPBOX_TOKEN` = your Mapbox token
   - `VITE_API_URL` = your Railway backend URL (e.g. `https://findthem-backend.up.railway.app`)
3. Deploy — Vercel auto-detects Vite

---

## Data Architecture

```
NamUs API (50 states)
   ↓  POST /api/CaseSets/NamUs/MissingPersons/Search
Flask backend
   ↓  parse + normalize case fields
Nominatim geocoder
   ↓  city + state → lat/lng (cached per unique location)
cases.json (24h TTL cache)
   ↓  GET /api/cases
React frontend → Mapbox GL JS
```

---

## Features

- 3D globe cinematic intro animation on load
- 50,000+ cases rendered as clustered amber pins
- Real-time filter by state, age range, gender, date missing
- Click any pin → slide-in case detail panel with photo, NamUs link, share button
- Dark intelligence dashboard aesthetic
- Fully mobile responsive
- Error boundaries per state fetch

---

## If You Have Information

Call the **NCMEC 24/7 hotline: 1-800-843-5678**

Or visit the individual NamUs case page linked on each pin.

---

## Disclaimer

FindThem is an independent visualization project. Not affiliated with NamUs, NCMEC, or any law enforcement agency. All data is sourced directly and unmodified from NamUs.
