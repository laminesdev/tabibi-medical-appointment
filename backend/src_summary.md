# Project: src

## File: app.ts
```ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error.middleware';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Tabibi API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes will be added here
// app.use('/api/auth', authRoutes);
// app.use('/api/doctors', doctorRoutes);
// app.use('/api/appointments', appointmentRoutes);

// 404 handler - REMOVE THE '*' PARAMETER
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware (MUST BE LAST)
app.use(errorHandler);

export default app;
```

## File: config/constants.ts
```ts

```

## File: config/env.ts
```ts

```

## File: middleware/error.middleware.ts
```ts
import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors/app.error';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    handlePrismaError(err, res);
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      status: 'error',
      message: 'Validation error',
      errors: [{ message: err.message }]
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(err instanceof ValidationError && { errors: (err as ValidationError).errors }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
    return;
  }

  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      status: 'error',
      message: 'Token expired'
    });
    return;
  }

  const statusCode = 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const handlePrismaError = (err: Prisma.PrismaClientKnownRequestError, res: Response) => {
  switch (err.code) {
    case 'P2002':
      res.status(409).json({
        status: 'error',
        message: 'A record with this value already exists',
        field: err.meta?.target
      });
      break;
    case 'P2025':
      res.status(404).json({
        status: 'error',
        message: 'Record not found'
      });
      break;
    case 'P2003':
      res.status(400).json({
        status: 'error',
        message: 'Foreign key constraint failed'
      });
      break;
    default:
      res.status(400).json({
        status: 'error',
        message: 'Database error',
        code: err.code,
        ...(process.env.NODE_ENV === 'development' && { meta: err.meta })
      });
      break;
  }
};

export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

```

## File: middleware/index.ts
```ts
export * from './error.middleware';
export * from './validation.middleware';

```

## File: middleware/validation.middleware.ts
```ts
import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors/app.error';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message
        }));
        next(new ValidationError('Validation failed', errors));
      } else {
        next(error);
      }
    }
  };
};

export const validateBody = (schema: ZodSchema) => {
  return validate(schema);
};

export const validateQuery = (schema: ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message
        }));
        next(new ValidationError('Query validation failed', errors));
      } else {
        next(error);
      }
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message
        }));
        next(new ValidationError('Parameters validation failed', errors));
      } else {
        next(error);
      }
    }
  };
};

```

## File: prisma/client.ts
```ts

```

## File: server.ts
```ts
import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
   console.log(`
  ============================================
  Tabibi Medical Appointment System API
  ============================================
  Status:    Running
  Port:      ${PORT}
  Environment: ${process.env.NODE_ENV}
  Time:      ${new Date().toISOString()}
  ============================================
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
   console.log("SIGTERM signal received: shutting down gracefully...");
   server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
   });
});

process.on("SIGINT", () => {
   console.log("SIGINT signal received: shutting down gracefully...");
   server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
   });
});

export default server;

```

## File: types/appointment.types.ts
```ts
import { AppointmentStatus } from "@prisma/client";

export interface IAppointment {
   id: string;
   patientId: string;
   doctorId: string;
   date: Date;
   timeSlot: string; // Format: "HH:mm-HH:mm"
   status: AppointmentStatus;
   reason?: string;
   notes?: string;
   createdAt: Date;
   updatedAt: Date;
}

export type CreateAppointmentDTO = {
   doctorId: string;
   date: Date;
   timeSlot: string;
   reason?: string;
};

export type UpdateAppointmentDTO = Partial<{
   date: Date;
   timeSlot: string;
   status: AppointmentStatus;
   reason: string;
   notes: string;
}>;

export type AppointmentQueryParams = {
   patientId?: string;
   doctorId?: string;
   status?: AppointmentStatus;
   dateFrom?: Date;
   dateTo?: Date;
   page?: number;
   limit?: number;
};

export type TimeSlot = {
   start: string; // Format: "HH:mm"
   end: string; // Format: "HH:mm"
};

export type AppointmentWithDetails = IAppointment & {
   patient: {
      id: string;
      firstName: string;
      lastName: string;
      phone: string;
   };
   doctor: {
      id: string;
      firstName: string;
      lastName: string;
      specialty: string;
      location: string;
   };
};

```

## File: types/auth.types.ts
```ts
import { Role } from "@prisma/client";

export type LoginDTO = {
   email: string;
   password: string;
};

export type RegisterDTO = {
   email: string;
   password: string;
   firstName: string;
   lastName: string;
   phone: string;
   gender: "MALE" | "FEMALE";
   dateOfBirth?: Date;
   role?: Role;
};

export type AuthResponse = {
   user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
      gender: "MALE" | "FEMALE";
      role: Role;
      isVerified: boolean;
   };
   token: string;
   refreshToken?: string;
};

export type TokenPayload = {
   userId: string;
   email: string;
   role: Role;
};

export type RefreshTokenDTO = {
   refreshToken: string;
};

export type ForgotPasswordDTO = {
   email: string;
};

export type ResetPasswordDTO = {
   token: string;
   newPassword: string;
};

export type VerifyEmailDTO = {
   token: string;
};

```

## File: types/base.types.ts
```ts
export type ApiResponse<T = any> = {
   success: boolean;
   message: string;
   data?: T;
   errors?: any[];
};

export type PaginationParams = {
   page?: number;
   limit?: number;
   sortBy?: string;
   sortOrder?: "asc" | "desc";
};

export type PaginatedResponse<T> = {
   items: T[];
   total: number;
   page: number;
   limit: number;
   totalPages: number;
   hasNext: boolean;
   hasPrevious: boolean;
};

export type QueryParams = Record<string, string | number | boolean | undefined>;

```

## File: types/dashboard.types.ts
```ts
export type DashboardStats = {
   totalUsers: number;
   totalPatients: number;
   totalDoctors: number;
   totalAdmins: number;
   totalAppointments: number;
   upcomingAppointments: number;
   pendingAppointments: number;
   completedAppointments: number;
   cancelledAppointments: number;
   revenue?: number;
   monthlyStats: MonthlyStat[];
};

export type MonthlyStat = {
   month: string;
   appointments: number;
   newPatients: number;
   revenue?: number;
};

export type AdminDashboardQuery = {
   startDate?: Date;
   endDate?: Date;
   groupBy?: "day" | "week" | "month";
};

export type DoctorDashboardStats = {
   totalAppointments: number;
   upcomingAppointments: number;
   completedAppointments: number;
   cancellationRate: number;
   averageRating: number;
   totalRevenue?: number;
   monthlyAppointments: MonthlyStat[];
};

export type PatientDashboardStats = {
   totalAppointments: number;
   upcomingAppointments: number;
   pastAppointments: number;
   favoriteDoctors: Array<{
      doctorId: string;
      doctorName: string;
      appointmentCount: number;
   }>;
};

```

## File: types/doctor.types.ts
```ts
import { IUser } from "./user.types";

// Doctor-specific data (without user info)
export interface IDoctorData {
   id: string;
   userId: string;
   specialty: string;
   location: string;
   bio?: string;
   consultationFee?: number;
   experienceYears?: number;
   education?: string;
   rating?: number;
   totalReviews?: number;
   createdAt: Date;
   updatedAt: Date;
}

// Complete doctor with user info
export interface IDoctorWithUser extends IUser, IDoctorData {}

export interface ISchedule {
   id: string;
   doctorId: string;
   monday?: string; // JSON: { start: "09:00", end: "17:00", breaks: [...] }
   tuesday?: string;
   wednesday?: string;
   thursday?: string;
   friday?: string;
   saturday?: string;
   sunday?: string;
   timeSlotDuration: number;
   createdAt: Date;
   updatedAt: Date;
}

export type ScheduleDay = {
   start: string;
   end: string;
   breaks?: Array<{ start: string; end: string }>;
};

export type UpdateScheduleDTO = Partial<{
   monday?: string | ScheduleDay;
   tuesday?: string | ScheduleDay;
   wednesday?: string | ScheduleDay;
   thursday?: string | ScheduleDay;
   friday?: string | ScheduleDay;
   saturday?: string | ScheduleDay;
   sunday?: string | ScheduleDay;
   timeSlotDuration: number;
}>;

export type SearchDoctorsDTO = {
   specialty?: string;
   location?: string;
   date?: Date;
   page?: number;
   limit?: number;
   minRating?: number;
   maxFee?: number;
};

export type DoctorAvailabilityDTO = {
   doctorId: string;
   date: Date;
};

export type AvailableSlot = {
   timeSlot: string;
   available: boolean;
};

export type DoctorWithSchedule = IDoctorData & {
   schedule?: ISchedule;
};

```

## File: types/error.types.ts
```ts
export class AppError extends Error {
   constructor(
      public message: string,
      public statusCode: number = 500,
      public isOperational: boolean = true
   ) {
      super(message);
      Object.setPrototypeOf(this, AppError.prototype);
   }
}

export class NotFoundError extends AppError {
   constructor(message: string = "Resource not found") {
      super(message, 404);
   }
}

export class BadRequestError extends AppError {
   constructor(message: string = "Bad request") {
      super(message, 400);
   }
}

export class UnauthorizedError extends AppError {
   constructor(message: string = "Unauthorized") {
      super(message, 401);
   }
}

export class ForbiddenError extends AppError {
   constructor(message: string = "Forbidden") {
      super(message, 403);
   }
}

export class ConflictError extends AppError {
   constructor(message: string = "Conflict") {
      super(message, 409);
   }
}

export class ValidationError extends AppError {
   constructor(message: string = "Validation failed", public errors?: any[]) {
      super(message, 422);
   }
}

```

## File: types/express.types.ts
```ts
import { Request } from "express";
import { IUser } from "./user.types";

declare global {
   namespace Express {
      interface Request {
         user?: IUser;
         token?: string;
      }
   }
}

export interface AuthenticatedRequest extends Request {
   user: IUser;
}

export interface AdminRequest extends AuthenticatedRequest {
   user: IUser & { role: "ADMIN" };
}

export interface DoctorRequest extends AuthenticatedRequest {
   user: IUser & { role: "DOCTOR" };
}

export interface PatientRequest extends AuthenticatedRequest {
   user: IUser & { role: "PATIENT" };
}

```

## File: types/index.ts
```ts
// Re-export all types with clear naming
export * from "./base.types";

// User types
export type {
   IUser,
   IPatientData,
   IPatientWithUser,
   IAdminData,
   IAdminWithUser,
   CreateUserDTO,
   UpdateUserDTO,
   CreatePatientDTO,
   CreateDoctorDTO,
   UpdateDoctorDTO,
} from "./user.types";

// Appointment types
export type {
   IAppointment,
   CreateAppointmentDTO,
   UpdateAppointmentDTO,
   AppointmentQueryParams,
   TimeSlot,
   AppointmentWithDetails,
} from "./appointment.types";

// Doctor types
export type {
   IDoctorData,
   IDoctorWithUser,
   ISchedule,
   ScheduleDay,
   UpdateScheduleDTO,
   SearchDoctorsDTO,
   DoctorAvailabilityDTO,
   AvailableSlot,
   DoctorWithSchedule,
} from "./doctor.types";

// Auth types
export type {
   LoginDTO,
   RegisterDTO,
   AuthResponse,
   TokenPayload,
   RefreshTokenDTO,
   ForgotPasswordDTO,
   ResetPasswordDTO,
   VerifyEmailDTO,
} from "./auth.types";

// Error types
export {
   AppError,
   NotFoundError,
   BadRequestError,
   UnauthorizedError,
   ForbiddenError,
   ConflictError,
   ValidationError,
} from "./error.types";

// Express types
export type {
   AuthenticatedRequest,
   AdminRequest,
   DoctorRequest,
   PatientRequest,
} from "./express.types";

// Dashboard types
export type {
   DashboardStats,
   MonthlyStat,
   AdminDashboardQuery,
   DoctorDashboardStats,
   PatientDashboardStats,
} from "./dashboard.types";

```

## File: types/user.types.ts
```ts
import { Role, Gender } from "@prisma/client";

export interface IUser {
   id: string;
   email: string;
   firstName: string;
   lastName: string;
   phone: string;
   gender: Gender;
   dateOfBirth?: Date;
   role: Role;
   isVerified: boolean;
   isActive: boolean;
   createdAt: Date;
   updatedAt: Date;
}

export interface IPatientData {
   id: string;
   userId: string;
   medicalHistory?: string;
   createdAt: Date;
   updatedAt: Date;
}

export interface IPatientWithUser extends IUser, IPatientData {}

export interface IAdminData {
   id: string;
   userId: string;
   createdAt: Date;
   updatedAt: Date;
}

export interface IAdminWithUser extends IUser, IAdminData {}

// DTOs (Data Transfer Objects)
export type CreateUserDTO = {
   email: string;
   password: string;
   firstName: string;
   lastName: string;
   phone: string;
   gender: Gender;
   dateOfBirth?: Date;
   role?: Role;
};

export type UpdateUserDTO = Partial<{
   firstName: string;
   lastName: string;
   phone: string;
   gender: Gender;
   dateOfBirth?: Date;
   isActive: boolean;
}>;

export type CreatePatientDTO = CreateUserDTO & {
   medicalHistory?: string;
};

export type CreateDoctorDTO = CreateUserDTO & {
   specialty: string;
   location: string;
   bio?: string;
   consultationFee?: number;
   experienceYears?: number;
   education?: string;
};

export type UpdateDoctorDTO = Partial<{
   specialty: string;
   location: string;
   bio: string;
   consultationFee: number;
   experienceYears: number;
   education: string;
}>;

```

## File: utils/errors/app.error.ts
```ts
export class AppError extends Error {
   public readonly statusCode: number;
   public readonly isOperational: boolean;

   constructor(message: string, statusCode: number, isOperational = true) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = isOperational;

      Error.captureStackTrace(this, this.constructor);
   }
}

export class BadRequestError extends AppError {
   constructor(message: string = "Bad Request") {
      super(message, 400);
   }
}

export class UnauthorizedError extends AppError {
   constructor(message: string = "Unauthorized") {
      super(message, 401);
   }
}

export class ForbiddenError extends AppError {
   constructor(message: string = "Forbidden") {
      super(message, 403);
   }
}

export class NotFoundError extends AppError {
   constructor(message: string = "Not Found") {
      super(message, 404);
   }
}

export class ConflictError extends AppError {
   constructor(message: string = "Conflict") {
      super(message, 409);
   }
}

export class ValidationError extends AppError {
   constructor(message: string = "Validation Error", public errors?: any[]) {
      super(message, 422);
   }
}

export class InternalServerError extends AppError {
   constructor(message: string = "Internal Server Error") {
      super(message, 500);
   }
}

```

## File: utils/errors/index.ts
```ts
export * from './app.error';
// Add other error files here when created

```

## File: utils/validators/appointment.validator.ts
```ts
import { z } from 'zod';

export const createAppointmentSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  date: z.string().transform((val) => new Date(val)),
  timeSlot: z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, 'Invalid time slot format (HH:mm-HH:mm)'),
  reason: z.string().min(5, 'Reason must be at least 5 characters').optional()
});

export const updateAppointmentSchema = z.object({
  date: z.string().transform((val) => new Date(val)).optional(),
  timeSlot: z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, 'Invalid time slot format').optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'RESCHEDULED', 'REJECTED']).optional(),
  reason: z.string().min(5, 'Reason must be at least 5 characters').optional(),
  notes: z.string().optional()
});

export const appointmentQuerySchema = z.object({
  patientId: z.string().optional(),
  doctorId: z.string().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'RESCHEDULED', 'REJECTED']).optional(),
  dateFrom: z.string().transform((val) => new Date(val)).optional(),
  dateTo: z.string().transform((val) => new Date(val)).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10)
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type AppointmentQueryInput = z.infer<typeof appointmentQuerySchema>;

```

## File: utils/validators/auth.validator.ts
```ts
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  gender: z.enum(['MALE', 'FEMALE']),
  dateOfBirth: z.string().optional().transform(val => val ? new Date(val) : undefined),
  role: z.enum(['PATIENT', 'DOCTOR', 'ADMIN']).optional().default('PATIENT')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

```

## File: utils/validators/doctor.validator.ts
```ts
import { z } from 'zod';

export const searchDoctorsSchema = z.object({
  specialty: z.string().min(2, 'Specialty must be at least 2 characters').optional(),
  location: z.string().min(2, 'Location must be at least 2 characters').optional(),
  date: z.string().transform((val) => new Date(val)).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  maxFee: z.coerce.number().positive().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10)
});

export const doctorAvailabilitySchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  date: z.string().transform((val) => new Date(val))
});

export const createDoctorSchema = z.object({
  specialty: z.string().min(2, 'Specialty must be at least 2 characters'),
  location: z.string().min(2, 'Location must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  consultationFee: z.coerce.number().positive().optional(),
  experienceYears: z.coerce.number().int().positive().optional(),
  education: z.string().optional()
});

export const updateDoctorSchema = z.object({
  specialty: z.string().min(2, 'Specialty must be at least 2 characters').optional(),
  location: z.string().min(2, 'Location must be at least 2 characters').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  consultationFee: z.coerce.number().positive().optional(),
  experienceYears: z.coerce.number().int().positive().optional(),
  education: z.string().optional()
});

export const scheduleSchema = z.object({
  monday: z.string().optional(),
  tuesday: z.string().optional(),
  wednesday: z.string().optional(),
  thursday: z.string().optional(),
  friday: z.string().optional(),
  saturday: z.string().optional(),
  sunday: z.string().optional(),
  timeSlotDuration: z.coerce.number().int().positive().default(30)
});

export type SearchDoctorsInput = z.infer<typeof searchDoctorsSchema>;
export type DoctorAvailabilityInput = z.infer<typeof doctorAvailabilitySchema>;
export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
export type ScheduleInput = z.infer<typeof scheduleSchema>;
```

## File: utils/validators/index.ts
```ts
// Export from auth.validator
export {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type RegisterInput,
  type LoginInput,
  type RefreshTokenInput,
  type ForgotPasswordInput,
  type ResetPasswordInput
} from './auth.validator';

// Export from appointment.validator
export {
  createAppointmentSchema,
  updateAppointmentSchema,
  appointmentQuerySchema,
  type CreateAppointmentInput,
  type UpdateAppointmentInput,
  type AppointmentQueryInput
} from './appointment.validator';

// Export from doctor.validator
export {
  searchDoctorsSchema,
  doctorAvailabilitySchema,
  createDoctorSchema,
  updateDoctorSchema,
  scheduleSchema,
  type SearchDoctorsInput,
  type DoctorAvailabilityInput,
  type CreateDoctorInput,
  type UpdateDoctorInput,
  type ScheduleInput
} from './doctor.validator';

```

## File: utils/validators/schedule.validator.ts
```ts
// Doctor schedule validation
import { z } from "zod";

export const timeRangeSchema = z.object({
   start: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:mm)"),
   end: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:mm)"),
});

export const dayScheduleSchema = z.object({
   isAvailable: z.boolean().default(true),
   timeSlots: z.array(timeRangeSchema).optional(),
   breaks: z.array(timeRangeSchema).optional(),
});

export const updateScheduleSchema = z.object({
   monday: dayScheduleSchema.optional(),
   tuesday: dayScheduleSchema.optional(),
   wednesday: dayScheduleSchema.optional(),
   thursday: dayScheduleSchema.optional(),
   friday: dayScheduleSchema.optional(),
   saturday: dayScheduleSchema.optional(),
   sunday: dayScheduleSchema.optional(),
   timeSlotDuration: z.number().int().min(15).max(120).default(30),
});

```

## File: utils/validators/user.validator.ts
```ts
// User profile updates, password changes, etc.
import { z } from "zod";

export const updateProfileSchema = z.object({
   firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .optional(),
   lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .optional(),
   phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
      .optional(),
   gender: z.enum(["MALE", "FEMALE"]).optional(),
   dateOfBirth: z
      .string()
      .transform((val) => new Date(val))
      .optional(),
});

export const changePasswordSchema = z.object({
   currentPassword: z.string().min(1, "Current password is required"),
   newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

```

