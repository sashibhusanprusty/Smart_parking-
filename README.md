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

## Deploying Live

### Option 1: Deploy with Docker locally or on a container host
This repository now includes a `Dockerfile` and `docker-compose.yml` to run everything together:

```bash
docker compose up --build
```

The app will be available at:
- Backend / frontend: `http://localhost:5000`
- MongoDB: `mongodb://localhost:27017`

### Option 2: Deploy backend container via GitHub Container Registry
A GitHub Actions workflow now builds and publishes the backend container image to GitHub Container Registry on `main`.

- Image name: `ghcr.io/sashibhusanprusty/smart_parking-backend:latest`
- Optional tag: `ghcr.io/sashibhusanprusty/smart_parking-backend:${{ github.sha }}`

To deploy on any host:

```bash
docker pull ghcr.io/sashibhusanprusty/smart_parking-backend:latest
docker run -d -p 5000:5000 \
  -e MONGODB_URI="your-mongo-uri" \
  --name smart-parking-backend \
  ghcr.io/sashibhusanprusty/smart_parking-backend:latest
```

### Option 3: Deploy backend and frontend separately
1. Build and deploy the backend from `backend/` to a Node host such as Render, Railway, or Heroku.
2. Build and deploy the frontend from `frontend/` to Vercel, Netlify, or similar.
3. Set environment variables:
   - Backend: `MONGODB_URI` = your MongoDB Atlas URI
   - Frontend: `REACT_APP_API_URL` = your backend URL

### Local production build without Docker
```bash
cd frontend
npm install
npm run build
cd ../backend
npm install
node server.js
```
Then open `http://localhost:5000`.

### Frontend environment
Create `frontend/.env` with:
```bash
REACT_APP_API_URL=http://localhost:5000
```

## GitHub
This repo is already connected to GitHub at https://github.com/sashibhusanprusty/Smart_parking-.

