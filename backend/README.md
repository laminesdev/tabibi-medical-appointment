# Tabibi Medical Appointment System - Backend API

## Overview

Tabibi is a web-based medical appointment management system designed to simplify and digitize the appointment scheduling process between doctors and patients. This backend API provides a secure and efficient way to handle doctor-patient interactions through a RESTful API.

## Features

- **User Authentication**: Secure JWT-based authentication with role-based access control
- **Appointment Management**: Book, view, cancel, and reschedule appointments
- **Doctor Management**: Search doctors by specialty/location, view profiles and schedules
- **Schedule Management**: Doctors can set working hours and breaks
- **Admin Dashboard**: System statistics and user/doctor management
- **Security**: Input sanitization, rate limiting, and data validation

## Tech Stack

- **Node.js** with **Express.js**
- **PostgreSQL** with **Prisma ORM**
- **JWT** for authentication
- **Bcrypt** for password hashing
- **TypeScript** for type safety

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables (see .env.example)
cp .env.example .env

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# JWT Secrets (minimum 32 characters)
JWT_SECRET="your-super-secret-jwt-key-here-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here-min-32-chars"

# CORS
CORS_ORIGIN="http://localhost:3000"

# Optional (for production)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password
SMTP_FROM="Tabibi System <noreply@example.com>"
REDIS_URL=redis://localhost:6379
FRONTEND_URL="http://localhost:3000"
```

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "gender": "MALE",
  "role": "PATIENT" // or "DOCTOR" or "ADMIN"
  
  // For doctors only:
  "specialty": "Cardiology",
  "location": "New York"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "gender": "MALE",
      "role": "PATIENT",
      "isVerified": false,
      "isActive": true
    },
    "profile": {
      // Role-specific profile data
    }
  }
}
```

#### Login User
```http
POST /api/auth/login
```

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
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "gender": "MALE",
      "role": "PATIENT",
      "isVerified": false,
      "isActive": true
    },
    "profile": {
      // Role-specific profile data
    },
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

#### Refresh Token
```http
POST /api/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "your-refresh-token"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new-jwt-access-token"
  }
}
```

### Public Search

#### Search Doctors
```http
GET /api/search/doctors?specialty=Cardiology&location=New York&page=1&limit=10
```

**Query Parameters:**
- `specialty` (optional): Filter by specialty
- `location` (optional): Filter by location
- `search` (optional): General search term
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "status": "success",
  "message": "Doctors retrieved successfully",
  "data": {
    "doctors": [
      {
        "id": "doctor-id",
        "userId": "user-id",
        "specialty": "Cardiology",
        "location": "New York",
        "bio": "Experienced cardiologist",
        "consultationFee": 150.00,
        "experienceYears": 10,
        "rating": 4.8,
        "totalReviews": 120,
        "user": {
          "firstName": "Dr. Jane",
          "lastName": "Smith",
          "email": "drsmith@example.com"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25
    }
  }
}
```

#### Get Doctor by ID
```http
GET /api/search/doctors/:id
```

**Response:**
```json
{
  "status": "success",
  "message": "Doctor retrieved successfully",
  "data": {
    "id": "doctor-id",
    "userId": "user-id",
    "specialty": "Cardiology",
    "location": "New York",
    "bio": "Experienced cardiologist",
    "consultationFee": 150.00,
    "experienceYears": 10,
    "rating": 4.8,
    "totalReviews": 120,
    "user": {
      "firstName": "Dr. Jane",
      "lastName": "Smith",
      "email": "drsmith@example.com"
    }
  }
}
```

### Patient Endpoints

All patient endpoints require authentication with `PATIENT` role.

#### Book Appointment
```http
POST /api/patients/appointments
Authorization: Bearer your-access-token
```

**Request Body:**
```json
{
  "doctorId": "doctor-id",
  "date": "2025-12-30",
  "timeSlot": "10:00-10:30",
  "reason": "Regular checkup"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Appointment booked successfully",
  "data": {
    "id": "appointment-id",
    "patientId": "patient-id",
    "doctorId": "doctor-id",
    "date": "2025-12-30T00:00:00.000Z",
    "timeSlot": "10:00-10:30",
    "status": "PENDING",
    "reason": "Regular checkup",
    "createdAt": "2025-12-24T10:00:00.000Z",
    "updatedAt": "2025-12-24T10:00:00.000Z"
  }
}
```

#### Get All Appointments
```http
GET /api/patients/appointments?status=PENDING&dateFrom=2025-12-01&dateTo=2025-12-31&page=1&limit=10
Authorization: Bearer your-access-token
```

**Query Parameters:**
- `status` (optional): Filter by status (PENDING, CONFIRMED, CANCELLED, etc.)
- `dateFrom` (optional): Filter from date
- `dateTo` (optional): Filter to date
- `page` (optional): Page number
- `limit` (optional): Items per page

#### Get Appointment by ID
```http
GET /api/patients/appointments/:id
Authorization: Bearer your-access-token
```

#### Cancel Appointment
```http
PATCH /api/patients/appointments/:id/cancel
Authorization: Bearer your-access-token
```

#### Reschedule Appointment
```http
PATCH /api/patients/appointments/:id/reschedule
Authorization: Bearer your-access-token
```

**Request Body:**
```json
{
  "date": "2025-12-31",
  "timeSlot": "11:00-11:30"
}
```

### Doctor Endpoints

All doctor endpoints require authentication with `DOCTOR` role.

#### Get All Appointments
```http
GET /api/doctors/appointments?status=CONFIRMED&page=1&limit=10
Authorization: Bearer your-access-token
```

#### Get Appointment by ID
```http
GET /api/doctors/appointments/:id
Authorization: Bearer your-access-token
```

#### Update Appointment Status
```http
PATCH /api/doctors/appointments/:id/status
Authorization: Bearer your-access-token
```

**Request Body:**
```json
{
  "status": "CONFIRMED" // or "COMPLETED", "REJECTED", etc.
}
```

#### Get Schedule
```http
GET /api/doctors/schedule
Authorization: Bearer your-access-token
```

#### Update Schedule
```http
PUT /api/doctors/schedule
Authorization: Bearer your-access-token
```

**Request Body:**
```json
{
  "monday": "{\"isWorkingDay\":true,\"startTime\":\"09:00\",\"endTime\":\"17:00\",\"breaks\":[{\"start\":\"12:00\",\"end\":\"13:00\"}]}",
  "timeSlotDuration": 30
}
```

#### Get Profile
```http
GET /api/doctors/profile
Authorization: Bearer your-access-token
```

#### Update Profile
```http
PATCH /api/doctors/profile
Authorization: Bearer your-access-token
```

### Admin Endpoints

All admin endpoints require authentication with `ADMIN` role.

#### Get Dashboard Statistics
```http
GET /api/admin/dashboard
Authorization: Bearer your-access-token
```

#### Get All Doctors
```http
GET /api/admin/doctors?specialty=Cardiology&location=New York&page=1&limit=10
Authorization: Bearer your-access-token
```

#### Get Doctor by ID
```http
GET /api/admin/doctors/:id
Authorization: Bearer your-access-token
```

#### Add Doctor
```http
POST /api/admin/doctors
Authorization: Bearer your-access-token
```

#### Update Doctor
```http
PATCH /api/admin/doctors/:id
Authorization: Bearer your-access-token
```

#### Remove Doctor
```http
DELETE /api/admin/doctors/:id
Authorization: Bearer your-access-token
```

#### Get All Users
```http
GET /api/admin/users?role=PATIENT&isActive=true&page=1&limit=10
Authorization: Bearer your-access-token
```

#### Get User by ID
```http
GET /api/admin/users/:id
Authorization: Bearer your-access-token
```

#### Update User
```http
PATCH /api/admin/users/:id
Authorization: Bearer your-access-token
```

#### Deactivate User
```http
PATCH /api/admin/users/:id/deactivate
Authorization: Bearer your-access-token
```

#### Reactivate User
```http
PATCH /api/admin/users/:id/reactivate
Authorization: Bearer your-access-token
```

## Authentication for Frontend Developers

### Setting Up Authentication

1. **Login and Store Tokens:**
```javascript
// Example login function
async function login(email, password) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      // Store tokens in localStorage or secure storage
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      return data;
    }
  } catch (error) {
    console.error('Login error:', error);
  }
}
```

2. **Attach Token to Requests:**
```javascript
// Function to get access token
function getAccessToken() {
  return localStorage.getItem('accessToken');
}

// Function to make authenticated requests
async function apiRequest(endpoint, options = {}) {
  const token = getAccessToken();
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  };
  
  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  return fetch(`/api${endpoint}`, config);
}
```

3. **Handle Token Refresh:**
```javascript
// Function to refresh token
async function refreshToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    // Redirect to login
    window.location.href = '/login';
    return;
  }
  
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      localStorage.setItem('accessToken', data.data.accessToken);
      return data.data.accessToken;
    } else {
      // Redirect to login
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    window.location.href = '/login';
  }
}
```

4. **Intercept 401 Errors and Refresh:**
```javascript
// Enhanced API request with token refresh
async function apiRequest(endpoint, options = {}) {
  const token = getAccessToken();
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  };
  
  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  let response = await fetch(`/api${endpoint}`, config);
  
  // If unauthorized, try to refresh token
  if (response.status === 401) {
    const newToken = await refreshToken();
    if (newToken) {
      // Retry request with new token
      config.headers.Authorization = `Bearer ${newToken}`;
      response = await fetch(`/api${endpoint}`, config);
    }
  }
  
  return response;
}
```

## Error Handling

The API returns consistent error responses:

**Validation Error:**
```json
{
  "status": "error",
  "message": "Validation error",
  "errors": [
    {
      "message": "Email is required"
    }
  ]
}
```

**Authentication Error:**
```json
{
  "status": "error",
  "message": "Invalid credentials"
}
```

**Authorization Error:**
```json
{
  "status": "error",
  "message": "You do not have permission to access this resource"
}
```

**Database Error:**
```json
{
  "status": "error",
  "message": "A record with this value already exists"
}
```

## Data Models

### User
```prisma
model User {
  id           String     @id @default(cuid())
  email        String     @unique
  password     String
  firstName    String
  lastName     String
  phone        String
  gender       Gender
  dateOfBirth  DateTime?
  role         Role       @default(PATIENT)
  isVerified   Boolean    @default(false)
  isActive     Boolean    @default(true)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}
```

### Patient
```prisma
model Patient {
  id            String     @id @default(cuid())
  userId        String     @unique
  medicalHistory String?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}
```

### Doctor
```prisma
model Doctor {
  id              String     @id @default(cuid())
  userId          String     @unique
  specialty       String
  location        String
  bio             String?
  consultationFee Float?
  experienceYears Int?
  education       String?
  rating          Float?     @default(0)
  totalReviews    Int?       @default(0)
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
}
```

### Appointment
```prisma
model Appointment {
  id        String           @id @default(cuid())
  patientId String
  doctorId  String
  date      DateTime
  timeSlot  String           // e.g., "10:00-10:30"
  status    AppointmentStatus @default(PENDING)
  reason    String?
  notes     String?
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt
}
```

### Enums
```prisma
enum Role {
  PATIENT
  DOCTOR
  ADMIN
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
  RESCHEDULED
  REJECTED
}

enum Gender {
  MALE
  FEMALE
}
```

## Development

### Running Tests

```bash
# Run tests (if available)
npm test
```

### Building for Production

```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

### Database Management

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## Contact

For questions or support, please contact the development team.
