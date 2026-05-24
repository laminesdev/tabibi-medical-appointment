import { z } from 'zod';
import { Gender } from '@prisma/client';

export const searchDoctorsSchema = z.object({
  specialty: z.string().min(2, 'Specialty must be at least 2 characters').optional(),
  location: z.string().min(2, 'Location must be at least 2 characters').optional(),
  search: z.string().min(2, 'Search must be at least 2 characters').optional(),
  date: z.string().transform((val) => new Date(val)).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  maxFee: z.coerce.number().positive().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10)
}).refine(
  (data) => !!data.specialty || !!data.location || !!data.search,
  { message: "At least one search parameter (specialty, location, or search) is required", path: ["specialty"] }
);

export const updateDoctorSchema = z.object({
  specialty: z.string().min(2, 'Specialty must be at least 2 characters').optional(),
  location: z.string().min(2, 'Location must be at least 2 characters').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  consultationFee: z.coerce.number().positive().optional(),
  experienceYears: z.coerce.number().int().positive().optional(),
  education: z.string().optional()
});

export const doctorSlotsQuerySchema = z.object({
  date: z.string().min(1, "Date is required"),
});

export const adminCreateDoctorSchema = z.object({
   email: z.string().email("Invalid email address"),
   password: z.string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
   firstName: z.string().min(2, "First name must be at least 2 characters"),
   lastName: z.string().min(2, "Last name must be at least 2 characters"),
   phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
    gender: z.nativeEnum(Gender),
   dateOfBirth: z.string().optional().transform(val => val ? new Date(val) : undefined),
   specialty: z.string().min(2, "Specialty must be at least 2 characters"),
   location: z.string().min(2, "Location must be at least 2 characters"),
   bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
   consultationFee: z.coerce.number().positive().optional(),
   experienceYears: z.coerce.number().int().positive().optional(),
   education: z.string().optional(),
});

