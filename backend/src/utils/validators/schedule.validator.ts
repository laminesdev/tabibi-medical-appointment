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
