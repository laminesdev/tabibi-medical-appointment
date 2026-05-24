# Tabibi Medical Appointment System

A full-stack medical appointment scheduling platform connecting patients, doctors, and administrators. Built with React + TypeScript (frontend) and Express + Prisma (backend).

## Tech Stack

**Frontend** — React 19, TypeScript, Vite 7, Tailwind CSS 3, shadcn/ui, Zustand 5, Axios, React Router 7, Recharts, Framer Motion

**Backend** — Node.js, Express 5, TypeScript, PostgreSQL, Prisma ORM, JWT auth (access + refresh tokens), Zod v4 validation, Helmet, CORS, rate limiting

## Architecture

```
tabibi-medical-appointment/
├── backend/                    # Express API server
│   ├── src/
│   │   ├── config/            # Environment validation, app config
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Auth, validation, error handling
│   │   ├── repositories/     # Prisma data access layer
│   │   ├── routes/           # Express Router definitions
│   │   ├── services/         # Business logic
│   │   ├── types/            # TypeScript interfaces
│   │   ├── utils/            # Auth, validation, scheduling utilities
│   │   ├── app.ts            # Express app setup
│   │   └── server.ts         # Entry point
│   ├── prisma/               # Schema + migrations
│   └── tests/                # E2E test suite
│
├── frontend/
│   └── tabibi-frontend/      # React SPA
│       └── src/
│           ├── types/        # Shared TypeScript interfaces
│           ├── services/     # API service layer (Axios)
│           ├── stores/       # Zustand state management
│           ├── components/   # Reusable UI + layout components
│           ├── hooks/        # Custom React hooks
│           ├── routes/       # Page components by role
│           └── lib/          # Utility functions
```

## Quick Start

### Backend

```bash
cd backend
npm install
cp .env.example .env        # Configure DATABASE_URL, JWT secrets, etc.
npm run prisma:generate
npm run prisma:migrate
npm run seed                # Creates admin user from ADMIN_EMAIL/ADMIN_PASSWORD
npm run dev                 # Starts on http://localhost:5000
```

### Frontend

```bash
cd frontend/tabibi-frontend
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:5000/api
npm run dev                 # Starts on http://localhost:3000
```

### Testing

```bash
# Start backend, then in another terminal:
cd backend
npm run test:api            # 43 sequential E2E tests
```

## API Overview (33 Endpoints)

| Area | Endpoints | Auth |
|------|-----------|------|
| Health | `GET /health` | — |
| Auth | Register, Login, Refresh | — |
| Public Search | Search, Featured, Doctor profile, Slots | — |
| Patient | Profile, Book, List, Detail, Cancel, Reschedule | PATIENT |
| Doctor | List, Detail, Status update, Schedule (GET/PUT), Profile (GET/PATCH) | DOCTOR |
| Admin | Dashboard, Doctors CRUD, Users CRUD, Deactivate/Reactivate | ADMIN |

See `backend/README.md` for full API reference with request/response schemas.

## Frontend Route Structure

| Path | Page | Role |
|------|------|------|
| `/` | Landing | Public |
| `/login`, `/register` | Auth | Public |
| `/doctors`, `/doctors/:id` | Search & Profile | Public |
| `/patient/*` | Dashboard, Appointments, Booking, Profile | PATIENT |
| `/doctor/*` | Dashboard, Appointments, Schedule, Profile | DOCTOR |
| `/admin/*` | Dashboard, Doctor CRUD, User CRUD | ADMIN |

## Implementation Status

| Phase | Scope | Status |
|-------|-------|--------|
| **P1** | Core infrastructure: types, services, stores, layouts, auth, landing page | **Complete** |
| **P2** | Public search, doctor profiles, search components | Planned |
| **P3** | Patient dashboard, booking wizard, appointment management | Planned |
| **P4** | Doctor dashboard, schedule editor, profile editor | Planned |
| **P5** | Admin dashboard, doctor/user CRUD | Planned |
| **P6** | Polish: error boundaries, loading skeletons, mobile responsive | Planned |

## Design System

- **Mode**: Light only
- **Primary**: `#00A3A3` (teal)
- **Background**: `#FFFFFF`
- **Border radius**: `1.25rem` (xl rounded)
- **Typography**: Inter / system-ui

## License

MIT
