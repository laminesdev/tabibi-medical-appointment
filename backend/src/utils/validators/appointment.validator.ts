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
