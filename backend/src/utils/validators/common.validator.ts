import { z } from "zod";
import { AppointmentStatus, Role } from "@prisma/client";

export const idParamSchema = z.object({
  id: z.string().cuid("Invalid ID format"),
});

export const doctorAppointmentQuerySchema = z.object({
  status: z.nativeEnum(AppointmentStatus).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const adminDoctorQuerySchema = z.object({
  search: z.string().optional(),
  specialty: z.string().optional(),
  location: z.string().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const adminUserQuerySchema = z.object({
  search: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
  isActive: z.coerce.boolean().optional(),
  isVerified: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const adminDashboardQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
