import { AppointmentUtils } from "./appointment.utils";
import { ScheduleDayConfig, AvailableSlot } from "../types/schedule.types";
import { Logger } from "./logger.utils";

export class ScheduleUtils {
   static parseScheduleDay(scheduleJson?: string): ScheduleDayConfig | null {
      // FIXED: Handle empty string and empty JSON object
      if (!scheduleJson || scheduleJson.trim() === '' || scheduleJson.trim() === '{}') {
         return { isWorkingDay: false };
      }

      try {
         const parsed = JSON.parse(scheduleJson);

         if (typeof parsed !== "object" || parsed === null) {
            Logger.warn("Schedule JSON is not an object", { scheduleJson });
            return { isWorkingDay: false };
         }

         // FIXED: Handle empty object case
         if (Object.keys(parsed).length === 0) {
            return { isWorkingDay: false };
         }

         const config: ScheduleDayConfig = {
            isWorkingDay: Boolean(parsed.isWorkingDay),
            startTime: parsed.startTime || undefined,
            endTime: parsed.endTime || undefined,
            breaks: parsed.breaks || undefined,
         };

         if (!config.isWorkingDay) {
            return config;
         }

         if (config.startTime && !this.isValidTimeFormat(config.startTime)) {
            Logger.warn("Invalid start time format in schedule", { 
               startTime: config.startTime, 
               scheduleJson 
            });
            return { isWorkingDay: false };
         }

         if (config.endTime && !this.isValidTimeFormat(config.endTime)) {
            Logger.warn("Invalid end time format in schedule", { 
               endTime: config.endTime, 
               scheduleJson 
            });
            return { isWorkingDay: false };
         }

         if (!config.startTime || !config.endTime) {
            Logger.warn("Missing start or end time for working day", { scheduleJson });
            return { isWorkingDay: false };
         }

         if (config.startTime >= config.endTime) {
            Logger.warn("Start time must be before end time", { 
               startTime: config.startTime, 
               endTime: config.endTime 
            });
            return { isWorkingDay: false };
         }

         if (config.breaks && Array.isArray(config.breaks)) {
            for (const breakTime of config.breaks) {
               if (!breakTime || typeof breakTime !== "object") {
                  Logger.warn("Invalid break time format", { breakTime });
                  return { isWorkingDay: false };
               }

               if (
                  !this.isValidTimeFormat(breakTime.start) ||
                  !this.isValidTimeFormat(breakTime.end)
               ) {
                  Logger.warn("Invalid break time format", { breakTime });
                  return { isWorkingDay: false };
               }

               if (breakTime.start >= breakTime.end) {
                  Logger.warn("Break start time must be before end time", { breakTime });
                  return { isWorkingDay: false };
               }
            }
         }

         return config;
      } catch (error) {
         Logger.error("Failed to parse schedule JSON", { 
            error: error instanceof Error ? error.message : String(error),
            scheduleJson 
         });
         return { isWorkingDay: false };
      }
   }

   static stringifyScheduleDay(schedule: ScheduleDayConfig): string {
      try {
         return JSON.stringify(schedule);
      } catch (error) {
         Logger.error("Failed to stringify schedule", { error });
         return JSON.stringify({ isWorkingDay: false });
      }
   }

   static generateAvailableSlots(
      schedule: ScheduleDayConfig,
      _date: Date,
      timeSlotDuration: number = 30,
      bookedSlots: string[] = []
   ): AvailableSlot[] {
      const slots: AvailableSlot[] = [];

      if (!schedule.isWorkingDay || !schedule.startTime || !schedule.endTime) {
         return slots;
      }

      const allSlots = AppointmentUtils.generateTimeSlots(
         schedule.startTime,
         schedule.endTime,
         timeSlotDuration
      );

      for (const slot of allSlots) {
         const [slotStart, slotEnd] = slot.split("-");
         let isBreak = false;

         if (schedule.breaks) {
            for (const breakTime of schedule.breaks) {
               if (
                  AppointmentUtils.isTimeSlotOverlapping(
                     slot,
                     `${breakTime.start}-${breakTime.end}`
                  )
               ) {
                  isBreak = true;
                  break;
               }
            }
         }

         const isBooked = bookedSlots.includes(slot);

         slots.push({
            time: slotStart,
            endTime: slotEnd,
            isAvailable: !isBreak && !isBooked,
            isBreak,
         });
      }

      return slots;
   }

   static isDoctorAvailable(
      schedule: ScheduleDayConfig,
      _date: Date,
      timeSlot: string
   ): boolean {
      if (!schedule.isWorkingDay || !schedule.startTime || !schedule.endTime) {
         return false;
      }

      const [slotStart, slotEnd] = timeSlot.split("-");

      if (slotStart < schedule.startTime || slotEnd > schedule.endTime) {
         return false;
      }

      if (schedule.breaks) {
         for (const breakTime of schedule.breaks) {
            const breakSlot = `${breakTime.start}-${breakTime.end}`;
            if (AppointmentUtils.isTimeSlotOverlapping(timeSlot, breakSlot)) {
               return false;
            }
         }
      }

      return true;
   }

   static getDaySchedule(
      _dayOfWeek: number,
      scheduleJson?: string
   ): ScheduleDayConfig {
      return this.parseScheduleDay(scheduleJson) || { isWorkingDay: false };
   }

   static getWeekdayName(dayOfWeek: number): string {
      const weekdays = [
         "sunday",
         "monday",
         "tuesday",
         "wednesday",
         "thursday",
         "friday",
         "saturday",
      ];
      return weekdays[dayOfWeek] || "";
   }

   static isValidTimeFormat(time: string): boolean {
      return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
   }
}
