import { z } from 'zod';
import { Gender, Role } from '@prisma/client';

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
  gender: z.nativeEnum(Gender),
  dateOfBirth: z.string().optional().transform(val => val ? new Date(val) : undefined),
  role: z.nativeEnum(Role).optional().default(Role.PATIENT),
  specialty: z.string().min(2, 'Specialty must be at least 2 characters').optional(),
  location: z.string().min(2, 'Location must be at least 2 characters').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  consultationFee: z.coerce.number().positive().optional(),
  experienceYears: z.coerce.number().int().positive().optional(),
  education: z.string().optional(),
}).refine(
  (data) => data.role !== Role.ADMIN,
  { message: "Admin registration is not allowed", path: ["role"] }
).refine(
  (data) => {
    if (data.role === Role.DOCTOR) {
      return !!data.specialty && !!data.location;
    }
    return true;
  },
  { message: "Specialty and location are required for doctor registration", path: ["specialty"] }
);

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});


