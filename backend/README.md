# Tabibi Medical Appointment System - Backend API

A RESTful API for managing medical appointments between patients and doctors, with administrative oversight.

## Tech Stack

- **Runtime**: Node.js + Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT (access + refresh tokens) + bcrypt
- **Validation**: Zod v4
- **Security**: Helmet, CORS, rate limiting, input sanitization

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your PostgreSQL connection string and JWT secrets

# Generate Prisma client and run migrations
npm run prisma:generate
npm run prisma:migrate

# Start development server
npm run dev
```

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio UI |
| `npm run prisma:push` | Push schema to database |

## Architecture

```
src/
├── config/          # Environment validation, app configuration
├── controllers/     # Request handlers, validation results
├── middleware/       # Auth, validation, error handling, logging
├── repositories/    # Data access layer (Prisma queries)
├── routes/          # Express Router definitions
├── services/        # Business logic layer
├── types/           # TypeScript interfaces and types
├── utils/           # Shared utilities (auth, validation, sanitization, scheduling)
│   ├── errors/      # Custom error classes
│   └── validators/  # Zod schemas
├── app.ts           # Express app setup
└── server.ts        # Entry point
```

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <access-token>
```

- **Access tokens** expire after 15 minutes
- **Refresh tokens** expire after 7 days
- Token refresh uses a dedicated endpoint (`POST /api/auth/refresh`)

## Complete API Reference

### Response Format

**Success:**
```json
{
  "status": "success",
  "message": "...",
  "data": { ... }
}
```

**Paginated:**
```json
{
  "status": "success",
  "message": "...",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

**Error:**
```json
{
  "status": "error",
  "message": "...",
  "errors": []  // Present on validation errors (422)
}
```

### Endpoints Overview

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/health` | — | — | Health check with DB test |
| `POST` | `/api/auth/register` | — | — | Register user (PATIENT or DOCTOR) |
| `POST` | `/api/auth/login` | — | — | Login |
| `POST` | `/api/auth/refresh` | — | — | Refresh access token |
| `GET` | `/api/search/doctors` | — | — | Search doctors |
| `GET` | `/api/search/doctors/featured` | — | — | Featured/top-rated doctors |
| `GET` | `/api/search/doctors/:id` | — | — | Doctor public profile |
| `GET` | `/api/search/doctors/:id/slots` | — | — | Available time slots |
| `GET` | `/api/patients/profile` | ✓ | PATIENT | Patient's own profile |
| `POST` | `/api/patients/appointments` | ✓ | PATIENT | Book appointment |
| `GET` | `/api/patients/appointments` | ✓ | PATIENT | List appointments |
| `GET` | `/api/patients/appointments/:id` | ✓ | PATIENT | Get appointment |
| `PATCH` | `/api/patients/appointments/:id/cancel` | ✓ | PATIENT | Cancel appointment |
| `PATCH` | `/api/patients/appointments/:id/reschedule` | ✓ | PATIENT | Reschedule appointment |
| `GET` | `/api/doctors/appointments` | ✓ | DOCTOR | List doctor's appointments |
| `GET` | `/api/doctors/appointments/:id` | ✓ | DOCTOR | Get appointment |
| `PATCH` | `/api/doctors/appointments/:id/status` | ✓ | DOCTOR | Update status |
| `GET` | `/api/doctors/schedule` | ✓ | DOCTOR | Get schedule |
| `PUT` | `/api/doctors/schedule` | ✓ | DOCTOR | Update schedule |
| `GET` | `/api/doctors/profile` | ✓ | DOCTOR | Get profile |
| `PATCH` | `/api/doctors/profile` | ✓ | DOCTOR | Update profile |
| `GET` | `/api/admin/dashboard` | ✓ | ADMIN | Dashboard statistics |
| `GET` | `/api/admin/doctors` | ✓ | ADMIN | List/search doctors |
| `GET` | `/api/admin/doctors/:id` | ✓ | ADMIN | Get doctor |
| `POST` | `/api/admin/doctors` | ✓ | ADMIN | Create doctor |
| `PATCH` | `/api/admin/doctors/:id` | ✓ | ADMIN | Update doctor |
| `DELETE` | `/api/admin/doctors/:id` | ✓ | ADMIN | Deactivate doctor |
| `GET` | `/api/admin/users` | ✓ | ADMIN | List/search users |
| `GET` | `/api/admin/users/:id` | ✓ | ADMIN | Get user |
| `PATCH` | `/api/admin/users/:id` | ✓ | ADMIN | Update user |
| `PATCH` | `/api/admin/users/:id/deactivate` | ✓ | ADMIN | Deactivate user |
| `PATCH` | `/api/admin/users/:id/reactivate` | ✓ | ADMIN | Reactivate user |

---

### 1. Authentication

#### POST /api/auth/register

Register a new user. ADMIN role is not allowed via public registration.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "gender": "MALE",
  "role": "PATIENT",
  "dateOfBirth": "1990-01-15",
  "specialty": "Cardiology",
  "location": "New York",
  "bio": "Experienced cardiologist",
  "consultationFee": 150,
  "experienceYears": 10,
  "education": "Harvard Medical School"
}
```

**Notes:**
- Role options: `PATIENT`, `DOCTOR` (ADMIN rejected)
- `specialty` and `location` required when `role = "DOCTOR"`
- Password: minimum 8 characters, must contain uppercase, lowercase, and number

**Response (201):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "clxx...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "gender": "MALE",
      "role": "PATIENT",
      "isVerified": false,
      "isActive": true
    },
    "profile": { "...": "..." }
  }
}
```

#### POST /api/auth/login

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": { "...": "..." },
    "profile": { "...": "..." },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### POST /api/auth/refresh

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### 2. Public Search (No Auth Required)

#### GET /api/search/doctors

| Param | Type | Description |
|---|---|---|
| `specialty` | string | Filter by specialty (partial match) |
| `location` | string | Filter by location (partial match) |
| `search` | string | Search across name, specialty, location |
| `minRating` | number | Minimum rating (0-5) |
| `maxFee` | number | Maximum consultation fee |
| `date` | string | Filter by availability date |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10, max: 100) |

**Note:** At least one of `specialty`, `location`, or `search` is required.

**Response:** Paginated list of doctors with `user` (firstName, lastName, email, phone), `schedule`, `rating`, `consultationFee`.

#### GET /api/search/doctors/featured

Returns top-rated doctors (rating >= 4.0, reviews >= 5). No parameters required.

**Response:** Array of doctors with user data, sorted by rating descending (max 10).

#### GET /api/search/doctors/:id

Returns full doctor profile including `user`, `schedule`, `rating`, `education`, `bio`, `consultationFee`, `experienceYears`.

#### GET /api/search/doctors/:id/slots?date=2025-12-30

| Param | Type | Required | Description |
|---|---|---|---|
| `date` | string | ✓ | Date in YYYY-MM-DD format |

Returns available time slots for the given doctor and date. Computed from the doctor's schedule (working hours, breaks, time slot duration) minus already-booked slots.

**Response:**
```json
{
  "status": "success",
  "message": "Available slots retrieved successfully",
  "data": {
    "date": "2025-12-30",
    "slots": [
      { "time": "09:00", "endTime": "09:30", "isAvailable": true, "isBreak": false },
      { "time": "09:30", "endTime": "10:00", "isAvailable": true, "isBreak": false },
      { "time": "12:00", "endTime": "12:30", "isAvailable": false, "isBreak": true }
    ]
  }
}
```

---

### 3. Patient Endpoints (Requires PATIENT Role)

#### GET /api/patients/profile

Returns the authenticated patient's profile including user data (firstName, lastName, email, phone, gender, dateOfBirth).

#### POST /api/patients/appointments

**Request Body:**
```json
{
  "doctorId": "doctor-cuid",
  "date": "2025-12-30",
  "timeSlot": "10:00-10:30",
  "reason": "Regular checkup"
}
```

Validates: doctor exists, date is valid, time slot is within working hours, not during break, not already booked.

**Response (201):** Created appointment with `id`, `patientId`, `doctorId`, `date`, `timeSlot`, `status: "PENDING"`, `reason`.

#### GET /api/patients/appointments

| Param | Type | Description |
|---|---|---|
| `status` | string | Filter: PENDING, CONFIRMED, CANCELLED, COMPLETED, RESCHEDULED, REJECTED |
| `dateFrom` | string | Filter from date |
| `dateTo` | string | Filter to date |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |

**Response:** Paginated list of appointments with doctor and user data.

#### GET /api/patients/appointments/:id

Returns single appointment with doctor and user data. Ownership check enforced.

#### PATCH /api/patients/appointments/:id/cancel

Cancels the appointment (status → CANCELLED). Ownership check + 24-hour window check enforced.

#### PATCH /api/patients/appointments/:id/reschedule

**Request Body:**
```json
{
  "date": "2025-12-31",
  "timeSlot": "11:00-11:30"
}
```

Reschedules to new date/time. Validates slot availability (excluding current slot). Status resets to PENDING. Ownership check + 24-hour window enforced.

---

### 4. Doctor Endpoints (Requires DOCTOR Role)

#### GET /api/doctors/appointments

Same query params as patient appointments. Returns doctor's appointments with patient user data.

#### GET /api/doctors/appointments/:id

Single appointment with patient data. Ownership check enforced.

#### PATCH /api/doctors/appointments/:id/status

**Request Body:**
```json
{
  "status": "CONFIRMED"
}
```

Valid status values: PENDING, CONFIRMED, CANCELLED, COMPLETED, REJECTED, RESCHEDULED.

#### GET /api/doctors/schedule

Returns the doctor's weekly schedule:
```json
{
  "id": "schedule-id",
  "doctorId": "doctor-id",
  "monday": "{\"isWorkingDay\":true,\"startTime\":\"09:00\",\"endTime\":\"17:00\",\"breaks\":[]}",
  "tuesday": "...",
  "timeSlotDuration": 30
}
```

#### PUT /api/doctors/schedule

**Request Body:**
```json
{
  "monday": "{\"isWorkingDay\":true,\"startTime\":\"09:00\",\"endTime\":\"17:00\",\"breaks\":[{\"start\":\"12:00\",\"end\":\"13:00\"}]}",
  "tuesday": "{\"isWorkingDay\":true,\"startTime\":\"09:00\",\"endTime\":\"17:00\"}",
  "timeSlotDuration": 30
}
```

Each day is a JSON string:
```json
{
  "isWorkingDay": true,
  "startTime": "09:00",
  "endTime": "17:00",
  "breaks": [{ "start": "12:00", "end": "13:00" }]
}
```

#### GET /api/doctors/profile

Returns doctor profile with user data (firstName, lastName, email, phone, gender, dateOfBirth) and doctor data (specialty, location, bio, consultationFee, experienceYears, education, rating).

#### PATCH /api/doctors/profile

**Request Body:**
```json
{
  "firstName": "Dr. Jane",
  "lastName": "Smith",
  "specialty": "Cardiology",
  "consultationFee": 200
}
```

Accepts both user fields (firstName, lastName, phone, gender, dateOfBirth) and doctor fields (specialty, location, bio, consultationFee, experienceYears, education).

---

### 5. Admin Endpoints (Requires ADMIN Role)

#### GET /api/admin/dashboard

| Param | Type | Description |
|---|---|---|
| `startDate` | string | Filter stats from date (YYYY-MM-DD) |
| `endDate` | string | Filter stats to date (YYYY-MM-DD) |

**Response:**
```json
{
  "status": "success",
  "data": {
    "users": {
      "total": 100,
      "byRole": { "PATIENT": 60, "DOCTOR": 35, "ADMIN": 5 },
      "activeCount": 95,
      "verifiedCount": 80,
      "recentSignups": 12
    },
    "doctors": {
      "total": 35,
      "topRated": [ "...doctor objects..." ]
    },
    "appointments": {
      "total": 500,
      "byStatus": {
        "PENDING": 50,
        "CONFIRMED": 100,
        "CANCELLED": 30,
        "COMPLETED": 300,
        "RESCHEDULED": 10,
        "REJECTED": 10
      },
      "todayCount": 15
    }
  }
}
```

#### GET /api/admin/doctors

| Param | Type | Description |
|---|---|---|
| `search` | string | Search across name, specialty, location |
| `specialty` | string | Filter by specialty |
| `location` | string | Filter by location |
| `minRating` | number | Minimum rating |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |

#### GET /api/admin/doctors/:id

Returns doctor detail with user info.

#### POST /api/admin/doctors

Create a doctor account (user + doctor profile). Requires all user fields + specialty + location. Checks email/phone uniqueness.

#### PATCH /api/admin/doctors/:id

Update doctor profile fields (specialty, location, bio, consultationFee, experienceYears, education).

#### DELETE /api/admin/doctors/:id

Deactivates the doctor's user account (sets isActive = false). Records remain in database.

#### GET /api/admin/users

| Param | Type | Description |
|---|---|---|
| `search` | string | Search across name, email, phone |
| `role` | string | Filter by role (PATIENT, DOCTOR, ADMIN) |
| `isActive` | boolean | Filter by active status |
| `isVerified` | boolean | Filter by verification status |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |

#### GET /api/admin/users/:id

Returns user detail.

#### PATCH /api/admin/users/:id

Update user fields (firstName, lastName, phone, gender, dateOfBirth).

#### PATCH /api/admin/users/:id/deactivate

Sets `isActive = false` on the user.

#### PATCH /api/admin/users/:id/reactivate

Sets `isActive = true` on the user.

---

## Error Handling

| Status | Error Class | Description |
|---|---|---|
| 400 | `BadRequestError` | Invalid input, missing fields |
| 401 | `UnauthorizedError` | Missing/invalid token, inactive account |
| 403 | `ForbiddenError` | Insufficient role permissions |
| 404 | `NotFoundError` | Resource not found |
| 409 | `ConflictError` | Duplicate email/phone, slot already booked |
| 422 | `ValidationError` | Schema validation failed (field-level errors) |
| 500 | `InternalServerError` | Unexpected server error |

Validation error response:
```json
{
  "status": "error",
  "message": "Validation error",
  "errors": [
    { "message": "Password must contain at least one uppercase letter" }
  ]
}
```

## Data Models

### User
| Field | Type | Notes |
|---|---|---|
| id | String (CUID) | Primary key |
| email | String | Unique |
| password | String | bcrypt hashed |
| firstName | String | |
| lastName | String | |
| phone | String | |
| gender | Gender (MALE/FEMALE) | |
| dateOfBirth | DateTime? | |
| role | Role (PATIENT/DOCTOR/ADMIN) | Default: PATIENT |
| isVerified | Boolean | Default: false |
| isActive | Boolean | Default: true |

### Doctor
| Field | Type | Notes |
|---|---|---|
| id | String (CUID) | Primary key |
| userId | String (FK → User) | Unique |
| specialty | String | |
| location | String | |
| bio | String? | |
| consultationFee | Float? | |
| experienceYears | Int? | |
| education | String? | |
| rating | Float? | Default: 0 |
| totalReviews | Int? | Default: 0 |

### Patient
| Field | Type | Notes |
|---|---|---|
| id | String (CUID) | Primary key |
| userId | String (FK → User) | Unique |
| medicalHistory | String? | |

### Appointment
| Field | Type | Notes |
|---|---|---|
| id | String (CUID) | Primary key |
| patientId | String (FK → Patient) | |
| doctorId | String (FK → Doctor) | |
| date | DateTime | |
| timeSlot | String | Format: "HH:MM-HH:MM" |
| status | AppointmentStatus | Default: PENDING |
| reason | String? | |
| notes | String? | |

### Schedule
| Field | Type | Notes |
|---|---|---|
| id | String (CUID) | Primary key |
| doctorId | String (FK → Doctor) | Unique |
| monday–sunday | String? | JSON config string |
| timeSlotDuration | Int | Default: 30 (minutes) |

### Enums

**Role:** `PATIENT`, `DOCTOR`, `ADMIN`

**AppointmentStatus:** `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `RESCHEDULED`, `REJECTED`

**Gender:** `MALE`, `FEMALE`

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | ✓ | 5000 | Server port |
| `NODE_ENV` | ✓ | development | Environment |
| `DATABASE_URL` | ✓ | — | PostgreSQL connection string |
| `JWT_SECRET` | ✓ | — | Access token secret (≥32 chars) |
| `JWT_REFRESH_SECRET` | ✓ | — | Refresh token secret (≥32 chars) |
| `CORS_ORIGIN` | ✓ | — | Comma-separated allowed origins |
| `RATE_LIMIT_WINDOW_MS` | | 900000 | Rate limit window (15 min) |
| `RATE_LIMIT_MAX` | | 100 | Max requests per window |
| `SMTP_*` | | — | Email configuration (optional) |
| `REDIS_URL` | | — | Redis connection (optional) |
| `FRONTEND_URL` | | — | Frontend URL (optional) |
