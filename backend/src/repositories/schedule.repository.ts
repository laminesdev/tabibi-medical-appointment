import { Schedule } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export interface CreateScheduleData {
   doctorId: string;
   monday?: string;
   tuesday?: string;
   wednesday?: string;
   thursday?: string;
   friday?: string;
   saturday?: string;
   sunday?: string;
   timeSlotDuration?: number;
}

export interface UpdateScheduleData {
   monday?: string;
   tuesday?: string;
   wednesday?: string;
   thursday?: string;
   friday?: string;
   saturday?: string;
   sunday?: string;
   timeSlotDuration?: number;
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
      return this.prisma.schedule.update({
         where: { doctorId },
         data,
      });
   }

   async upsert(doctorId: string, data: UpdateScheduleData): Promise<Schedule> {
      return this.prisma.schedule.upsert({
         where: { doctorId },
         update: data,
         create: {
            doctorId,
            ...data,
            timeSlotDuration: data.timeSlotDuration || 30,
         },
      });
   }

   async delete(doctorId: string): Promise<Schedule> {
      return this.prisma.schedule.delete({
         where: { doctorId },
      });
   }
}
