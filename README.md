# Doctor Tracker API

REST API for Doctor Tracker, an admin app for managing doctors and their patients. Built with Express, TypeScript and MongoDB. The full project documentation (architecture, technical decisions, screenshots) is in the frontend repo: https://github.com/Romel04/doctor-tracker-frontend

- **Live API:** https://doctor-tracker-backend-lwtc.onrender.com/api/health
- **Frontend:** https://doctor-tracker-frontend-nine.vercel.app

## Setup

Requires Node.js 20+ and a MongoDB database.

```bash
npm install
cp .env.example .env      # on Windows PowerShell: copy .env.example .env
# fill in the values in .env
npm run seed              # creates the admin user
npm run seed:demo         # optional: 12 doctors and 90 patients (WIPES doctors and patients)
npm run dev               # http://localhost:5000
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server with auto-reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server |
| `npm run seed` | Create the admin user from `ADMIN_EMAIL` and `ADMIN_PASSWORD` |
| `npm run seed:demo` | Replace doctors and patients with demo data (development only) |

## API

All routes are under `/api`. Everything except `/health` and `/auth/login` needs `Authorization: Bearer <token>`. List responses look like `{ data, pagination: { total, page, limit, totalPages } }`.

| Method | Route | Description |
| --- | --- | --- |
| GET | `/health` | Health check, reports database status |
| POST | `/auth/login` | Returns `{ token, user }` |
| GET | `/auth/me` | Current user |
| GET | `/doctors` | List with `page, limit, search, specialization, hospital, from, to` |
| POST | `/doctors` | Create a doctor |
| GET | `/doctors/filters` | Specializations and hospitals for filter dropdowns |
| GET | `/doctors/:id` | One doctor with `patientCount` |
| GET | `/doctors/:id/patients` | A doctor's patients with `page, limit, search, condition, gender, from, to` |
| POST | `/doctors/:id/patients` | Add a patient under a doctor |
| GET | `/patients` | List with `page, limit, search, condition, gender, doctor, from, to` |
| GET | `/patients/conditions` | Conditions for filter dropdowns |
| GET, PATCH, DELETE | `/patients/:id` | Read, edit or delete a patient |
| GET | `/dashboard?days=30` | Totals, patients per doctor, patients over time, conditions, gender, specializations |

## Design notes

- **Validation:** Zod schemas validate every request body and query string. Names allow letters, spaces, dots, hyphens and apostrophes. Phones are 11 digits starting with `01`.
- **Auth:** bcrypt-hashed passwords, JWT with a configurable lifetime, an auth middleware on every protected route, and a central error handler that returns consistent JSON errors.
- **Security middleware:** helmet and a CORS allow-list from `CLIENT_URL`.
- **Indexes:** text indexes for search, plus compound indexes such as (doctor, visitDate) and (specialization, createdAt) for filtering and sorted pagination.
- **Aggregations:** the dashboard runs its queries in parallel. "Patients per doctor" sorts and limits before `$lookup`, and daily counts are grouped in `Asia/Dhaka` time with empty days filled in.

## Deployment

Hosted on Render (Node, free tier). Build command: `npm install --include=dev && npm run build`. Start command: `npm start`. Set the same environment variables as in `.env.example` in the Render dashboard. If you use MongoDB Atlas, allow Render's IPs in Network Access.
