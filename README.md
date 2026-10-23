# Smart Wall Paint Visualizer (MEAN)
Angular 16 (standalone) + Express + MongoDB + JWT/bcrypt. Painting is done client-side on HTML5 Canvas; projects/colors/patterns/users go through the REST API.

## 1. Requirements
Node.js 18+, npm, MongoDB 6+ (local or Atlas).
## 2. Install
```
cd backend && npm install
cd ../frontend && npm install
```
## 3. MongoDB
Local: run `mongod` (default `mongodb://127.0.0.1:27017`). Atlas: paste your connection string into `MONGO_URI`.
## 4. Environment
`cd backend && cp .env.example .env` then edit `JWT_SECRET` (long random), `ADMIN_EMAIL`, `ADMIN_PASSWORD` (min 8 chars). Never commit `.env`.
## 5. Start backend
`cd backend && npm start` (http://localhost:5000)
## 6. Start frontend
`cd frontend && npm start` (http://localhost:4200). API URL is `API` in `frontend/src/app/services/api.service.ts`.
## 7. Seed
`cd backend && npm run seed` — inserts the 8 colors, 3 patterns and the admin from `.env` (idempotent).
## 8. Admin access
Log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`, then open **Admin**. Registration always creates USER accounts.
## 9. Usage
Register → Login → New Design → upload JPG/PNG → Polygon (click points, double-click to close) or Brush → pick color/finish/pattern → Before/After → Save / Download. Designs appear in My Designs and Favorites.
## 10. API
Auth: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
Colors & Patterns: GET / GET :id (auth); POST / PUT :id / DELETE :id (admin) at /api/colors and /api/patterns
Projects (owner or admin): GET, GET :id, POST, PUT :id, DELETE :id at /api/projects
Admin: GET /api/users, /api/users/:id, /api/analytics, /api/activity
Other: POST /api/activity (upload/download log), POST /api/feedback, GET /api/feedback (admin)
## 11. Deployment
Backend: set env vars on host (Render/Railway/VPS), `CLIENT_URL` = deployed frontend origin, use MongoDB Atlas. Frontend: change `API` to the deployed backend URL, `npm run build`, serve `dist/app` as a static SPA with fallback to index.html.
