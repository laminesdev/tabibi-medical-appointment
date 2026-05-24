# Tabibi Medical Appointment System — Implementation Tasks

## Project Setup
- [x] Create comprehensive frontend implementation plan (PLAN.md)
- [x] Set up React + Vite + TypeScript project
- [x] Install required dependencies (TailwindCSS, Axios, Zustand, etc.)
- [x] Define project structure
- [x] Install shadcn/ui components (18 primitives)
- [x] Customize theme (teal primary `#00A3A3`, xl rounded corners, light mode)

## Phase P1 — Core Infrastructure (COMPLETE)

### Types
- [x] `auth.types.ts` — IUser, Role, LoginData, RegisterData, AuthResponse
- [x] `doctor.types.ts` — DoctorSummary, DoctorProfile, ScheduleData, ScheduleDay, Slot
- [x] `appointment.types.ts` — Appointment, AppointmentStatus, BookAppointmentData, RescheduleData
- [x] `api.types.ts` — ApiResponse, PaginatedResponse, ApiError, Pagination, DashboardData

### Services
- [x] `api.ts` — Axios instance + JWT interceptor + refresh token queue + error normalizer
- [x] `auth.service.ts` — login, register, refreshToken
- [x] `search.service.ts` — searchDoctors, getFeaturedDoctors, getDoctorById, getAvailableSlots
- [x] `patient.service.ts` — getProfile, getAppointments, bookAppointment, cancelAppointment, rescheduleAppointment
- [x] `doctor.service.ts` — getAppointments, getAppointmentById, updateStatus, getSchedule, updateSchedule, getProfile, updateProfile
- [x] `admin.service.ts` — getDashboard, getDoctors CRUD, getUsers CRUD, deactivate/reactivate

### Stores (Zustand)
- [x] `authStore.ts` — user, tokens, login/register/logout/refresh/loadFromStorage
- [x] `appointmentStore.ts` — patient appointments, book/cancel/reschedule with loading/error states
- [x] `scheduleStore.ts` — doctor schedule fetch/update with default factory
- [x] `adminStore.ts` — dashboard, doctors CRUD, users CRUD, deactivate/reactivate — all with uniform try/catch

### Layout & Routing
- [x] `PublicLayout.tsx` — Header + footer wrapper
- [x] `AppLayout.tsx` — Sidebar + header + responsive hamburger menu
- [x] `Header.tsx` — Logo, nav links (auth-aware)
- [x] `Sidebar.tsx` — Role-based navigation (Patient/Doctor/Admin)
- [x] `ProtectedRoute.tsx` — Auth guard + role check + deactivation check + returnUrl
- [x] `App.tsx` — Full routing tree (20 routes across 4 roles)

### Visitor Pages
- [x] `Landing.tsx` — Hero with search, How It Works, Featured Doctors (with skeleton/empty/error states), CTA
- [x] `Login.tsx` — Email + password form, deactivation message, role-based redirect
- [x] `Register.tsx` — Role toggle (Patient/Doctor), password strength meter, conditional doctor fields, inline errors
- [x] `NotFound.tsx` — 404 page with Go Home CTA

### Hooks
- [x] `useMediaQuery.ts` — Responsive breakpoint detection

### Bug Fixes Applied
- [x] ScheduleStore: extracted factory function, exported defaultSchedule
- [x] RegisterData: phone/consultationFee/experienceYears typed as string
- [x] PatientProfile: interface added to patient.service.ts
- [x] adminStore.createDoctor: added try/catch with error state
- [x] adminStore.updateDoctor: re-fetches after update via getDoctorById
- [x] DoctorProfile.user: nests gender/isActive fields
- [x] createDoctor/updateDoctor: proper return types (not any)
- [x] Login: surfaces deactivation reason + ProtectedRoute handles ?reason=deactivated
- [x] cancelAppointment/removeDoctor/updateUser/deactivateUser/reactivateUser: added uniform try/catch + loading/error state

## Phase P2 — Search & Public Profiles (PLACEHOLDER)
- [ ] DoctorCard, SlotGrid, StatusBadge, EmptyState, Pagination, SearchBar components
- [ ] SearchResults page with filters + doctor cards + pagination
- [ ] DoctorPublicProfile with schedule + slot picker

## Phase P3 — Patient Functionality (PLACEHOLDER)
- [ ] PatientDashboard with upcoming appointments
- [ ] BookingWizard (3-step: doctor → date/time → confirm)
- [ ] MyAppointments with tabs + actions
- [ ] AppointmentDetail with cancel/reschedule
- [ ] AppointmentCard, ConfirmModal, DatePicker components

## Phase P4 — Doctor Functionality (PLACEHOLDER)
- [ ] DoctorDashboard with today's appointments
- [ ] AppointmentManagement with status actions
- [ ] DoctorAppointmentDetail
- [ ] ScheduleManagement (weekly grid editor)

## Phase P5 — Admin Functionality (PLACEHOLDER)
- [ ] AdminDashboard with recharts + date filter
- [ ] DoctorManagement with CRUD
- [ ] CreateDoctor page
- [ ] EditDoctor page
- [ ] UserManagement with search/filter
- [ ] UserDetailEdit with deactivate/reactivate

## Phase P6 — Polish (PLACEHOLDER)
- [ ] LoadingSkeleton component (card/table/list variants)
- [ ] ErrorBoundary component
- [ ] Full mobile responsive pass
- [ ] Global toast notification system
