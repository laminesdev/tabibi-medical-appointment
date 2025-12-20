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