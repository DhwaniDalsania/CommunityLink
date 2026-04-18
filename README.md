# CommunityLink — Full Stack Implementation

AI-powered volunteer coordination platform.
**Stack: Python Flask · Google Firestore · Gemini AI · Docker · Cloud Run**

---

## Project Structure

```
communitylink/
├── backend/
│   ├── app.py              # Flask server — all API routes
│   ├── seed_data.py        # Firestore seed data
│   └── requirements.txt
├── frontend/
│   ├── index.html          # Dashboard
│   ├── needs.html          # Report a Need
│   ├── volunteer.html      # Register as Volunteer
│   ├── match.html          # Gemini AI Smart Match
│   ├── css/main.css
│   └── js/
│       ├── api.js          # API client (replaces localStorage)
│       ├── dashboard.js
│       ├── needs.js
│       ├── volunteer.js
│       └── match.js
├── Dockerfile              # Production container
├── deploy.sh               # Cloud Run deploy script
├── .env.example            # Environment variable template
└── README.md
```

---

## What's Implemented

### ✅ Backend — Python + Flask
- Full REST API at `/api/*`
- Serves frontend static files
- All routes: needs, volunteers, matches, activity, stats, seed, health
- Proper error handling and JSON responses

### ✅ Database — Google Firestore
- Real cloud database, shared across all users
- All CRUD via `backend/app.py`
- `POST /api/seed` populates Firestore with demo data

### ✅ AI — Google Gemini API
- `POST /api/ai/match` — sends needs+volunteers to Gemini, returns ranked matches with explanations
- `POST /api/ai/insight` — generates dashboard AI insight from live data
- Graceful fallback to local scoring if Gemini is unavailable

### ✅ Hosting — Google Cloud Run
- `Dockerfile` builds production container
- `deploy.sh` — one command to build, push, and deploy
- Environment variables injected via Cloud Run secrets

---

## Local Setup

### 1. Clone and install dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and fill in:
# - GOOGLE_CLOUD_PROJECT
# - GOOGLE_APPLICATION_CREDENTIALS (path to your service account JSON)
# - GEMINI_API_KEY
```

### 3. Get a Gemini API key

Go to https://aistudio.google.com/app/apikey — it's free.

### 4. Set up Firestore

1. Go to https://console.cloud.google.com
2. Create a project (or use existing)
3. Enable Firestore in Native mode
4. Create a service account with "Cloud Datastore User" role
5. Download the JSON key → set path in `.env`

### 5. Run locally

```bash
cd backend
python app.py
# Open http://localhost:8080
```

### 6. Load demo data

Click "Load Demo Data" on the dashboard, or:
```bash
curl -X POST http://localhost:8080/api/seed
```

---

## Deploy to Cloud Run

```bash
# Set your project ID
export GOOGLE_CLOUD_PROJECT=your-project-id
export GEMINI_API_KEY=your-key

# One command deploy
bash deploy.sh
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/needs` | List all needs |
| POST | `/api/needs` | Create a need |
| PATCH | `/api/needs/:id` | Update need status |
| GET | `/api/volunteers` | List all volunteers |
| POST | `/api/volunteers` | Register volunteer |
| GET | `/api/matches` | List all matches |
| POST | `/api/matches` | Create a match (assigns need) |
| GET | `/api/activity` | Recent activity feed |
| GET | `/api/stats` | Platform stats |
| POST | `/api/ai/match` | Gemini AI matching |
| POST | `/api/ai/insight` | Gemini AI dashboard insight |
| POST | `/api/seed` | Seed demo data |
| GET | `/health` | Health check |

---

## Health Check

```bash
curl http://localhost:8080/health
# {"status":"ok","db":"connected","gemini":"configured","version":"2.0.0"}
```
