# Tabibi Medical Appointment System — Frontend UI/UX Plan

> 43 backend endpoints, 4 user roles, 0 gaps. This document maps every API to a UI page and handles every error state.

---

## 1. Route Architecture

| Path | Page | Auth | Role |
|---|---|---|---|
| `/` | Landing | — | — |
| `/login` | Login | — | — |
| `/register` | Registration | — | — |
| `/doctors` | Search results | — | — |
| `/doctors/:id` | Doctor public profile | — | — |
| `/patient/dashboard` | Patient dashboard | ✓ | PATIENT |
| `/patient/appointments` | My appointments list | ✓ | PATIENT |
| `/patient/appointments/book` | Book appointment | ✓ | PATIENT |
| `/patient/appointments/:id` | Appointment detail | ✓ | PATIENT |
| `/patient/profile` | Patient profile | ✓ | PATIENT |
| `/doctor/dashboard` | Doctor dashboard | ✓ | DOCTOR |
| `/doctor/appointments` | Appointment management | ✓ | DOCTOR |
| `/doctor/appointments/:id` | Appointment detail | ✓ | DOCTOR |
| `/doctor/schedule` | Schedule management | ✓ | DOCTOR |
| `/doctor/profile` | Profile management | ✓ | DOCTOR |
| `/admin/dashboard` | Admin dashboard | ✓ | ADMIN |
| `/admin/doctors` | Doctor management | ✓ | ADMIN |
| `/admin/doctors/new` | Create doctor | ✓ | ADMIN |
| `/admin/doctors/:id` | Edit doctor | ✓ | ADMIN |
| `/admin/users` | User management | ✓ | ADMIN |
| `/admin/users/:id` | User detail/edit | ✓ | ADMIN |

---

## 2. Page-by-Page Specifications

### 2.1 Visitor (No Auth)

#### Landing Page `/`

**Purpose:** First impression, search entry point, showcase featured doctors.

**Sections:**
| Section | Content | Backend |
|---|---|---|
| **Hero** | Tagline, subtitle, search bar (specialty dropdown + location input + "Search" CTA), illustration | — |
| **How It Works** | 3-step card row: Find Doctors → Book Online → Manage Appointments | — |
| **Featured Doctors** | Horizontal scrollable doctor cards (avatar, name, specialty, rating stars, location) | `GET /api/search/doctors/featured` |
| **CTA Banner** | "Get Started" button → `/register` | — |

**States:**
| State | UX |
|---|---|
| Loading | Skeleton cards in featured section |
| Empty featured | Section hidden; "No featured doctors yet" inline text |
| Error | Toast "Could not load featured doctors" — section falls back to static "Search for doctors" prompt |

---

#### Login `/login`

**Fields:**
| Field | Type | Validation |
|---|---|---|
| Email | `input[email]` | Required, valid email format |
| Password | `input[password]` | Required, min 8 chars |

**Features:** "Remember me" checkbox, "Don't have an account? Register" link.

**Flow:** Submit → `POST /api/auth/login` → store tokens in authStore + localStorage → redirect to role-based dashboard.

**States:**
| Response | UX |
|---|---|
| 200 | Redirect, success toast |
| 401 | "Invalid email or password" inline error |
| Deactivated | "Account has been deactivated. Contact an administrator." |
| Network error | "Connection failed. Check your internet." |

---

#### Registration `/register`

**Role toggle** (pill buttons): PATIENT | DOCTOR

**Common fields:**
| Field | Type | Validation |
|---|---|---|
| Email | `input[email]` | Required, valid format |
| Password | `input[password]` | Min 8 chars, must contain uppercase + lowercase + number; strength meter |
| First Name | `input[text]` | Required, min 2 chars |
| Last Name | `input[text]` | Required, min 2 chars |
| Phone | `input[tel]` | Required, `+?[1-9]\d{1,14}` |
| Gender | `select` | MALE / FEMALE |
| Date of Birth | `input[date]` | Optional |

**Doctor-only fields** (shown when role = DOCTOR):
| Field | Type | Validation |
|---|---|---|
| Specialty | `input[text]` | Required when role=DOCTOR |
| Location | `input[text]` | Required when role=DOCTOR |
| Bio | `textarea` | Optional |
| Consultation Fee | `input[number]` | Optional |
| Experience Years | `input[number]` | Optional |
| Education | `input[text]` | Optional |

**Flow:** `POST /api/auth/register` → on 201 → redirect `/login` with "Account created successfully" toast.

**States:**
| Response | UX |
|---|---|
| 201 | Redirect to `/login` with success toast |
| 409 (email) | "This email is already registered" inline |
| 409 (phone) | "This phone number is already in use" inline |
| 422 | Field-level error messages below each input |
| 422 (role=ADMIN) | "Admin registration is not allowed" — this field is not even shown in role selector |

---

#### Search Results `/doctors`

**URL params:** `?specialty=X&location=Y&search=Z&minRating=N&page=P&limit=L`

**Components:**
| Component | Description |
|---|---|
| **SearchPanel** | Collapsible on mobile: specialty, location, search text inputs + min rating stars + "Search" / "Clear" buttons |
| **DoctorCard** | Avatar, name, specialty, location, rating stars, consultation fee badge → links to `/doctors/:id` |
| **Pagination** | Page numbers, prev/next, total count |

**Flow:**
1. On mount, parse URL params and call `GET /api/search/doctors?specialty=...&location=...`
2. On filter change, update URL params and refetch
3. At least one search param required (matches backend `searchDoctorsSchema.refine()`) — client-side validation before sending

**States:**
| State | UX |
|---|---|
| Loading | 6 skeleton cards (animated pulse) |
| Empty (no params) | "Enter at least one search criterion" prompt |
| Empty (no results) | "No doctors match your criteria" with "Clear filters" CTA |
| 422 (no params sent) | Treated same as empty prompt — form error displayed |
| Error | Toast, fallback to empty state |

---

#### Doctor Public Profile `/doctors/:id`

**Sections:**
| Section | Content | Source |
|---|---|---|
| **Header** | Name, specialty, location, rating stars + count, fee badge | `GET /api/search/doctors/:id` |
| **About** | Bio, education, experience years | same |
| **Schedule** | Weekly summary: "Mon–Fri 9:00–17:00" (parsed from schedule JSON) | same |
| **Available Slots** | Date picker + slot grid (only for logged-in patients; guests see "Login to book") | `GET /api/search/doctors/:id/slots?date=` |

**Slot Grid:**
| State | Visual |
|---|---|
| Available | Green clickable chip → selected state |
| Booked | Grey disabled chip |
| Break | Orange striped chip (not clickable) |
| No slots for date | "No available slots for this date" |
| Date beyond 90 days | Picker restricts selection |
| Date in past | Picker restricts selection |

**States:**
| State | UX |
|---|---|
| Loading | Skeleton |
| 404 | "Doctor not found" page with "Back to search" link |
| Error | Toast, retry |

---

### 2.2 Patient (Requires PATIENT auth)

#### Patient Dashboard `/patient/dashboard`

**Components:**
| Component | Description |
|---|---|
| **WelcomeCard** | "Welcome, {firstName}" + last login hint |
| **UpcomingAppointments** | Next 3 appointments: doctor name, date, time, status badge |
| **QuickActions** | "Find a Doctor" → `/doctors`, "My Appointments" → `/patient/appointments`, "Book Appointment" → `/patient/appointments/book` |

**States:**
| State | UX |
|---|---|
| Loading | Skeleton cards |
| No upcoming | "No upcoming appointments" with "Book Now" CTA → `/patient/appointments/book` |
| Error | Toast |

---

#### Book Appointment `/patient/appointments/book`

**3-step wizard:**

| Step | Component | API |
|---|---|---|
| **1 — Select Doctor** | SearchBar + DoctorCard grid | `GET /api/search/doctors?specialty=&location=` |
| **2 — Select Date & Time** | DatePicker (restricted to today+90 days, weekdays only if doctor has weekday schedule) + SlotGrid | `GET /api/search/doctors/:id/slots?date=` |
| **3 — Confirm** | Doctor summary card, date/time display, reason textarea | `POST /api/patients/appointments` |

**States:**
| State | UX |
|---|---|
| No doctor selected | "Search and select a doctor" |
| No date selected | "Choose a date to see available slots" |
| 409 on submit | "Slot was just taken by another patient" → auto-refresh slot grid |
| 422 | Inline validation errors |
| 201 | Redirect to `/patient/appointments/:id` with "Appointment booked" toast |

---

#### My Appointments `/patient/appointments`

**Tabs:** Upcoming | Past | Cancelled | All

**Filters:** `?status=PENDING,CONFIRMED` for Upcoming, `?status=COMPLETED` for Past, `?status=CANCELLED` for Cancelled, no filter for All.

**AppointmentCard:**
| Element | Detail |
|---|---|
| Doctor info | Name, specialty from included `doctor.user` |
| Date/time | Formatted |
| Status badge | Color-coded (see 3. Theme tokens) |
| Actions | Cancel (PENDING/CONFIRMED), Reschedule (PENDING/CONFIRMED), View details |

**States:**
| State | UX |
|---|---|
| Loading | Skeleton list |
| Empty tab | "No appointments in this category" |
| Error | Toast |

---

#### Appointment Detail `/patient/appointments/:id`

**Content:** Full appointment info, doctor profile summary, status timeline.

**Actions:**
- **Cancel:** Opens ConfirmModal with "24-hour cancellation policy" warning → `PATCH /api/patients/appointments/:id/cancel`
- **Reschedule:** Inline date/time picker (excludes current slot from booked list validates against backend) → `PATCH /api/patients/appointments/:id/reschedule`

**States:**
| State | UX |
|---|---|
| 404 | "Appointment not found" |
| Already cancelled | Actions hidden, "This appointment was cancelled" notice |
| Past appointment | Actions hidden, "This appointment has passed" notice |
| 400 (cancel <24h) | Toast "Cannot cancel within 24 hours of appointment" |

---

#### Patient Profile `/patient/profile`

Read-only display of user data (name, email, phone, gender, DOB). No PUT/PATCH endpoint exists for patient profiles on the backend.

---

### 2.3 Doctor (Requires DOCTOR auth)

#### Doctor Dashboard `/doctor/dashboard`

| Component | Data |
|---|---|
| **Today's count** | Badge: number of appointments for today |
| **Today's list** | Compact cards: patient name, time, status |
| **Upcoming (next 5)** | Patient name, date, time |
| **Quick links** | "Manage Schedule", "View Profile" |

**Edge case:** No appointments today → "No appointments scheduled for today."

---

#### Appointment Management `/doctor/appointments`

**Filters:** Status dropdown (all/pending/confirmed/completed/cancelled/rejected), date range, patient name.

**Table columns:** Patient name, date, time, status badge, reason (truncated).

**Row actions per status:**
| Current Status | Available Actions |
|---|---|
| PENDING | Confirm, Reject |
| CONFIRMED | Complete, Cancel |
| COMPLETED | View only |
| CANCELLED | View only |
| REJECTED | View only |

**Status update:** Opens ConfirmModal → `PATCH /api/doctors/appointments/:id/status`

---

#### Appointment Detail `/doctor/appointments/:id`

Patient info, full details, status timeline. Same status action buttons as table row.

**Edge cases:** 404 → "Appointment not found"; completed → no status actions.

---

#### Schedule Management `/doctor/schedule`

**Weekly grid (7 columns):**
| Day Column | Controls |
|---|---|
| Header | Day name (Mon/Tue/...) |
| Toggle | Working day / Off |
| Start time | `input[time]` (if working) |
| End time | `input[time]` (if working) |
| Breaks | List of (start + end) pairs — "Add break" / "Remove" buttons |
| Time slot duration | Number input at bottom (default 30 min) |

**Flow:** On mount → `GET /api/doctors/schedule` → populate grid. On save → `PUT /api/doctors/schedule`

**States:**
| State | UX |
|---|---|
| Loading | Skeleton grid |
| Empty (no schedule yet) | All days default to Off with hint "Configure your weekly schedule" |
| Validation error | Inline: "Start time must be before end time", "Breaks cannot overlap" |
| 200 | "Schedule saved" toast |

---

#### Doctor Profile `/doctor/profile`

**Editable fields:**
| Group | Fields |
|---|---|
| User | First name, Last name, Phone |
| Doctor | Specialty, Location, Bio, Consultation Fee, Experience Years, Education |

**Flow:** On mount → `GET /api/doctors/profile` → populate form. On save → `PATCH /api/doctors/profile`

**Edge cases:** 422 validation → inline field errors.

---

### 2.4 Admin (Requires ADMIN auth)

#### Admin Dashboard `/admin/dashboard`

**Top stats row (4 cards):** Total users, Total doctors, Total appointments, Today's appointments.

**Date range filter:** Start date + end date inputs → refetch with `GET /api/admin/dashboard?startDate=&endDate=`

**Charts (recharts):**
| Chart | Data Source |
|---|---|
| Bar chart | Appointments by status (PENDING/CONFIRMED/CANCELLED/COMPLETED/RESCHEDULED/REJECTED) |
| Mini stat | Users by role (PATIENT/DOCTOR/ADMIN) |

**Edge cases:**
| State | UX |
|---|---|
| Loading | Skeleton stats cards |
| No data | "No data available" placeholders |
| Invalid date range | Error message on filter |

---

#### Doctor Management `/admin/doctors`

**Search + filter bar:** Name/specialty/location search, min rating.

**Table:** Name, email, specialty, location, rating, active badge, actions (Edit, Deactivate/Reactivate).

**"Add Doctor" button** → `/admin/doctors/new`

**States:**
| State | UX |
|---|---|
| Loading | Skeleton table rows |
| Empty search | "No doctors found" |
| Pagination | Page numbers |

---

#### Create Doctor `/admin/doctors/new`

Full form: all user fields + all doctor fields. `POST /api/admin/doctors`.

**Edge cases:** 409 (email/phone taken) → inline error; 422 → field errors.

---

#### Edit Doctor `/admin/doctors/:id`

Pre-filled form: `GET /api/admin/doctors/:id` → populate → `PATCH /api/admin/doctors/:id`.

**Edge cases:** 404 → redirect to `/admin/doctors` with "Doctor not found" toast.

---

#### User Management `/admin/users`

**Search + filters:** Name/email/phone search, role dropdown, active/verified toggles.

**Table:** Name, email, role badge, active badge, verified badge, actions (Edit, Deactivate/Reactivate).

**States:**
| State | UX |
|---|---|
| Loading | Skeleton |
| Empty | "No users found" |
| Pagination | Standard |

---

#### User Detail/Edit `/admin/users/:id`

View/edit form: `GET /api/admin/users/:id` → populate → `PATCH /api/admin/users/:id`.

**Actions:** Deactivate / Reactivate buttons (with ConfirmModal).

**Edge case:** Cannot deactivate own account — button disabled with tooltip "You cannot deactivate your own account."

---

## 3. Shared / Reusable Components

| Component | Props | Used In |
|---|---|---|
| **AppLayout** | `children` | All authenticated pages (sidebar + header + content) |
| **PublicLayout** | `children` | Landing, Login, Register, Search, Doctor Profile |
| **Header** | — | PublicLayout — logo, nav (Home, Login, Register) |
| **Sidebar** | `items: NavItem[]`, `role: Role` | AppLayout — role-based navigation |
| **DoctorCard** | `doctor: DoctorSummary` | Search results, featured, booking step 1 |
| **AppointmentCard** | `appointment: Appointment`, `actions: Action[]` | Patient/doctor appointment lists |
| **SlotGrid** | `slots: Slot[]`, `selected: string`, `onSelect` | Doctor profile, booking step 2 |
| **StatusBadge** | `status: AppointmentStatus` | Every appointment display |
| **Pagination** | `page, totalPages, onPageChange` | All list pages |
| **SearchBar** | `filters, onSearch, onClear` | Search page, admin pages |
| **DatePicker** | `value, onChange, minDate, maxDate` | Slots, booking, dashboard filter |
| **ConfirmModal** | `title, message, onConfirm, onCancel` | Cancel/reschedule/deactivate |
| **Toast** | `message, type` | Global notification |
| **EmptyState** | `icon, title, description, action?` | All empty lists |
| **LoadingSkeleton** | `variant: 'card' | 'table' | 'list'` | All loading states |
| **ErrorBoundary** | `children, fallback?` | Route-level error catch |
| **NotFound** | — | 404 page |

---

## 4. State Management — Zustand Stores

### authStore
```typescript
interface AuthState {
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  role: Role | null;
  login(email: string, password: string): Promise<void>;
  register(data: RegisterData): Promise<void>;
  logout(): void;
  refreshAccessToken(): Promise<void>;
}
```

### doctorSearchStore
```typescript
interface DoctorSearchState {
  results: Doctor[];
  pagination: Pagination;
  filters: { specialty?: string; location?: string; search?: string; minRating?: number };
  search(filters: SearchFilters): Promise<void>;
  clearFilters(): void;
}
```

### appointmentStore (patient)
```typescript
interface PatientAppointmentState {
  appointments: Appointment[];
  pagination: Pagination;
  fetchAppointments(params: AppointmentQuery): Promise<void>;
  bookAppointment(data: BookAppointmentData): Promise<Appointment>;
  cancelAppointment(id: string): Promise<void>;
  rescheduleAppointment(id: string, data: RescheduleData): Promise<void>;
}
```

### doctorAppointmentStore
```typescript
interface DoctorAppointmentState {
  appointments: Appointment[];
  pagination: Pagination;
  fetchAppointments(params: AppointmentQuery): Promise<void>;
  updateStatus(id: string, status: AppointmentStatus): Promise<void>;
}
```

### scheduleStore
```typescript
interface ScheduleState {
  schedule: ScheduleData | null;
  fetchSchedule(): Promise<void>;
  updateSchedule(data: ScheduleData): Promise<void>;
}
```

### adminStore
```typescript
interface AdminState {
  dashboard: DashboardData | null;
  doctors: Doctor[];
  users: User[];
  pagination: Pagination;
  fetchDashboard(dateRange?: { startDate?: string; endDate?: string }): Promise<void>;
  fetchDoctors(params: AdminQuery): Promise<void>;
  fetchUsers(params: AdminQuery): Promise<void>;
  createDoctor(data: CreateDoctorData): Promise<void>;
  updateDoctor(id: string, data: Partial<Doctor>): Promise<void>;
  deactivateUser(id: string): Promise<void>;
  reactivateUser(id: string): Promise<void>;
}
```

---

## 5. API Service Layer

```
src/services/
  api.ts                Axios instance, interceptors, error normalizer
  auth.service.ts       login, register, refresh
  search.service.ts     searchDoctors, getFeatured, getDoctorById, getAvailableSlots
  patient.service.ts    getProfile, bookAppointment, getAppointments, getAppointmentById, cancel, reschedule
  doctor.service.ts     getAppointments, getAppointmentById, updateStatus, getSchedule, updateSchedule, getProfile, updateProfile
  admin.service.ts      getDashboard, getDoctors, getDoctorById, createDoctor, updateDoctor, removeDoctor, getUsers, getUserById, updateUser, deactivateUser, reactivateUser
```

### Axios interceptor chain
```
Request  → attach Authorization header
Response → if 401 → attempt POST /auth/refresh → retry original
         → if 401 (refresh failed) → clear auth → redirect /login
         → normalize error to { status, message, errors[] }
```

---

## 6. Authentication Flow

```
[Unauthenticated]
  ├─ /login → POST /api/auth/login → tokens stored → redirect to /{role}/dashboard
  ├─ /register → POST /api/auth/register → redirect /login + toast
  └─ protected route → redirect /login?returnUrl=<path>

[Authenticated]
  ├─ Token valid → render
  ├─ Token expired → interceptor refresh → retry
  ├─ Refresh expired → logout → redirect /login
  └─ Logout → clear store + localStorage → redirect /
```

### ProtectedRoute component
```tsx
<ProtectedRoute role="PATIENT">
  <Dashboard />
</ProtectedRoute>
```

Redirects: no token → `/login` | wrong role → `/` with "Access denied" toast.

---

## 7. Error & Edge Case Matrix

| Scenario | HTTP | UI Handling |
|---|---|---|
| Invalid credentials | 401 | "Invalid email or password" inline |
| Deactivated account | 401 | "Account deactivated. Contact admin." |
| Duplicate email | 409 | "Email already registered" inline |
| Duplicate phone | 409 | "Phone number already in use" inline |
| Slot taken mid-booking | 409 | Toast → auto-refresh slot grid |
| Validation error | 422 | Field-level messages below inputs |
| Not found | 404 | Page with "Go Home" button |
| Rate limited | 429 | Toast "Too many requests. Please wait." |
| Server error | 500 | Toast "Something went wrong." |
| Network offline | — | Toast "No internet connection" |
| Empty search results | 200 | "No doctors found" + broaden suggestion |
| Empty appointments | 200 | CTA to book |
| Past date picked | — | Picker blocks selection |
| Beyond 90 days | — | Picker blocks, tooltip explains |
| Empty featured | 200 | Section hidden |

---

## 8. UI Theme Tokens

| Token | Value |
|---|---|
| Primary color | `#00A3A3` (HSL 180 100% 32%) |
| Background | `#FFFFFF` |
| Text | `#213547` |
| Border radius | `1.25rem` (xl) |
| Shadows | `shadow-lg` / `shadow-xl` |
| Mode | Light only |

### StatusBadge color palette
| Status | Color |
|---|---|
| PENDING | Amber/yellow |
| CONFIRMED | Blue |
| COMPLETED | Green |
| CANCELLED | Red |
| REJECTED | Gray |
| RESCHEDULED | Orange |

---

## 9. Implementation Order (Phases)

| Phase | Deliverables | Depends On |
|---|---|---|
| **P1 — Auth & Shell** | AppLayout, PublicLayout, ProtectedRoute, authStore, api service, Login, Register, Landing | Project setup |
| **P2 — Public** | Search results, Doctor profile (with slots), DoctorCard, SlotGrid, Pagination, EmptyState | P1 |
| **P3 — Patient** | Dashboard, Book wizard (3-step), My appointments, Appointment detail, Cancel/Reschedule | P1, P2 |
| **P4 — Doctor** | Dashboard, Appointment mgmt, Schedule editor, Profile editor | P1 |
| **P5 — Admin** | Dashboard (recharts), Doctor CRUD, User mgmt, Date filter | P1 |
| **P6 — Polish** | ErrorBoundary, 404 page, Loading skeletons, Toasts, Mobile responsive | P2–P5 |

---

## 10. Dependencies to Install

```bash
npm install react-router-dom date-fns recharts

# shadcn/ui components
npx shadcn@latest add input select textarea badge avatar separator dialog dropdown-menu sheet table tabs calendar popover skeleton toast
```

---

## 11. Detailed Implementation Plan — File-by-File Breakdown

### Phase P0: Project Setup

| Step | Dir / File | Action |
|---|---|---|
| 1 | `frontend/tabibi-frontend/` | `npm install react-router-dom date-fns recharts` |
| 2 | `frontend/tabibi-frontend/` | `npx shadcn@latest add input select textarea badge avatar separator dialog dropdown-menu sheet table tabs calendar popover skeleton toast` |
| 3 | `src/types/` | Create directory |

---

### Phase P1: Auth & Shell (Foundation) — 24 files

#### Types (4 files)

| # | File | Contents |
|---|---|---|
| 1 | `src/types/auth.types.ts` | `IUser`, `Role` (`PATIENT \| DOCTOR \| ADMIN`), `LoginData`, `RegisterData`, `AuthResponse` (tokens + user), `TokenPair` |
| 2 | `src/types/doctor.types.ts` | `DoctorSummary` (id, name, specialty, location, rating, fee), `DoctorProfile` (full with bio, education, experience, schedule), `Slot` (id, startTime, endTime, isBooked, isBreak), `ScheduleData` (day-of-week map with start/end/breaks), `ScheduleDay` |
| 3 | `src/types/appointment.types.ts` | `AppointmentStatus` enum, `Appointment` (id, patient, doctor, dateTime, status, reason, createdAt), `BookAppointmentData`, `RescheduleData`, `AppointmentQuery` |
| 4 | `src/types/api.types.ts` | `ApiResponse<T>`, `PaginatedResponse<T>`, `ApiError` (status, message, errors[]), `Pagination` (page, limit, total, totalPages), `DashboardData` |

#### Services (6 files)

| # | File | Contents |
|---|---|---|
| 5 | `src/services/api.ts` | Axios instance with `baseURL=http://localhost:3000/api`, request interceptor (attach Bearer token), response interceptor (401 → refresh → retry, normalize errors to `ApiError`) |
| 6 | `src/services/auth.service.ts` | `login(data)`, `register(data)`, `refreshToken(refreshToken)` |
| 7 | `src/services/search.service.ts` | `searchDoctors(params)`, `getFeaturedDoctors()`, `getDoctorById(id)`, `getAvailableSlots(id, date)` |
| 8 | `src/services/patient.service.ts` | `getAppointments(params)`, `bookAppointment(data)`, `getAppointmentById(id)`, `cancelAppointment(id)`, `rescheduleAppointment(id, data)`, `getProfile()` |
| 9 | `src/services/doctor.service.ts` | `getAppointments(params)`, `getAppointmentById(id)`, `updateStatus(id, status)`, `getSchedule()`, `updateSchedule(data)`, `getProfile()`, `updateProfile(data)` |
| 10 | `src/services/admin.service.ts` | `getDashboard(dateRange?)`, `getDoctors(params)`, `getDoctorById(id)`, `createDoctor(data)`, `updateDoctor(id, data)`, `removeDoctor(id)`, `getUsers(params)`, `getUserById(id)`, `updateUser(id, data)`, `deactivateUser(id)`, `reactivateUser(id)` |

#### Stores (6 files)

| # | File | State & Actions |
|---|---|---|
| 11 | `src/stores/authStore.ts` | `user`, `accessToken`, `refreshToken`, `isAuthenticated`, `role` + `login()`, `register()`, `logout()`, `refreshAccessToken()`, `loadFromStorage()` |
| 12 | `src/stores/doctorSearchStore.ts` | `results[]`, `pagination`, `filters` + `search()`, `clearFilters()`, `setPage()` |
| 13 | `src/stores/appointmentStore.ts` | `appointments[]`, `pagination`, `currentAppointment` + `fetchAppointments()`, `bookAppointment()`, `cancelAppointment()`, `rescheduleAppointment()`, `fetchById()` |
| 14 | `src/stores/doctorAppointmentStore.ts` | `appointments[]`, `pagination` + `fetchAppointments()`, `updateStatus()` |
| 15 | `src/stores/scheduleStore.ts` | `schedule` + `fetchSchedule()`, `updateSchedule()` |
| 16 | `src/stores/adminStore.ts` | `dashboard`, `doctors[]`, `users[]`, `pagination` + `fetchDashboard()`, `fetchDoctors()`, `fetchUsers()`, `createDoctor()`, `updateDoctor()`, `deactivateUser()`, `reactivateUser()` |

#### Layout & Guards (5 files)

| # | File | Description |
|---|---|---|
| 17 | `src/components/layout/PublicLayout.tsx` | Minimal wrapper: `<Header />` + `<main>{children}</main>` + footer |
| 18 | `src/components/layout/AppLayout.tsx` | Authenticated shell: `<Sidebar />` + header (user menu) + `<main>{children}</main>` |
| 19 | `src/components/layout/Header.tsx` | Logo "Tabibi", nav links (Home, Login, Register) — visibility toggles based on auth state |
| 20 | `src/components/layout/Sidebar.tsx` | Role-based nav items. Patient: Dashboard, Find Doctors, My Appointments, Profile. Doctor: Dashboard, Appointments, Schedule, Profile. Admin: Dashboard, Doctors, Users. Active route highlighted. |
| 21 | `src/components/layout/ProtectedRoute.tsx` | Props: `role: Role`. Checks auth + role. Redirect `/login?returnUrl=` if no token. Redirect `/` if wrong role with toast. |

#### Hooks (1 file)

| # | File | Description |
|---|---|---|
| 22 | `src/hooks/useAuth.ts` | Convenience wrapper around `authStore` with `isLoading` for initial auth check |

#### Visitor Pages (3 files)

| # | File | Key Elements |
|---|---|---|
| 23 | `src/routes/visitor/Landing.tsx` | Hero (search form: specialty + location), How It Works (3-step row), Featured Doctors (horizontal scroll, `GET /search/doctors/featured`), CTA banner; loading/empty/error states |
| 24 | `src/routes/visitor/Login.tsx` | Email + password form, "Remember me", submit → `authStore.login()` → redirect by role; 401/422/deactivated inline errors |
| 25 | `src/routes/visitor/Register.tsx` | Role toggle (PATIENT/DOCTOR), common fields + conditional doctor fields; password strength meter; submit → `authStore.register()` → redirect `/login` with toast |

#### App Entry (1 file)

| # | File | Description |
|---|---|---|
| 26 | `src/App.tsx` | `BrowserRouter` > `Routes`: public routes in `PublicLayout`, protected routes in `ProtectedRoute` + `AppLayout`; 22 route entries matching section 1 |

---

### Phase P2: Public (Search + Doctor Profiles) — 7 files

| # | File | Description |
|---|---|---|
| 27 | `src/components/common/DoctorCard.tsx` | `doctor: DoctorSummary, onSelect?` — avatar, name, specialty, location, star rating, fee badge; links to `/doctors/:id` or calls `onSelect` |
| 28 | `src/components/common/SlotGrid.tsx` | `slots: Slot[], selectedId?: string, onSelect: (id) => void` — time-slot chips: green (available), grey (booked), orange-striped (break); "No slots" text |
| 29 | `src/components/common/StatusBadge.tsx` | `status: AppointmentStatus` — colored pill: PENDING=amber, CONFIRMED=blue, COMPLETED=green, CANCELLED=red, REJECTED=gray, RESCHEDULED=orange |
| 30 | `src/components/common/EmptyState.tsx` | `icon, title, description, action?: { label, onClick }` — centered illustration + text + optional CTA |
| 31 | `src/components/common/Pagination.tsx` | `page, totalPages, onPageChange` — prev/next + page numbers; hidden when totalPages <= 1 |
| 32 | `src/components/common/SearchBar.tsx` | `filters, onSearch, onClear` — specialty, location, search text, min rating; "Search" + "Clear" buttons |
| 33 | `src/routes/visitor/SearchResults.tsx` | Reads URL params, renders SearchBar + DoctorCard grid + Pagination; client-side validates at least one filter; loading=6 skeletons; empty states per spec |
| 34 | `src/routes/visitor/DoctorPublicProfile.tsx` | Fetches `GET /search/doctors/:id` — header, about, schedule summary, slots section (DatePicker + SlotGrid); guest sees "Login to book"; 404 → not found |

---

### Phase P3: Patient (Appointment Flows) — 8 files

| # | File | Description |
|---|---|---|
| 35 | `src/components/common/AppointmentCard.tsx` | `appointment: Appointment, actions?: Action[]` — doctor info, date/time, StatusBadge, action buttons |
| 36 | `src/components/common/ConfirmModal.tsx` | `title, message, confirmLabel?, onConfirm, onCancel, variant?: 'danger' \| 'default'` — shadcn Dialog |
| 37 | `src/components/common/DatePicker.tsx` | `value, onChange, minDate, maxDate` — wraps shadcn calendar + popover |
| 38 | `src/routes/patient/PatientDashboard.tsx` | WelcomeCard, UpcomingAppointments (next 3), QuickActions; empty → "No upcoming" with "Book Now" CTA |
| 39 | `src/routes/patient/BookingWizard.tsx` | 3-step: Select Doctor → Select Date/Time → Confirm + reason; step indicator; back/next; 409 → auto-refresh slots |
| 40 | `src/routes/patient/MyAppointments.tsx` | Tabs (Upcoming/Past/Cancelled/All) with status filters; AppointmentCard list + Pagination |
| 41 | `src/routes/patient/AppointmentDetail.tsx` | Full info display; Cancel → ConfirmModal → `PATCH .../cancel`; Reschedule → inline picker → `PATCH .../reschedule`; 404/already-cancelled/past states |
| 42 | `src/routes/patient/PatientProfile.tsx` | Read-only display (name, email, phone, gender, DOB) from `GET /patients/profile` |

---

### Phase P4: Doctor (Schedule + Profile) — 5 files

| # | File | Description |
|---|---|---|
| 43 | `src/routes/doctor/DoctorDashboard.tsx` | Today's count badge, today's compact list, upcoming (next 5), quick links; empty → "No appointments today" |
| 44 | `src/routes/doctor/AppointmentManagement.tsx` | Filters (status, date range, patient name); table with StatusBadge + row actions (Confirm/Reject/Complete/Cancel per status rules); ConfirmModal on action |
| 45 | `src/routes/doctor/DoctorAppointmentDetail.tsx` | Patient info, full details, status timeline; same status actions as table row |
| 46 | `src/routes/doctor/ScheduleManagement.tsx` | 7-column weekly grid (Mon-Sun): Working/Off toggle, start/end time, break pairs with add/remove; slot duration input; save → `PUT /doctors/schedule`; validation |
| 47 | `src/routes/doctor/DoctorProfile.tsx` | Editable form: user fields + doctor fields; load `GET /doctors/profile`; save `PATCH /doctors/profile`; 422 inline errors |

---

### Phase P5: Admin (Dashboard + CRUD) — 6 files

| # | File | Description |
|---|---|---|
| 48 | `src/routes/admin/AdminDashboard.tsx` | 4 stat cards, date range filter, recharts BarChart (appointments by status), mini stat (users by role); skeleton loading |
| 49 | `src/routes/admin/DoctorManagement.tsx` | Search bar + table (Name, Email, Specialty, Location, Rating, Active badge, Edit/Deactivate) + Pagination; "Add Doctor" button |
| 50 | `src/routes/admin/CreateDoctor.tsx` | Full form (user + doctor fields); `POST /admin/doctors`; 409/422 inline errors |
| 51 | `src/routes/admin/EditDoctor.tsx` | Load `GET /admin/doctors/:id` → prefill form; `PATCH /admin/doctors/:id`; 404 redirect |
| 52 | `src/routes/admin/UserManagement.tsx` | Search + role/active/verified filters; table + Pagination |
| 53 | `src/routes/admin/UserDetailEdit.tsx` | Load `GET /admin/users/:id` → form; `PATCH /admin/users/:id`; Deactivate/Reactivate ConfirmModal; cannot deactivate self |

---

### Phase P6: Polish — 4 files

| # | File | Description |
|---|---|---|
| 54 | `src/components/common/LoadingSkeleton.tsx` | `variant: 'card' \| 'table' \| 'list' \| 'profile'` — animated pulse skeleton matching component dimensions |
| 55 | `src/components/common/ErrorBoundary.tsx` | Class component catching render errors; fallback UI + "Try again" |
| 56 | `src/routes/visitor/NotFound.tsx` | 404 page with illustration, "Page not found" text, "Go Home" button |
| 57 | `src/components/common/Toast.tsx` | Global toast queue (success/error/info) via Zustand; stacked rendering |

**Mobile responsive pass:** All layouts use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`), sidebar collapses to hamburger on mobile, tables become cards on small screens.

---

### Summary

| Category | Files |
|---|---|
| Types | 4 |
| Services | 6 |
| Stores | 6 |
| Layouts + Guards | 5 |
| Hooks | 1 |
| Common Components | 10 |
| Pages (Visitor) | 4 |
| Pages (Patient) | 5 |
| Pages (Doctor) | 5 |
| Pages (Admin) | 6 |
| App Entry | 1 |
| **Total** | **53 files across 6 phases** |

### Dependency Graph

```
P0 (setup) → P1 (auth + shell) → P2 (public)
                                     ↓
                                  P3 (patient)   P4 (doctor)   P5 (admin)
                                     ↓              ↓              ↓
                                  └────────── P6 (polish) ──────────┘
```
