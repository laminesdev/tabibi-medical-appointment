# Tabibi API Test Suite

This folder contains a comprehensive test suite for the Tabibi Medical Appointment System API. The test suite validates all API endpoints, authentication flows, and edge cases.

## Overview

The test suite covers:

- ✅ Authentication (registration, login, token refresh)
- ✅ Public search functionality
- ✅ Patient operations (book, view, cancel, reschedule appointments)
- ✅ Doctor operations (manage appointments, schedule, profile)
- ✅ Admin operations (dashboard, user/doctor management)
- ✅ Edge cases and error handling
- ✅ Security validation (authorization, authentication)

## Prerequisites

1. Node.js (v16 or higher)
2. The Tabibi backend API running on `http://localhost:5000`

## Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

## Running Tests

```bash
# Run the complete test suite
npm test
```

Or directly with Node:

```bash
node test-api.js
```

## What the Tests Cover

### Authentication Tests
- User registration for all roles (PATIENT, DOCTOR, ADMIN)
- User login with valid credentials
- Token refresh mechanism
- Invalid login scenarios (wrong email, wrong password)
- Invalid registration (missing fields, weak password, invalid email)
- Duplicate email/phone registration

### Public Search Tests
- Search doctors by specialty
- Search doctors by location
- Search doctors with multiple filters
- Get doctor by ID
- Search without parameters (should fail)

### Patient Operations Tests
- Book appointment with valid data
- View all appointments with filters
- View single appointment
- Cancel appointment
- Reschedule appointment
- Book appointment in past (should fail)
- Book already booked slot (should fail)
- Access other patient's appointments (should fail)

### Doctor Operations Tests
- View doctor's appointments
- Update appointment status
- Get doctor's schedule
- Update doctor's schedule
- Get/update doctor profile
- Update other doctor's appointments (should fail)
- Invalid schedule configuration

### Admin Operations Tests
- Get dashboard statistics
- Manage doctors (CRUD)
- Manage users (view, update, activate/deactivate)
- Access admin routes without admin role (should fail)

### Edge Cases & Error Handling
- Invalid JWT token
- Expired token
- Missing authorization header
- Validation errors
- Database constraint violations

## Test Output

The test suite provides color-coded output:
- ✅ Green: Passed tests
- ❌ Red: Failed tests
- 🟨 Yellow: Test suite sections and summary

At the end of the test run, a summary is displayed showing:
- Total tests run
- Number of passed tests
- Number of failed tests
- Success rate percentage

## Customization

You can modify the test configuration in `test-api.js`:

```javascript
// Configuration
const API_BASE_URL = 'http://localhost:5000/api'; // Change if your API runs elsewhere
const TEST_EMAIL_DOMAIN = `test-${Date.now()}.com`; // Unique domain for each test run
```

## Troubleshooting

### Tests failing due to "ECONNREFUSED"
Make sure the Tabibi backend API is running on `http://localhost:5000` before running tests.

### Tests failing due to "EEXIST" or duplicate user errors
This may happen if previous test runs didn't complete cleanly. Restart your database or wait for test emails to expire.

### Tests taking too long
The test suite includes delays between test suites to avoid rate limiting. You can adjust these in the `delay()` function calls.

## Contributing

To add new tests:
1. Add new test functions following the existing patterns
2. Include the new test functions in the `runAllTests()` sequence
3. Update the documentation in this README

