# StrikerIQ

**AI-powered football prediction platform with 90%+ confidence filtering.**

Live: [striker-iq.vercel.app](https://striker-iq.vercel.app)

---

## What It Does

StrikerIQ analyzes upcoming football matches and surfaces only the highest-confidence predictions — filtering out noise so you only see calls with 90%+ confidence scores. It connects to live football data, runs predictions through an ML service, and displays results in a clean real-time dashboard.

---

## Features

- **90%+ Confidence Filter** — only shows predictions that clear the confidence threshold
- **Real-time Dashboard** — live match predictions with sport/league filtering
- **Prediction Cards** — shows market type, prediction value, odds, and confidence meter
- **Banker & Premium Flags** — marks high-value predictions
- **Stats Banner** — tracks historical performance metrics (win rate, ROI)
- **Tiered User System** — free / pro / admin via Supabase Auth
- **ML Prediction Service** — Python FastAPI backend simulating an XGBoost model

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| ML Service | Python + FastAPI |
| Database | Supabase (PostgreSQL) |
| Real-time | WebSockets (ws) |
| Scheduler | node-cron (data sync pipeline) |
| Deployed | Vercel |

---

## Architecture

```
striker-iq/
├── frontend/        # React + Vite dashboard
├── backend/         # Express API + data sync pipeline
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── services/
│   │   │   ├── footballApi.ts     # Live match data
│   │   │   └── predictionService.ts # ML service bridge
│   │   └── pipeline/
│   │       └── dataSync.ts        # Scheduled data sync
├── ml-service/      # Python FastAPI prediction engine
└── supabase/        # Database schema
```

---

## Run Locally

### Prerequisites
- Node.js 18+
- Python 3.10+
- Supabase account

### 1. Clone the repo
```bash
git clone https://github.com/Dexteristickx/striker-iq
cd striker-iq
```

### 2. Start the ML service
```bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Start the backend
```bash
cd backend
npm install
# Create .env with your Supabase keys and football API key
npm run dev
```

### 4. Start the frontend
```bash
cd frontend
npm install
# Create .env with VITE_API_BASE_URL=http://localhost:3000
npm run dev
```

---

## Environment Variables

**Backend `.env`**
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
FOOTBALL_API_KEY=your_api_key
ML_SERVICE_URL=http://127.0.0.1:8000
```

**Frontend `.env`**
```
VITE_API_BASE_URL=http://localhost:3000
```

---

## Author

**Dickson Okiemute Tetteh** — Fullstack & AI Developer
- GitHub: [@Dexteristickx](https://github.com/Dexteristickx)
- LinkedIn: [linkedin.com/in/dickson-tetteh](https://linkedin.com/in/dickson-tetteh)
