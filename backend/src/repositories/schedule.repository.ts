import { Schedule } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export interface ScheduleDayConfig {
   start: string;
   end: string;
   breaks?: Array<{ start: string; end: string }>;
   isWorkingDay: boolean;
}

export interface CreateScheduleData {
   doctorId: string;
   monday?: string;
   tuesday?: string;
   wednesday?: string;
   thursday?: string;
   friday?: string;
   saturday?: string;
   sunday?: string;
   timeSlotDuration: number;
}

export interface UpdateScheduleData {
   monday?: string | ScheduleDayConfig;
   tuesday?: string | ScheduleDayConfig;
   wednesday?: string | ScheduleDayConfig;
   thursday?: string | ScheduleDayConfig;
   friday?: string | ScheduleDayConfig;
   saturday?: string | ScheduleDayConfig;
   sunday?: string | ScheduleDayConfig;
   timeSlotDuration?: number;
}

export interface AvailableSlot {
   time: string;
   endTime: string;
   isAvailable: boolean;
   isBreak?: boolean;
}

export class ScheduleRepository extends BaseRepository {
   async create(data: CreateScheduleData): Promise<Schedule> {
      return this.prisma.schedule.create({
         data: {
            doctorId: data.doctorId,
            monday: data.monday,
            tuesday: data.tuesday,
            wednesday: data.wednesday,
            thursday: data.thursday,
            friday: data.friday,
            saturday: data.saturday,
            sunday: data.sunday,
            timeSlotDuration: data.timeSlotDuration || 30,
         },
      });
   }

   async findByDoctorId(doctorId: string): Promise<Schedule | null> {
      return this.prisma.schedule.findUnique({
         where: { doctorId },
      });
   }

   async update(doctorId: string, data: UpdateScheduleData): Promise<Schedule> {
      const updateData: any = { ...data };

      const days = [
         "monday",
         "tuesday",
         "wednesday",
         "thursday",
         "friday",
         "saturday",
         "sunday",
      ];
      days.forEach((day) => {
         const dayData = (data as any)[day];
         if (dayData && typeof dayData === "object") {
            updateData[day] = JSON.stringify(dayData);
         }
      });

      return this.prisma.schedule.update({
         where: { doctorId },
         data: updateData,
      });
   }

   async delete(doctorId: string): Promise<Schedule> {
      return this.prisma.schedule.delete({
         where: { doctorId },
      });
   }

   async getAvailableSlots(
      doctorId: string,
      date: Date
   ): Promise<AvailableSlot[]> {
      const schedule = await this.findByDoctorId(doctorId);
      if (!schedule) return [];

      const dayOfWeek = date.getDay();
      const daySchedule = this.getDaySchedule(schedule, dayOfWeek);

      if (!daySchedule || !daySchedule.isWorkingDay) {
         return [];
      }

      const slots: AvailableSlot[] = [];
      const timeSlots = this.generateTimeSlots(
         daySchedule.start,
         daySchedule.end,
         schedule.timeSlotDuration
      );

      const breakSlots =
         daySchedule.breaks?.flatMap((breakTime) =>
            this.generateTimeSlots(
               breakTime.start,
               breakTime.end,
               schedule.timeSlotDuration
            )
         ) || [];

      for (const slot of timeSlots) {
         const [startTime] = slot.split("-");
         const isBreak = breakSlots.some((breakSlot) =>
            breakSlot.startsWith(startTime)
         );

         slots.push({
            time: startTime,
            endTime: slot.split("-")[1],
            isAvailable: !isBreak,
            isBreak,
         });
      }

      return slots;
   }

   async isDoctorAvailable(
      doctorId: string,
      date: Date,
      timeSlot: string
   ): Promise<boolean> {
      const schedule = await this.findByDoctorId(doctorId);
      if (!schedule) return false;

      const dayOfWeek = date.getDay();
      const daySchedule = this.getDaySchedule(schedule, dayOfWeek);

      if (!daySchedule || !daySchedule.isWorkingDay) {
         return false;
      }

      const [slotStart] = timeSlot.split("-");

      if (slotStart < daySchedule.start || slotStart >= daySchedule.end) {
         return false;
      }

      if (daySchedule.breaks) {
         for (const breakTime of daySchedule.breaks) {
            if (slotStart >= breakTime.start && slotStart < breakTime.end) {
               return false;
            }
         }
      }

      return true;
   }

   async getWorkingHours(
      doctorId: string,
      dayOfWeek: number
   ): Promise<ScheduleDayConfig | null> {
      const schedule = await this.findByDoctorId(doctorId);
      if (!schedule) return null;

      return this.getDaySchedule(schedule, dayOfWeek);
   }

   parseScheduleDay(scheduleDay?: string | null): ScheduleDayConfig | null {
      if (!scheduleDay) return null;

      try {
         const config = JSON.parse(scheduleDay);
         return {
            start: config.start || "09:00",
            end: config.end || "17:00",
            breaks: config.breaks || [],
            isWorkingDay: config.isWorkingDay !== false,
         };
      } catch (error) {
         if (scheduleDay.includes("-")) {
            const [start, end] = scheduleDay.split("-");
            return {
               start: start.trim(),
               end: end.trim(),
               breaks: [],
               isWorkingDay: true,
            };
         }

         return {
            start: "09:00",
            end: "17:00",
            breaks: [],
            isWorkingDay: scheduleDay.toLowerCase() !== "closed",
         };
      }
   }

   formatScheduleDay(config: ScheduleDayConfig): string {
      return JSON.stringify({
         start: config.start,
         end: config.end,
         breaks: config.breaks || [],
         isWorkingDay: config.isWorkingDay,
      });
   }

   generateTimeSlots(
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

   isValidTimeSlot(timeSlot: string, duration: number): boolean {
      const timeSlotRegex =
         /^([0-1][0-9]|2[0-3]):[0-5][0-9]-([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeSlotRegex.test(timeSlot)) return false;

      const [start, end] = timeSlot.split("-");
      const [startHour, startMinute] = start.split(":").map(Number);
      const [endHour, endMinute] = end.split(":").map(Number);

      const slotDuration =
         endHour * 60 + endMinute - (startHour * 60 + startMinute);
      return slotDuration === duration;
   }

   private getDaySchedule(
      schedule: Schedule,
      dayOfWeek: number
   ): ScheduleDayConfig | null {
      let scheduleDay: string | undefined | null;

      switch (dayOfWeek) {
         case 0:
            scheduleDay = schedule.sunday;
            break;
         case 1:
            scheduleDay = schedule.monday;
            break;
         case 2:
            scheduleDay = schedule.tuesday;
            break;
         case 3:
            scheduleDay = schedule.wednesday;
            break;
         case 4:
            scheduleDay = schedule.thursday;
            break;
         case 5:
            scheduleDay = schedule.friday;
            break;
         case 6:
            scheduleDay = schedule.saturday;
            break;
         default:
            scheduleDay = null;
      }

      if (scheduleDay === null || scheduleDay === undefined) {
         return null;
      }

      return this.parseScheduleDay(scheduleDay);
   }
}
