import { z } from "zod";

const timeRegex = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;

const dayScheduleStringSchema = z.string().refine(
   (val) => {
      try {
         const parsed = JSON.parse(val);
         if (!parsed || typeof parsed !== "object") return false;
          if (!parsed.isWorkingDay && parsed.startTime === undefined) {
             return Object.keys(parsed).length === 0 || parsed.isWorkingDay === false;
          }
          const start = parsed.startTime;
          const end = parsed.endTime;
         if (typeof start !== "string" || typeof end !== "string") return false;
         if (!timeRegex.test(start) || !timeRegex.test(end)) return false;
         if (start >= end) return false;
         if (parsed.breaks && Array.isArray(parsed.breaks)) {
            for (const b of parsed.breaks) {
               if (!b || typeof b !== "object") return false;
               if (typeof b.start !== "string" || typeof b.end !== "string") return false;
               if (!timeRegex.test(b.start) || !timeRegex.test(b.end)) return false;
               if (b.start >= b.end) return false;
            }
         }
         return true;
      } catch {
         return false;
      }
   },
   { message: "Invalid JSON format for day schedule" }
);

export const updateScheduleSchema = z.object({
   monday: dayScheduleStringSchema.optional(),
   tuesday: dayScheduleStringSchema.optional(),
   wednesday: dayScheduleStringSchema.optional(),
   thursday: dayScheduleStringSchema.optional(),
   friday: dayScheduleStringSchema.optional(),
   saturday: dayScheduleStringSchema.optional(),
   sunday: dayScheduleStringSchema.optional(),
   timeSlotDuration: z.coerce.number().int().min(15).max(120).default(30),
});


