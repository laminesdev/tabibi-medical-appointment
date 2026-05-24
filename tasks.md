# Tabibi Medical Appointment System — Implementation Tasks

## Project Setup
- [x] Create comprehensive frontend implementation plan (PLAN.md)
- [x] Set up React + Vite + TypeScript project
- [x] Install required dependencies (TailwindCSS, Axios, Zustand, etc.)
- [x] Define project structure
- [x] Install shadcn/ui components (18 primitives)
- [x] Customize theme (teal primary `#00A3A3`, xl rounded corners, light mode)

## Phase P1 — Core Infrastructure (COMPLETE)

### Types (4 files)
- [x] `auth.types.ts` — IUser, Role, LoginData, RegisterData, AuthResponse
- [x] `doctor.types.ts` — DoctorSummary, DoctorProfile, ScheduleData, ScheduleDay, Slot
- [x] `appointment.types.ts` — Appointment, AppointmentStatus, BookAppointmentData, RescheduleData, AppointmentQuery
- [x] `api.types.ts` — ApiResponse, PaginatedResponse, ApiError, Pagination, DashboardData

### Services (6 files)
- [x] `api.ts` — Axios instance + JWT interceptor + refresh token queue + error normalizer
- [x] `auth.service.ts` — login, register, refreshToken
- [x] `search.service.ts` — searchDoctors, getFeaturedDoctors, getDoctorById, getAvailableSlots
- [x] `patient.service.ts` — getProfile, getAppointments, bookAppointment, cancelAppointment, rescheduleAppointment
- [x] `doctor.service.ts` — getAppointments, getAppointmentById, updateStatus, getSchedule, updateSchedule, getProfile, updateProfile
- [x] `admin.service.ts` — getDashboard, getDoctors CRUD, getUsers CRUD, deactivate/reactivate

### Stores (6 files)
- [x] `authStore.ts` — user, tokens, login/register/logout/refresh/loadFromStorage
- [x] `doctorSearchStore.ts` — search results, pagination, filters
- [x] `doctorAppointmentStore.ts` — doctor appointments fetch/updateStatus
- [x] `appointmentStore.ts` — patient appointments, book/cancel/reschedule with loading/error states
- [x] `scheduleStore.ts` — doctor schedule fetch/update with default factory
- [x] `adminStore.ts` — dashboard, doctors CRUD, users CRUD, deactivate/reactivate — all with uniform try/catch

### Layout & Routing (6 files)
- [x] `PublicLayout.tsx` — Header + footer wrapper
- [x] `AppLayout.tsx` — Sidebar + header + responsive hamburger menu
- [x] `Header.tsx` — Logo, nav links (auth-aware)
- [x] `Sidebar.tsx` — Role-based navigation (Patient/Doctor/Admin)
- [x] `ProtectedRoute.tsx` — Auth guard + role check + deactivation check + returnUrl
- [x] `App.tsx` — Full routing tree (20 routes across 4 roles)

### Visitor Pages (5 files)
- [x] `Landing.tsx` — Hero with search, How It Works, Featured Doctors (with skeleton/empty/error states), CTA
- [x] `Login.tsx` — Email + password form, deactivation message, role-based redirect
- [x] `Register.tsx` — Role toggle (Patient/Doctor), password strength meter, conditional doctor fields, inline errors
- [x] `NotFound.tsx` — 404 page with Go Home CTA
- [ ] `SearchResults.tsx` — Route shell only (placeholder: "Search functionality coming in Phase 2")
- [ ] `DoctorPublicProfile.tsx` — Route shell only (placeholder: "Doctor profile view coming in Phase 2")

### Patient Pages (5 files — all placeholder shells)
- [ ] `PatientDashboard.tsx` — Partial UI (welcome card + quick action cards), but no real data
- [ ] `MyAppointments.tsx` — Route shell with "Book Appointment" button (placeholder)
- [ ] `BookingWizard.tsx` — Route shell (placeholder)
- [ ] `AppointmentDetail.tsx` — Route shell (placeholder)
- [ ] `PatientProfile.tsx` — Route shell (placeholder)

### Doctor Pages (5 files — all placeholder shells)
- [ ] `DoctorDashboard.tsx` — Route shell (placeholder)
- [ ] `AppointmentManagement.tsx` — Route shell (placeholder)
- [ ] `DoctorAppointmentDetail.tsx` — Route shell (placeholder)
- [ ] `ScheduleManagement.tsx` — Route shell (placeholder)
- [ ] `DoctorProfilePage.tsx` — Route shell (placeholder)

### Admin Pages (6 files — all placeholder shells)
- [ ] `AdminDashboard.tsx` — Route shell (placeholder)
- [ ] `DoctorManagement.tsx` — Route shell (placeholder)
- [ ] `CreateDoctor.tsx` — Route shell (placeholder)
- [ ] `EditDoctor.tsx` — Route shell (placeholder)
- [ ] `UserManagement.tsx` — Route shell (placeholder)
- [ ] `UserDetailEdit.tsx` — Route shell (placeholder)

### Hooks (3 files)
- [x] `useMediaQuery.ts` — Responsive breakpoint detection
- [x] `use-toast.ts` — shadcn toast hook
- [x] `useAuth.ts` — Auth store convenience wrapper

### Bug Fixes Applied (all verified, tsc --noEmit passes)
- [x] ScheduleStore: extracted factory function, exported defaultSchedule
- [x] RegisterData: phone/consultationFee/experienceYears typed as string
- [x] PatientProfile: interface added to patient.service.ts
- [x] adminStore.createDoctor: added try/catch with error state
- [x] adminStore.updateDoctor: re-fetches after update via getDoctorById
- [x] DoctorProfile.user: nests gender/isActive fields
- [x] createDoctor/updateDoctor: proper return types (not any)
- [x] Login: surfaces deactivation reason + ProtectedRoute handles ?reason=deactivated
- [x] cancelAppointment/removeDoctor/updateUser/deactivateUser/reactivateUser: added uniform try/catch + loading/error state

## Phase P2 — Public Search & Profiles (NOT STARTED)

### Components to build
- [ ] `DoctorCard` — Summary card with avatar, name, specialty, rating, fee
- [ ] `SlotGrid` — Time slot chip grid (available/blocked/break)
- [ ] `StatusBadge` — Colored pill for appointment statuses
- [ ] `EmptyState` — Centered illustration + title + description + optional CTA
- [ ] `Pagination` — Page numbers + prev/next
- [ ] `SearchBar` — Filter inputs + search/clear buttons

### Pages to implement
- [ ] `SearchResults.tsx` — Full implementation with filters + cards + pagination
- [ ] `DoctorPublicProfile.tsx` — Doctor info + schedule summary + slot picker

## Phase P3 — Patient Functionality (NOT STARTED)

### Components to build
- [ ] `AppointmentCard` — Appointment summary with status + actions
- [ ] `ConfirmModal` — shadcn Dialog for destructive confirmations
- [ ] `DatePicker` — Calendar popover wrapper

### Pages to implement
- [ ] `PatientDashboard.tsx` — Upcoming appointments + quick actions
- [ ] `MyAppointments.tsx` — Tabbed list (Upcoming/Past/Cancelled/All) with actions
- [ ] `BookingWizard.tsx` — 3-step: doctor → date/time → confirm
- [ ] `AppointmentDetail.tsx` — Full details + cancel/reschedule
- [ ] `PatientProfile.tsx` — Read-only profile display

## Phase P4 — Doctor Functionality (NOT STARTED)

### Pages to implement
- [ ] `DoctorDashboard.tsx` — Today's count + upcoming list + quick links
- [ ] `AppointmentManagement.tsx` — Filterable table with status actions
- [ ] `DoctorAppointmentDetail.tsx` — Patient info + status timeline + actions
- [ ] `ScheduleManagement.tsx` — Weekly grid editor (Mon-Sun)
- [ ] `DoctorProfile.tsx` — Editable user + doctor fields

## Phase P5 — Admin Functionality (NOT STARTED)

### Pages to implement
- [ ] `AdminDashboard.tsx` — Stat cards + recharts + date range filter
- [ ] `DoctorManagement.tsx` — Searchable table + add/edit/deactivate
- [ ] `CreateDoctor.tsx` — Full user + doctor creation form
- [ ] `EditDoctor.tsx` — Prefilled update form
- [ ] `UserManagement.tsx` — Searchable table + role/active/verified filters
- [ ] `UserDetailEdit.tsx` — View/edit + deactivate/reactivate

## Phase P6 — Polish (NOT STARTED)

- [ ] `LoadingSkeleton` — Card/table/list/profile skeleton variants
- [ ] `ErrorBoundary` — Class component catching render errors
- [ ] Full mobile responsive pass
- [ ] Global toast queue integration
