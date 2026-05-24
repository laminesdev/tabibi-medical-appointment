# Tabibi Medical Appointment System — Frontend Plan

## Project Overview
A web-based medical appointment scheduling platform connecting patients, doctors, and administrators. Built with React + TypeScript, this frontend communicates with a backend API at `http://localhost:5000/api`.

## Technology Stack
- **Framework**: React 19 + Vite 7
- **Language**: TypeScript 5.9 (strict mode)
- **Styling**: Tailwind CSS 3 + autoprefixer
- **UI Components**: shadcn/ui (18 primitives — Radix-based)
- **Icons**: lucide-react
- **State Management**: Zustand 5
- **HTTP Client**: Axios (with JWT refresh queue)
- **Routing**: React Router 7
- **Charts**: recharts
- **Animation**: framer-motion
- **Design**: Light mode only, primary color `#00A3A3` (HSL 180 100% 32%)

## Implementation Status

| Phase | Scope | Files | Status |
|-------|-------|-------|--------|
| **P1** | Types, Services, Stores, Layout, Auth, Landing | 47 files | **Complete** |
| **P2** | Search results, doctor profiles, slot picker | 8 files | Planned |
| **P3** | Patient dashboard, booking, appointments | 8 files | Planned |
| **P4** | Doctor dashboard, schedule, appointment mgmt | 5 files | Planned |
| **P5** | Admin dashboard, doctor/user CRUD | 6 files | Planned |
| **P6** | Loading skeletons, error boundaries, polish | 4 files | Planned |

**Verification:** `tsc --noEmit` passes with zero errors. All async store methods have uniform try/catch + loading/error state.

---

## Project Structure

```
frontend/tabibi-frontend/
├── public/
├── src/
│   ├── types/              # 4 files — IUser, DoctorSummary/Profile, Appointment, API contracts
│   ├── services/           # 6 files — Axios instance + auth, search, patient, doctor, admin
│   ├── stores/             # 6 files — auth, doctorSearch, doctorAppointment, appointment, schedule, admin
│   ├── components/
│   │   ├── ui/            # 18 shadcn/ui primitives (button, card, dialog, select, etc.)
│   │   └── layout/        # 5 files — Header, PublicLayout, AppLayout, Sidebar, ProtectedRoute
│   ├── hooks/              # 3 files — useMediaQuery, use-toast, useAuth
│   ├── lib/                # cn() utility (clsx + tailwind-merge)
│   ├── routes/
│   │   ├── visitor/        # Landing, Login, Register, NotFound (done) + SearchResults, DoctorPublicProfile (shells)
│   │   ├── patient/        # 5 placeholder shells
│   │   ├── doctor/         # 5 placeholder shells
│   │   └── admin/          # 6 placeholder shells
│   ├── App.tsx             # Full routing tree (20 routes, 4 roles)
│   ├── main.tsx            # Entry point + loadFromStorage
│   └── index.css           # Tailwind + CSS variables (teal theme)
├── index.html
├── package.json
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── vite.config.ts          # @ alias + port 3000
├── tailwind.config.js      # shadcn/ui theme tokens
└── postcss.config.js
```

---

## Phased Implementation Plan

### Phase P1 — Core Infrastructure (DONE — v1.0.0)

**Completed files (47 files, 6,800+ lines):**

#### Types (4)
- `auth.types.ts` — IUser, Role (PATIENT|DOCTOR|ADMIN), LoginData, RegisterData, AuthResponse
- `doctor.types.ts` — DoctorSummary, DoctorProfile (with nested user + gender/isActive), ScheduleData, ScheduleDay, Slot
- `appointment.types.ts` — Appointment, AppointmentStatus (PENDING|CONFIRMED|CANCELLED|COMPLETED|RESCHEDULED|REJECTED), BookAppointmentData, RescheduleData, AppointmentQuery
- `api.types.ts` — ApiResponse<T>, PaginatedResponse<T>, ApiError, Pagination, DashboardData

#### Services (6)
- `api.ts` — Axios instance with request interceptor (Bearer token) + response interceptor (401 → refresh queue → retry, else normalize to ApiError)
- `auth.service.ts` — login, register, refreshToken
- `search.service.ts` — searchDoctors, getFeaturedDoctors, getDoctorById, getAvailableSlots
- `patient.service.ts` — getProfile (returns PatientProfile with nested user), getAppointments, bookAppointment, cancelAppointment, rescheduleAppointment
- `doctor.service.ts` — getAppointments, getAppointmentById, updateStatus, getSchedule (parses JSON day fields), updateSchedule (serializes), getProfile, updateProfile
- `admin.service.ts` — getDashboard, getDoctors, getDoctorById, createDoctor, updateDoctor, removeDoctor, getUsers, getUserById, updateUser, deactivateUser, reactivateUser

#### Stores (6)
- `authStore.ts` — user, accessToken, refreshToken, isAuthenticated, role, isLoading + login/register/logout/refreshAccessToken/loadFromStorage/setUser
- `doctorSearchStore.ts` — results[], pagination, currentPage, filters + search/setPage/setFilter/clearFilters
- `doctorAppointmentStore.ts` — appointments[], pagination, isLoading, error + fetchAppointments/updateStatus
- `appointmentStore.ts` — appointments[], currentAppointment, pagination, isLoading, error + fetchAppointments/fetchById/bookAppointment/cancelAppointment/rescheduleAppointment (all with uniform try/catch)
- `scheduleStore.ts` — schedule (ScheduleData|null), isLoading, error + fetchSchedule/updateSchedule + exported defaultSchedule + createDefaultDay factory
- `adminStore.ts` — dashboard, doctors[], users[], currentDoctor, currentUser, pagination, isLoading, error + fetchDashboard/fetchDoctors/fetchDoctorById/createDoctor/updateDoctor/removeDoctor/fetchUsers/fetchUserById/updateUser/deactivateUser/reactivateUser (all with uniform try/catch)

#### Layout (5)
- `PublicLayout.tsx` — Header + main + footer
- `AppLayout.tsx` — Responsive: sidebar (desktop) or Sheet menu (mobile) + header with user name + logout + Outlet
- `Header.tsx` — Logo + Find Doctors link + Dashboard/Logout (auth'd) or Login/Register (guest)
- `Sidebar.tsx` — Role-based nav items (Patient: 4, Doctor: 4, Admin: 3) + user avatar + logout
- `ProtectedRoute.tsx` — Props: role. Checks isLoading → spinner, unauthenticated → redirect `/login?returnUrl=`, inactive → redirect `/login?reason=deactivated`, wrong role → redirect `/`

#### Visitor Pages
- `Landing.tsx` — Hero section with specialty select + location input + Search CTA, How It Works (3-step row), Featured Doctors (horizontal scroll, skeleton/empty/error states), CTA banner (auth-aware)
- `Login.tsx` — Email + password + show/hide toggle, deactivation error message, role-based dashboard redirect, returnUrl support
- `Register.tsx` — Patient/Doctor role toggle, common fields (name, email, password with strength meter, phone, gender, DOB), conditional doctor fields (specialty, location, bio, fee, experience, education), field-level 422 error display, 409 inline errors
- `NotFound.tsx` — 404 page with icon + "Go Home" button

#### Hooks (3)
- `useMediaQuery.ts` — Generic media query hook
- `use-toast.ts` — shadcn toast hook (from shadcn/ui installation)
- `useAuth.ts` — Convenience wrapper (currently minimal)

#### Routing
- `App.tsx` — BrowserRouter with 20 routes: 5 public (PublicLayout), 5 patient (ProtectedRoute role=PATIENT), 5 doctor (ProtectedRoute role=DOCTOR), 5 admin (ProtectedRoute role=ADMIN)

#### Bug fixes applied during P1
1. ScheduleStore: Extracted `createDefaultDay()` factory to avoid stale closure + exported `defaultSchedule` constant
2. RegisterData: Changed `phone`, `consultationFee`, `experienceYears` from `number` to `string` (matching form inputs)
3. PatientProfile: Added `PatientProfile` interface to `patient.service.ts` with `user: IUser` nesting
4. `adminStore.createDoctor`: Added try/catch + error state set (was unhandled promise)
5. `adminStore.updateDoctor`: Added re-fetch via `getDoctorById` after PUT to get complete DoctorProfile
6. `DoctorProfile.user`: Typed as `DoctorUser & { gender?, isActive? }` matching Prisma schema (was flat)
7. `createDoctor`/`updateDoctor` return types: Properly typed as `Promise<DoctorProfile>` (was `any`)
8. Login deactivation: Shows "Account has been deactivated" on 403 + `ProtectedRoute` redirects with `?reason=deactivated`
9. 5 missing try/catch blocks: `cancelAppointment`, `removeDoctor`, `updateUser`, `deactivateUser`, `reactivateUser` — all now have uniform loading/error state + re-throw

### P1 Placeholder route shells (16 files — routes exist but show "Coming in Phase X")
All patient/doctor/admin pages have route entries and basic placeholder components. These are minimal shells awaiting Phase P3-P5 implementation.

---

### Phase P2 — Public Search & Profiles (PLANNED)

**Components:**
- `DoctorCard` — Avatar, name, specialty, location, rating stars, fee badge → links to `/doctors/:id`
- `SlotGrid` — Time-slot chips: green (available), grey (booked), orange-striped (break), selected state
- `StatusBadge` — Colored pill: PENDING=amber, CONFIRMED=blue, COMPLETED=green, CANCELLED=red, REJECTED=gray, RESCHEDULED=orange
- `EmptyState` — Centered illustration + title + description + optional CTA button
- `Pagination` — Page numbers + prev/next; hidden when totalPages <= 1
- `SearchBar` — Specialty select, location input, search text, min rating, Search/Clear buttons

**Pages:**
- `SearchResults` — URL param parsing, SearchBar + DoctorCard grid + Pagination, client-side validation (at least one filter), loading skeletons, empty/error states
- `DoctorPublicProfile` — Header (name, specialty, rating, fee), About (bio, education, experience), Schedule summary (parsed from JSON), Slot picker (DatePicker + SlotGrid; guests see "Login to book")

**API:** `GET /search/doctors`, `GET /search/doctors/featured`, `GET /search/doctors/:id`, `GET /search/doctors/:id/slots?date=`

---

### Phase P3 — Patient Functionality (PLANNED)

**Components:**
- `AppointmentCard` — Doctor info, date/time, StatusBadge, action buttons
- `ConfirmModal` — shadcn Dialog + danger variant for destructive actions
- `DatePicker` — shadcn Calendar + Popover with min/max date constraints

**Pages:**
- `PatientDashboard` — WelcomeCard, UpcomingAppointments (next 3), QuickActions; empty → "Book Now" CTA
- `BookingWizard` — 3-step: Select Doctor (search + grid) → Select Date/Time (DatePicker + SlotGrid) → Confirm + reason; 409 → auto-refresh slots
- `MyAppointments` — Tabs (Upcoming/Past/Cancelled/All), AppointmentCard list + Pagination
- `AppointmentDetail` — Full info + Cancel (ConfirmModal) + Reschedule (inline picker); 404/already-cancelled/past states
- `PatientProfile` — Read-only display from `GET /patients/profile`

**API:** `POST /patients/appointments`, `GET /patients/appointments`, `GET /patients/appointments/:id`, `PATCH .../cancel`, `PATCH .../reschedule`

---

### Phase P4 — Doctor Functionality (PLANNED)

**Pages:**
- `DoctorDashboard` — Today's count badge, today's compact list, upcoming (next 5), quick links
- `AppointmentManagement` — Filters (status, date range, patient name), table with status actions (Confirm/Reject/Complete/Cancel per status rules)
- `DoctorAppointmentDetail` — Patient info + status timeline + same actions as table
- `ScheduleManagement` — 7-column weekly editor: on/off toggle per day, start/end time, break pairs, slot duration; validation; save → `PUT /doctors/schedule`
- `DoctorProfile` — Editable form (user + doctor fields); load `GET /doctors/profile`; save `PATCH /doctors/profile`

**API:** `GET /doctors/appointments`, `GET /doctors/appointments/:id`, `PATCH .../status`, `GET /doctors/schedule`, `PUT /doctors/schedule`, `GET /doctors/profile`, `PATCH /doctors/profile`

---

### Phase P5 — Admin Functionality (PLANNED)

**Pages:**
- `AdminDashboard` — 4 stat cards, date range filter, recharts BarChart (appointments by status), user role breakdown
- `DoctorManagement` — Search + table (Name, Email, Specialty, Rating, Active badge, Edit/Deactivate) + Pagination + "Add Doctor" button
- `CreateDoctor` — Full user + doctor form; `POST /admin/doctors`; 409/422 inline errors
- `EditDoctor` — Load `GET /admin/doctors/:id` → prefill; `PATCH /admin/doctors/:id`; 404 redirect
- `UserManagement` — Search + role/active/verified filters + table + Pagination
- `UserDetailEdit` — Load `GET /admin/users/:id` → form; Deactivate/Reactivate ConfirmModal (cannot deactivate self)

**API:** `GET /admin/dashboard`, CRUD for `/admin/doctors`, CRUD for `/admin/users`, `.../deactivate`, `.../reactivate`

---

### Phase P6 — Polish (PLANNED)

**Components:**
- `LoadingSkeleton` — Card/table/list/profile variants (animated pulse)
- `ErrorBoundary` — Class component catching render errors + "Try Again"

**Global work:**
- Full mobile responsive pass across all layouts
- Toast notification queue integration

---

## Design System

| Token | Value |
|-------|-------|
| Primary | `#00A3A3` (HSL 180 100% 32%) |
| Background | `#FFFFFF` |
| Text | `#213547` |
| Border radius | `1.25rem` (xl) |
| Shadows | `shadow-lg` / `shadow-xl` |
| Mode | Light only |
| Typography | Inter / system-ui |

### StatusBadge Color Map
| Status | Color |
|--------|-------|
| PENDING | Amber/yellow |
| CONFIRMED | Blue |
| COMPLETED | Green |
| CANCELLED | Red |
| REJECTED | Gray |
| RESCHEDULED | Orange |

---

## State Management — Store Architecture

| Store | Key State | Actions |
|-------|-----------|---------|
| `authStore` | user, tokens, isAuthenticated, role, isLoading | login, register, logout, refreshAccessToken, loadFromStorage, setUser |
| `doctorSearchStore` | results[], pagination, filters | search, setPage, setFilter, clearFilters |
| `doctorAppointmentStore` | appointments[], pagination, isLoading, error | fetchAppointments, updateStatus |
| `appointmentStore` | appointments[], currentAppointment, pagination, isLoading, error | fetchAppointments, fetchById, bookAppointment, cancelAppointment, rescheduleAppointment |
| `scheduleStore` | schedule, isLoading, error | fetchSchedule, updateSchedule |
| `adminStore` | dashboard, doctors[], users[], currentDoctor, currentUser, pagination, isLoading, error | fetchDashboard, fetchDoctors, fetchDoctorById, createDoctor, updateDoctor, removeDoctor, fetchUsers, fetchUserById, updateUser, deactivateUser, reactivateUser |

All async store methods follow the uniform pattern: `set({ isLoading: true, error: null })` → try/catch → `set({ error: message, isLoading: false })` → re-throw for error propagation.

---

## API Service Layer & Interceptor Chain

```
src/services/
  api.ts                Axios instance, interceptors, error normalizer
  auth.service.ts       login, register, refresh
  search.service.ts     searchDoctors, getFeatured, getDoctorById, getAvailableSlots
  patient.service.ts    getProfile, bookAppointment, getAppointments, getAppointmentById, cancel, reschedule
  doctor.service.ts     getAppointments, getAppointmentById, updateStatus, getSchedule, updateSchedule, getProfile, updateProfile
  admin.service.ts      getDashboard, getDoctors, getDoctorById, createDoctor, updateDoctor, removeDoctor, getUsers, getUserById, updateUser, deactivateUser, reactivateUser
```

**Interceptor chain:**
```
Request  → attach Authorization: Bearer <accessToken>
Response → if 401 → POST /auth/refresh with queue → retry original
         → if 401 (refresh fails) → clear auth → redirect /login
         → normalize error to ApiError { status, message, errors? }
```

---

## Error Handling Matrix

| Scenario | HTTP | UI |
|----------|------|----|
| Invalid credentials | 401 | "Invalid email or password" inline |
| Deactivated account | 401/403 | "Account has been deactivated" inline |
| Duplicate email/phone | 409 | Inline field error |
| Slot taken mid-booking | 409 | Toast + auto-refresh slots |
| Validation error | 422 | Field-level messages below inputs |
| Not found | 404 | "Go Home" page |
| Rate limited | 429 | "Too many requests" toast |
| Server error | 500 | "Something went wrong" toast |
| Network offline | — | "No internet connection" toast |
| Token expired | 401 | Auto-refresh (transparent) |
| Refresh expired | 401 | Logout + redirect /login |

---

## Authentication Flow

```
[Unauthenticated]
  ├─ /login → POST /api/auth/login → tokens stored → redirect /{role}/dashboard
  ├─ /register → POST /api/auth/register → redirect /login
  └─ protected route → redirect /login?returnUrl=<path>

[Authenticated]
  ├─ Token valid → render
  ├─ Token expired → interceptor refresh → retry
  ├─ Refresh expired → logout → redirect /login
  ├─ Account deactivated → redirect /login?reason=deactivated
  └─ Logout → clear store + localStorage → redirect /
```

---

## Route Architecture

| Path | Page | Auth | Role | P1 Status |
|------|------|------|------|-----------|
| `/` | Landing | — | — | **Done** |
| `/login` | Login | — | — | **Done** |
| `/register` | Registration | — | — | **Done** |
| `/doctors` | Search results | — | — | Shell only |
| `/doctors/:id` | Doctor public profile | — | — | Shell only |
| `/patient/dashboard` | Patient dashboard | ✓ | PATIENT | Shell only |
| `/patient/appointments` | My appointments | ✓ | PATIENT | Shell only |
| `/patient/appointments/book` | Book appointment | ✓ | PATIENT | Shell only |
| `/patient/appointments/:id` | Appointment detail | ✓ | PATIENT | Shell only |
| `/patient/profile` | Patient profile | ✓ | PATIENT | Shell only |
| `/doctor/dashboard` | Doctor dashboard | ✓ | DOCTOR | Shell only |
| `/doctor/appointments` | Appointment management | ✓ | DOCTOR | Shell only |
| `/doctor/appointments/:id` | Appointment detail | ✓ | DOCTOR | Shell only |
| `/doctor/schedule` | Schedule management | ✓ | DOCTOR | Shell only |
| `/doctor/profile` | Profile management | ✓ | DOCTOR | Shell only |
| `/admin/dashboard` | Admin dashboard | ✓ | ADMIN | Shell only |
| `/admin/doctors` | Doctor management | ✓ | ADMIN | Shell only |
| `/admin/doctors/new` | Create doctor | ✓ | ADMIN | Shell only |
| `/admin/doctors/:id` | Edit doctor | ✓ | ADMIN | Shell only |
| `/admin/users` | User management | ✓ | ADMIN | Shell only |
| `/admin/users/:id` | User detail/edit | ✓ | ADMIN | Shell only |

---

## Future Enhancements

- Appointment reminders via email/SMS
- Doctor rating and review system
- Advanced search filters (insurance, availability, languages)
- Calendar integration (Google Calendar, Outlook)
- Telemedicine functionality (video calls)
- Multi-language support (i18n)
- Dark mode toggle
- PWA support
