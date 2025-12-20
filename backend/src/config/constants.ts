// Application constants
export const APP_CONSTANTS = {
   // JWT Configuration
   JWT: {
      ACCESS_TOKEN_EXPIRY: "15m",
      REFRESH_TOKEN_EXPIRY: "7d",
   },

   // Pagination
   PAGINATION: {
      DEFAULT_PAGE: 1,
      DEFAULT_LIMIT: 10,
      MAX_LIMIT: 100,
   },

   // User roles
   ROLES: {
      PATIENT: "PATIENT",
      DOCTOR: "DOCTOR",
      ADMIN: "ADMIN",
   },

   // Appointment statuses
   APPOINTMENT_STATUS: {
      PENDING: "PENDING",
      CONFIRMED: "CONFIRMED",
      CANCELLED: "CANCELLED",
      COMPLETED: "COMPLETED",
      RESCHEDULED: "RESCHEDULED",
      REJECTED: "REJECTED",
   },

   // Gender options
   GENDER: {
      MALE: "MALE",
      FEMALE: "FEMALE",
   },

   // Time formats
   TIME_FORMATS: {
      TIME_SLOT: "HH:mm-HH:mm",
      TIME_ONLY: "HH:mm",
      DATE_ONLY: "yyyy-MM-dd",
      DATETIME: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
   },

   // Validation
   VALIDATION: {
      PASSWORD_MIN_LENGTH: 8,
      NAME_MIN_LENGTH: 2,
      BIO_MAX_LENGTH: 500,
   },

   // Cache TTLs (in seconds)
   CACHE_TTL: {
      DOCTOR_AVAILABILITY: 300, // 5 minutes
      DOCTOR_LIST: 600, // 10 minutes
      DASHBOARD_STATS: 300, // 5 minutes
   },
} as const;

// Error messages
export const ERROR_MESSAGES = {
   // Auth errors
   INVALID_CREDENTIALS: "Invalid email or password",
   UNAUTHORIZED: "Unauthorized access",
   FORBIDDEN: "You do not have permission to perform this action",
   TOKEN_EXPIRED: "Token has expired",
   INVALID_TOKEN: "Invalid token",
   EMAIL_ALREADY_EXISTS: "Email already exists",
   PHONE_ALREADY_EXISTS: "Phone number already exists",

   // User errors
   USER_NOT_FOUND: "User not found",
   USER_INACTIVE: "User account is inactive",
   USER_NOT_VERIFIED: "User account is not verified",

   // Doctor errors
   DOCTOR_NOT_FOUND: "Doctor not found",
   DOCTOR_ALREADY_EXISTS: "Doctor profile already exists",
   DOCTOR_UNAVAILABLE: "Doctor is not available at this time",

   // Appointment errors
   APPOINTMENT_NOT_FOUND: "Appointment not found",
   APPOINTMENT_CONFLICT: "Time slot is already booked",
   APPOINTMENT_CANNOT_CANCEL: "Appointment cannot be cancelled",
   APPOINTMENT_CANNOT_RESCHEDULE: "Appointment cannot be rescheduled",

   // Schedule errors
   SCHEDULE_NOT_FOUND: "Schedule not found",
   INVALID_SCHEDULE: "Invalid schedule format",

   // Validation errors
   VALIDATION_FAILED: "Validation failed",
   INVALID_DATE: "Invalid date format",
   INVALID_TIME_SLOT: "Invalid time slot format",
   DATE_IN_PAST: "Date cannot be in the past",

   // System errors
   INTERNAL_SERVER_ERROR: "Internal server error",
   DATABASE_ERROR: "Database error",
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
   // Auth
   LOGIN_SUCCESS: "Login successful",
   REGISTER_SUCCESS: "Registration successful",
   LOGOUT_SUCCESS: "Logout successful",
   PASSWORD_RESET_SUCCESS: "Password reset successful",
   EMAIL_VERIFIED: "Email verified successfully",

   // User
   USER_UPDATED: "User updated successfully",
   PASSWORD_CHANGED: "Password changed successfully",

   // Doctor
   DOCTOR_CREATED: "Doctor created successfully",
   DOCTOR_UPDATED: "Doctor updated successfully",
   DOCTOR_DELETED: "Doctor deleted successfully",

   // Appointment
   APPOINTMENT_CREATED: "Appointment created successfully",
   APPOINTMENT_UPDATED: "Appointment updated successfully",
   APPOINTMENT_CANCELLED: "Appointment cancelled successfully",
   APPOINTMENT_RESCHEDULED: "Appointment rescheduled successfully",

   // Schedule
   SCHEDULE_UPDATED: "Schedule updated successfully",

   // General
   RECORD_CREATED: "Record created successfully",
   RECORD_UPDATED: "Record updated successfully",
   RECORD_DELETED: "Record deleted successfully",
   OPERATION_SUCCESSFUL: "Operation completed successfully",
} as const;
