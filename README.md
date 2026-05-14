# Smart Parking Analytics System

## Setup
- Start MongoDB (local): `mongodb://127.0.0.1:27017/smart_parking`

### Backend
```bash
cd backend
npm install
node server.js
```

Backend runs on: http://localhost:5000

### Frontend
```bash
cd frontend
npm install
npm start
```

Frontend runs on: http://localhost:3000

## API
- `GET /api/analytics/summary?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /api/analytics/occupancy?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /api/analytics/events?from=YYYY-MM-DD&to=YYYY-MM-DD`

## GitHub
This repo can be pushed to GitHub using git.

