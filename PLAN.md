# Tabibi Medical Appointment System - Frontend Plan

## Project Overview
This document outlines the implementation plan for the frontend of the Tabibi Medical Appointment System. Tabibi is a web-based platform that facilitates medical appointment scheduling between patients and doctors, with administrative oversight.

## Technology Stack
- **Framework**: React + Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **Icons**: react-icons
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Animations**: framer-motion
- **Design**: Minimalistic, light mode only with primary color #00A3A3

## Project Structure
```
frontend/tabibi-frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, icons, and other assets
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── layout/       # Layout components (Header, Footer, etc.)
│   │   ├── forms/        # Form components
│   │   └── common/       # Common components used across roles
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and libraries
│   │   └── utils/        # Helper functions
│   ├── services/         # API service layer
│   ├── stores/            # Zustand stores
│   ├── types/            # TypeScript types and interfaces
│   ├── routes/           # Route components for each user role
│   │   ├── visitor/      # Public routes (landing, search, etc.)
│   │   ├── patient/      # Patient-specific routes
│   │   ├── doctor/       # Doctor-specific routes
│   │   └── admin/        # Admin-specific routes
│   ├── App.tsx           # Main App component with routing
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global CSS styles
├── index.html            # HTML template
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # TailwindCSS configuration
└── postcss.config.js     # PostCSS configuration
```

### Structure Explanation

#### Components Directory
- **ui/**: Contains shadcn/ui components
- **layout/**: Header, Footer, Sidebar, and other layout components
- **forms/**: Reusable form components with validation
- **common/**: Shared components like buttons, cards, notifications

#### Hooks Directory
- Custom React hooks for data fetching, form handling, etc.
- Custom hooks for each feature (useAuth, useAppointments, etc.)

#### Lib Directory
- Utility functions for date handling, formatting, etc.
- Helper functions for validation, data transformation

#### Services Directory
- API service layer that abstracts Axios calls
- Separate service files for each entity (authService, doctorService, etc.)

#### Stores Directory
- Zustand stores for global state management
- Separate stores for auth, doctors, appointments, admin data

#### Types Directory
- TypeScript interfaces and types for API responses
- Type definitions for application state

#### Routes Directory
Organized by user role:
- **visitor/**: Landing page, search results, doctor profiles, registration
- **patient/**: Dashboard, appointment booking, appointment management
- **doctor/**: Dashboard, schedule management, appointment handling
- **admin/**: Dashboard, doctor management, user management

This structure follows best practices for React applications:
- Separation of concerns
- Scalability for future features
- Clear organization by feature and responsibility
- Easy maintenance and collaboration

## Development Approach
We will follow a phased approach, implementing one user role at a time in the following sequence:
1. Visitor/Public functionality
2. Patient functionality
3. Doctor functionality
4. Admin functionality

## API Integration
The frontend will communicate with the backend API running on `http://localhost:5000/api`. All endpoints are protected with JWT authentication where required.

## Phase 1: Visitor/Public Functionality

### Features
- Landing page with system overview
- Doctor search by specialty and location
- Doctor profile viewing
- Registration capability

### Pages & Components
- **Landing Page**
  - Header with navigation
  - Hero section explaining the system
  - Search form (specialty, location)
  - Featured doctors section
  
- **Search Results Page**
  - Doctor cards with name, specialty, location, rating
  - Filtering options
  - Pagination

- **Doctor Profile Page**
  - Detailed doctor information
  - Specialty, location, bio
  - Rating and reviews
  - Appointment booking option (for registered patients)

- **Registration Page**
  - Role selection (Patient, Doctor, Admin)
  - Form with validation
  - Password strength indicator
  - Terms and conditions acceptance

### API Endpoints
- `GET /api/search/doctors` - Search doctors by specialty/location
- `GET /api/search/doctors/:id` - Get doctor by ID
- `POST /api/auth/register` - User registration

## Phase 2: Patient Functionality

### Features
- Authentication (login/logout)
- Appointment booking
- Appointment management (view, cancel, reschedule)
- Appointment history

### Pages & Components
- **Patient Dashboard**
  - Upcoming appointments summary
  - Quick actions (search doctors, book appointment)
  - Personal information display

- **Login Page**
  - Email/password form
  - "Forgot password" link
  - Registration redirect

- **Appointment Booking**
  - Doctor selection
  - Date picker
  - Time slot selection
  - Reason for appointment
  - Confirmation

- **My Appointments**
  - Tabbed interface (Upcoming, Past, Cancelled)
  - Appointment cards with status
  - Action buttons (cancel, reschedule)

### API Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/patients/appointments` - Book appointment
- `GET /api/patients/appointments` - Get all appointments
- `GET /api/patients/appointments/:id` - Get appointment by ID
- `PATCH /api/patients/appointments/:id/cancel` - Cancel appointment
- `PATCH /api/patients/appointments/:id/reschedule` - Reschedule appointment

## Phase 3: Doctor Functionality

### Features
- Authentication (login/logout)
- Schedule management
- Appointment management
- Profile management

### Pages & Components
- **Doctor Dashboard**
  - Today's appointments summary
  - Upcoming appointments
  - Quick schedule access

- **Schedule Management**
  - Weekly schedule view
  - Working hours per day
  - Break time configuration
  - Time slot duration setting

- **Appointment Management**
  - List of appointments
  - Status update (confirm, reject, complete)
  - Appointment details view

- **Profile Management**
  - Personal information
  - Professional details (specialty, education, experience)
  - Bio and consultation fee

### API Endpoints
- `GET /api/doctors/appointments` - Get all appointments
- `GET /api/doctors/appointments/:id` - Get appointment by ID
- `PATCH /api/doctors/appointments/:id/status` - Update appointment status
- `GET /api/doctors/schedule` - Get schedule
- `PUT /api/doctors/schedule` - Update schedule
- `GET /api/doctors/profile` - Get profile
- `PATCH /api/doctors/profile` - Update profile

## Phase 4: Admin Functionality

### Features
- Authentication (login/logout)
- Dashboard with system statistics
- Doctor management (add, update, remove)
- User management (view, update, deactivate/reactivate)

### Pages & Components
- **Admin Dashboard**
  - System statistics (users, doctors, appointments)
  - Charts for data visualization
  - Quick actions

- **Doctor Management**
  - List of all doctors
  - Doctor details view
  - Add new doctor form
  - Update doctor information
  - Remove doctor functionality

- **User Management**
  - List of all users
  - User details view
  - Update user information
  - Deactivate/reactivate users

### API Endpoints
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/doctors` - Get all doctors
- `GET /api/admin/doctors/:id` - Get doctor by ID
- `POST /api/admin/doctors` - Create new doctor
- `PATCH /api/admin/doctors/:id` - Update doctor
- `DELETE /api/admin/doctors/:id` - Remove doctor
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user by ID
- `PATCH /api/admin/users/:id` - Update user
- `PATCH /api/admin/users/:id/deactivate` - Deactivate user
- `PATCH /api/admin/users/:id/reactivate` - Reactivate user

## State Management (Zustand)

### Stores
- **Auth Store**
  - User authentication state
  - JWT tokens
  - User role and profile information

- **Doctor Store**
  - Search results
  - Selected doctor details
  - Schedule information

- **Appointment Store**
  - Patient appointments
  - Doctor appointments
  - Appointment details

- **Admin Store**
  - Dashboard statistics
  - Doctors list
  - Users list

## UI/UX Design Principles

### Visual Design
- Light mode only
- White background (#FFFFFF)
- Primary color: #00A3A3 (used for buttons, links, highlights)
- Clean typography with appropriate spacing
- Minimal use of animations for enhanced user experience

### Responsive Design
- Mobile-first approach
- Fully responsive layout for all screen sizes
- Touch-friendly interface elements
- Optimized forms for mobile input

### Components
- Consistent header with role-based navigation
- Clean form components with validation
- Informative cards for displaying data
- Intuitive navigation between sections
- Accessible error and success notifications

## Error Handling & Notifications

### Error Display
- Clean notification component for errors
- Contextual error messages
- Form validation feedback
- API error handling with user-friendly messages

### Success Feedback
- Confirmation messages for actions
- Visual feedback for successful operations
- Redirects after successful actions where appropriate

## Security Considerations

### Authentication
- JWT token storage in HTTP-only cookies
- Automatic token refresh
- Protected routes based on user role
- Secure logout functionality

### Data Protection
- Input validation on frontend
- Sanitization of user inputs
- Secure handling of sensitive information
- Role-based access control

## Testing Strategy

### Component Testing
- Unit tests for reusable components
- Integration tests for complex UI interactions
- Snapshot tests for UI consistency

### End-to-End Testing
- User flow testing for each role
- Authentication flow validation
- Critical path scenario testing

## Deployment Considerations

### Build Process
- Optimized production build with Vite
- Environment-specific configuration
- Asset optimization and minification

### Hosting
- Static file serving
- API proxy configuration if needed
- HTTPS support

## Future Enhancements

### Potential Features
- Appointment reminders via email/SMS
- Doctor rating and review system
- Advanced search filters
- Calendar integration
- Telemedicine functionality
- Multi-language support

This plan provides a comprehensive roadmap for implementing the Tabibi frontend. We'll begin with Phase 1 (Visitor functionality) and progress sequentially through each phase, ensuring a solid foundation before adding complexity.
