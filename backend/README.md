# Smart Parking Backend

## Requirements
- Node.js 18+
- MongoDB running locally (default)

## Env
Copy `.env.example` to `.env`:
- `MONGODB_URI=mongodb://127.0.0.1:27017/smart_parking`
- `PORT=5000`

## Run
```bash
npm install
node server.js
```

API:
- GET /health
- GET /api/analytics/summary
- GET /api/analytics/occupancy
- GET /api/analytics/events
- POST /api/parking/entry
- POST /api/parking/exit
- GET /api/parking/tickets?active=true

