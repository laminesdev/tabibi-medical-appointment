import { z } from "zod";

// Helper to get start of today in UTC (consistent timezone)
const getStartOfTodayUTC = () => {
   const now = new Date();
   return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

// Helper to validate time format and range
const isValidTimeSlot = (timeSlot: string): boolean => {
   const [start, end] = timeSlot.split('-');
   
   if (!start || !end) return false;
   
   const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
   if (!timeRegex.test(start) || !timeRegex.test(end)) return false;
   
   const [startHour, startMin] = start.split(':').map(Number);
   const [endHour, endMin] = end.split(':').map(Number);
   
   if (startHour > 23 || startMin > 59 || endHour > 23 || endMin > 59) {
      return false;
   }
   
   // FIXED: Allow minimum 15-minute appointments
   const startTotal = startHour * 60 + startMin;
   const endTotal = endHour * 60 + endMin;
   const duration = endTotal - startTotal;
   
   return duration >= 15 && startTotal < endTotal;
};

export const createAppointmentSchema = z.object({
   doctorId: z.string().min(1, "Doctor ID is required"),
   date: z
      .string()
      .transform((val) => {
         // Create date in UTC to avoid timezone issues
         const date = new Date(val);
         return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      })
      .refine((date) => {
         const today = getStartOfTodayUTC();
         return date >= today;
      }, {
         message: "Date must be today or in the future"
      })
      .refine((date) => {
         const maxDate = new Date();
         maxDate.setUTCDate(maxDate.getUTCDate() + 90);
         maxDate.setUTCHours(0, 0, 0, 0);
         return date <= maxDate;
      }, "Appointments can only be booked up to 90 days in advance"),
   timeSlot: z
      .string()
      .regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, "Invalid time slot format (HH:mm-HH:mm)")
      .refine(isValidTimeSlot, "Invalid time range: must be at least 15 minutes and start before end"),
   reason: z
      .string()
      .min(5, "Reason must be at least 5 characters")
      .max(500, "Reason must be less than 500 characters")
      .optional(),
});

export const updateAppointmentSchema = z.object({
   date: z
      .string()
      .transform((val) => {
         const date = new Date(val);
         return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      })
      .refine((date) => {
         const today = getStartOfTodayUTC();
         return date >= today;
      }, {
         message: "Date must be in the future"
      })
      .optional(),
   timeSlot: z
      .string()
      .regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, "Invalid time slot format")
      .refine(isValidTimeSlot, "Invalid time range: must be at least 15 minutes and start before end")
      .optional(),
   status: z
      .enum([
         "PENDING",
         "CONFIRMED",
         "CANCELLED",
         "COMPLETED",
         "RESCHEDULED",
         "REJECTED",
      ])
      .optional(),
   reason: z
      .string()
      .min(5, "Reason must be at least 5 characters")
      .max(500, "Reason must be less than 500 characters")
      .optional(),
   notes: z
      .string()
      .max(1000, "Notes must be less than 1000 characters")
      .optional(),
});

export const appointmentQuerySchema = z.object({
   patientId: z.string().optional(),
   doctorId: z.string().optional(),
   status: z
      .enum([
         "PENDING",
         "CONFIRMED",
         "CANCELLED",
         "COMPLETED",
         "RESCHEDULED",
         "REJECTED",
      ])
      .optional(),
   dateFrom: z
      .string()
      .transform((val) => {
         const date = new Date(val);
         return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      })
      .optional(),
   dateTo: z
      .string()
      .transform((val) => {
         const date = new Date(val);
         return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      })
      .optional(),
   page: z.coerce.number().int().positive().default(1),
   limit: z.coerce.number().int().positive().max(100).default(10),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type AppointmentQueryInput = z.infer<typeof appointmentQuerySchema>;
