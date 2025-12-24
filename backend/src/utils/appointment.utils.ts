import { DateTimeUtils } from "./date-time.utils";
import { ScheduleDayConfig } from "../types/schedule.types";

export class AppointmentUtils {
   static validateAppointmentTime(
      doctorSchedule: ScheduleDayConfig | null,
      date: Date,
      timeSlot: string,
      bookedSlots: string[] = [],
      timeSlotDuration?: number
   ): { isValid: boolean; message?: string } {
      // Check if date is in the past
      if (DateTimeUtils.isPast(date)) {
         return {
            isValid: false,
            message: "Cannot book appointments in the past",
         };
      }

      // Check if time slot format is valid
      if (!this.isValidTimeSlotFormat(timeSlot)) {
         return { isValid: false, message: "Invalid time slot format" };
      }

      // Check if time slot duration matches schedule
      if (timeSlotDuration && !this.isValidTimeSlotDuration(timeSlot, timeSlotDuration)) {
         return {
            isValid: false,
            message: `Time slot duration must be ${timeSlotDuration} minutes`
         };
      }

      // Check if doctor is available on this day
      if (doctorSchedule && !doctorSchedule.isWorkingDay) {
         return {
            isValid: false,
            message: "Doctor is not available on this day",
         };
      }

      // Check if time slot is within doctor's working hours
      if (doctorSchedule && doctorSchedule.isWorkingDay) {
         const [slotStart, slotEnd] = timeSlot.split("-");
         const workingStart = doctorSchedule.startTime;
         const workingEnd = doctorSchedule.endTime;

         if (!workingStart || !workingEnd) {
            return {
               isValid: false,
               message: "Doctor schedule not properly configured",
            };
         }

         if (slotStart < workingStart || slotEnd > workingEnd) {
            return {
               isValid: false,
               message: "Time slot is outside doctor's working hours",
            };
         }

         // Check if overlaps with breaks
         if (doctorSchedule.breaks) {
            for (const breakTime of doctorSchedule.breaks) {
               const breakSlot = `${breakTime.start}-${breakTime.end}`;
               if (this.isTimeSlotOverlapping(timeSlot, breakSlot)) {
                  return {
                     isValid: false,
                     message: "Time slot overlaps with doctor's break",
                  };
               }
            }
         }
      }

      // Check if time slot is already booked
      if (bookedSlots.includes(timeSlot)) {
         return { isValid: false, message: "Time slot is already booked" };
      }

      return { isValid: true };
   }

   static calculateAppointmentEndTime(
      startTime: string,
      duration: number
   ): string {
      const [hours, minutes] = startTime.split(":").map(Number);
      const totalMinutes = hours * 60 + minutes + duration;
      const endHours = Math.floor(totalMinutes / 60);
      const endMinutes = totalMinutes % 60;

      return `${endHours.toString().padStart(2, "0")}:${endMinutes
         .toString()
         .padStart(2, "0")}`;
   }

   // Helper method to check time slot format
   static isValidTimeSlotFormat(timeSlot: string): boolean {
      return /^([01]?[0-9]|2[0-3]):[0-5][0-9]-([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(
         timeSlot
      );
   }

   // Helper method to check if time slot matches expected duration
   static isValidTimeSlotDuration(timeSlot: string, durationMinutes: number): boolean {
      const [start, end] = timeSlot.split("-");
      const [startHour, startMin] = start.split(":").map(Number);
      const [endHour, endMin] = end.split(":").map(Number);
      
      const startTotal = startHour * 60 + startMin;
      const endTotal = endHour * 60 + endMin;
      
      return (endTotal - startTotal) === durationMinutes;
   }

   // Helper method to check time slot overlapping
   static isTimeSlotOverlapping(slot1: string, slot2: string): boolean {
      const [start1, end1] = slot1.split("-");
      const [start2, end2] = slot2.split("-");

      // Convert to minutes for comparison
      const toMinutes = (time: string) => {
         const [hours, minutes] = time.split(":").map(Number);
         return hours * 60 + minutes;
      };

      const start1Min = toMinutes(start1);
      const end1Min = toMinutes(end1);
      const start2Min = toMinutes(start2);
      const end2Min = toMinutes(end2);

      return start1Min < end2Min && start2Min < end1Min;
   }

   // New method to generate appointment number/ID
   static generateAppointmentNumber(): string {
      const timestamp = Date.now().toString().slice(-8);
      const random = Math.floor(Math.random() * 1000)
         .toString()
         .padStart(3, "0");
      return `APT-${timestamp}-${random}`;
   }

   // New method to validate appointment can be cancelled/rescheduled
   static canCancelOrReschedule(
      appointmentDate: Date,
      hoursBefore: number = 24
   ): boolean {
      const now = new Date();
      const cutoffTime = new Date(appointmentDate);
      cutoffTime.setHours(cutoffTime.getHours() - hoursBefore);

      return now < cutoffTime;
   }

   // New method to generate time slots
   static generateTimeSlots(
      startTime: string,
      endTime: string,
      duration: number
   ): string[] {
      const slots: string[] = [];
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);

      let currentHour = startHour;
      let currentMinute = startMinute;

      while (
         currentHour < endHour ||
         (currentHour === endHour && currentMinute < endMinute)
      ) {
         const slotStart = `${currentHour
            .toString()
            .padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;

         let endHourCalc = currentHour;
         let endMinuteCalc = currentMinute + duration;

         while (endMinuteCalc >= 60) {
            endHourCalc++;
            endMinuteCalc -= 60;
         }

         const slotEnd = `${endHourCalc
            .toString()
            .padStart(2, "0")}:${endMinuteCalc.toString().padStart(2, "0")}`;

         if (
            endHourCalc > endHour ||
            (endHourCalc === endHour && endMinuteCalc > endMinute)
         ) {
            break;
         }

         slots.push(`${slotStart}-${slotEnd}`);

         currentMinute += duration;
         while (currentMinute >= 60) {
            currentHour++;
            currentMinute -= 60;
         }
      }

      return slots;
   }
}
