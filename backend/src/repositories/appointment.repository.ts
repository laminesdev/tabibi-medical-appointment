import { Appointment, AppointmentStatus } from "@prisma/client";
import { BaseRepository } from "./base.repository";
import { PaginationParams } from "./user.repository";

export interface CreateAppointmentData {
   patientId: string;
   doctorId: string;
   date: Date;
   timeSlot: string;
   reason?: string;
}

export interface UpdateAppointmentData {
   date?: Date;
   timeSlot?: string;
   status?: AppointmentStatus;
   reason?: string;
   notes?: string;
}

export interface AppointmentQueryParams extends PaginationParams {
   patientId?: string;
   doctorId?: string;
   status?: AppointmentStatus;
   dateFrom?: Date;
   dateTo?: Date;
   date?: Date;
   includePatient?: boolean;
   includeDoctor?: boolean;
}

export interface TimeSlotAvailability {
   doctorId: string;
   date: Date;
   timeSlot: string;
}

export class AppointmentRepository extends BaseRepository {
   async create(data: CreateAppointmentData): Promise<Appointment> {
      return this.prisma.appointment.create({
         data: {
            patientId: data.patientId,
            doctorId: data.doctorId,
            date: data.date,
            timeSlot: data.timeSlot,
            reason: data.reason,
            status: "PENDING",
         },
         include: {
            patient: {
               include: { user: true },
            },
            doctor: {
               include: { user: true },
            },
         },
      });
   }

   async findById(
      id: string,
      includeRelations: boolean = true
   ): Promise<Appointment | null> {
      const include = includeRelations
         ? {
              patient: {
                 include: { user: true },
              },
              doctor: {
                 include: { user: true },
              },
           }
         : undefined;

      return this.prisma.appointment.findUnique({
         where: { id },
         include,
      });
   }

   async update(id: string, data: UpdateAppointmentData): Promise<Appointment> {
      return this.prisma.appointment.update({
         where: { id },
         data,
         include: {
            patient: {
               include: { user: true },
            },
            doctor: {
               include: { user: true },
            },
         },
      });
   }

   async delete(id: string): Promise<Appointment> {
      return this.prisma.appointment.delete({
         where: { id },
      });
   }

   async cancel(id: string, reason?: string): Promise<Appointment> {
      return this.prisma.appointment.update({
         where: { id },
         data: {
            status: "CANCELLED",
            notes: reason ? `Cancelled: ${reason}` : "Cancelled by user",
         },
         include: {
            patient: {
               include: { user: true },
            },
            doctor: {
               include: { user: true },
            },
         },
      });
   }

   async findByPatient(
      patientId: string,
      params?: AppointmentQueryParams
   ): Promise<Appointment[]> {
      const {
         page = 1,
         limit = 10,
         status,
         dateFrom,
         dateTo,
         includeDoctor = true,
      } = params || {};

      const skip = (page - 1) * limit;

      const where: any = { patientId };

      if (status) where.status = status;
      if (dateFrom || dateTo) {
         where.date = {};
         if (dateFrom) where.date.gte = dateFrom;
         if (dateTo) where.date.lte = dateTo;
      }

      const include: any = {
         patient: {
            include: { user: true },
         },
      };

      if (includeDoctor) {
         include.doctor = {
            include: { user: true },
         };
      }

      return this.prisma.appointment.findMany({
         where,
         include,
         skip,
         take: limit,
         orderBy: { date: "desc" },
      });
   }

   async findByDoctor(
      doctorId: string,
      params?: AppointmentQueryParams
   ): Promise<Appointment[]> {
      const {
         page = 1,
         limit = 10,
         status,
         dateFrom,
         dateTo,
         includePatient = true,
      } = params || {};

      const skip = (page - 1) * limit;

      const where: any = { doctorId };

      if (status) where.status = status;
      if (dateFrom || dateTo) {
         where.date = {};
         if (dateFrom) where.date.gte = dateFrom;
         if (dateTo) where.date.lte = dateTo;
      }

      const include: any = {
         doctor: {
            include: { user: true },
         },
      };

      if (includePatient) {
         include.patient = {
            include: { user: true },
         };
      }

      return this.prisma.appointment.findMany({
         where,
         include,
         skip,
         take: limit,
         orderBy: { date: "desc" },
      });
   }

   async findAll(params: AppointmentQueryParams): Promise<Appointment[]> {
      const {
         page = 1,
         limit = 10,
         patientId,
         doctorId,
         status,
         dateFrom,
         dateTo,
         date,
         includePatient = false,
         includeDoctor = false,
      } = params;

      const skip = (page - 1) * limit;

      const where: any = {};

      if (patientId) where.patientId = patientId;
      if (doctorId) where.doctorId = doctorId;
      if (status) where.status = status;

      if (dateFrom || dateTo || date) {
         where.date = {};
         if (dateFrom) where.date.gte = dateFrom;
         if (dateTo) where.date.lte = dateTo;
         if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            where.date.gte = startOfDay;
            where.date.lte = endOfDay;
         }
      }

      const include: any = {};
      if (includePatient) {
         include.patient = {
            include: { user: true },
         };
      }
      if (includeDoctor) {
         include.doctor = {
            include: { user: true },
         };
      }

      return this.prisma.appointment.findMany({
         where,
         include,
         skip,
         take: limit,
         orderBy: { date: "desc" },
      });
   }

   async isTimeSlotAvailable(data: TimeSlotAvailability): Promise<boolean> {
      const { doctorId, date, timeSlot } = data;

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const existingAppointment = await this.prisma.appointment.findFirst({
         where: {
            doctorId,
            date: {
               gte: startOfDay,
               lte: endOfDay,
            },
            timeSlot,
            status: {
               in: ["PENDING", "CONFIRMED"],
            },
         },
      });

      return !existingAppointment;
   }

   async getAvailableTimeSlots(
      doctorId: string,
      date: Date
   ): Promise<string[]> {
      const bookedSlots = await this.getBookedTimeSlots(doctorId, date);
      const allSlots = this.generateTimeSlots("09:00", "17:00", 30);
      return allSlots.filter((slot) => !bookedSlots.includes(slot));
   }

   async getBookedTimeSlots(doctorId: string, date: Date): Promise<string[]> {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const appointments = await this.prisma.appointment.findMany({
         where: {
            doctorId,
            date: {
               gte: startOfDay,
               lte: endOfDay,
            },
            status: {
               in: ["PENDING", "CONFIRMED"],
            },
         },
         select: { timeSlot: true },
      });

      return appointments.map((app) => app.timeSlot);
   }

   async updateStatus(
      id: string,
      status: AppointmentStatus,
      notes?: string
   ): Promise<Appointment> {
      const data: any = { status };
      if (notes) data.notes = notes;

      return this.prisma.appointment.update({
         where: { id },
         data,
         include: {
            patient: {
               include: { user: true },
            },
            doctor: {
               include: { user: true },
            },
         },
      });
   }

   async getAppointmentsByStatus(
      status: AppointmentStatus,
      params?: PaginationParams
   ): Promise<Appointment[]> {
      const { page = 1, limit = 10 } = params || {};
      const skip = (page - 1) * limit;

      return this.prisma.appointment.findMany({
         where: { status },
         include: {
            patient: {
               include: { user: true },
            },
            doctor: {
               include: { user: true },
            },
         },
         skip,
         take: limit,
         orderBy: { date: "asc" },
      });
   }

   async count(params?: Partial<AppointmentQueryParams>): Promise<number> {
      const { patientId, doctorId, status, dateFrom, dateTo } = params || {};

      const where: any = {};

      if (patientId) where.patientId = patientId;
      if (doctorId) where.doctorId = doctorId;
      if (status) where.status = status;

      if (dateFrom || dateTo) {
         where.date = {};
         if (dateFrom) where.date.gte = dateFrom;
         if (dateTo) where.date.lte = dateTo;
      }

      return this.prisma.appointment.count({ where });
   }

   async countByStatus(
      doctorId?: string,
      patientId?: string
   ): Promise<Record<AppointmentStatus, number>> {
      const where: any = {};
      if (doctorId) where.doctorId = doctorId;
      if (patientId) where.patientId = patientId;

      const counts = await this.prisma.appointment.groupBy({
         by: ["status"],
         where,
         _count: true,
      });

      const result: Record<AppointmentStatus, number> = {
         PENDING: 0,
         CONFIRMED: 0,
         CANCELLED: 0,
         COMPLETED: 0,
         RESCHEDULED: 0,
         REJECTED: 0,
      };

      counts.forEach((count) => {
         result[count.status as AppointmentStatus] = count._count;
      });

      return result;
   }

   async getUpcomingAppointments(limit: number = 20): Promise<Appointment[]> {
      return this.prisma.appointment.findMany({
         where: {
            date: {
               gte: new Date(),
            },
            status: {
               in: ["PENDING", "CONFIRMED"],
            },
         },
         include: {
            patient: {
               include: { user: true },
            },
            doctor: {
               include: { user: true },
            },
         },
         orderBy: { date: "asc" },
         take: limit,
      });
   }

   async getTodayAppointments(): Promise<Appointment[]> {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return this.prisma.appointment.findMany({
         where: {
            date: {
               gte: today,
               lt: tomorrow,
            },
            status: {
               in: ["PENDING", "CONFIRMED"],
            },
         },
         include: {
            patient: {
               include: { user: true },
            },
            doctor: {
               include: { user: true },
            },
         },
         orderBy: { date: "asc" },
      });
   }

   async findConflicts(
      doctorId: string,
      date: Date,
      timeSlots: string[]
   ): Promise<Appointment[]> {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      return this.prisma.appointment.findMany({
         where: {
            doctorId,
            date: {
               gte: startOfDay,
               lte: endOfDay,
            },
            timeSlot: {
               in: timeSlots,
            },
            status: {
               in: ["PENDING", "CONFIRMED"],
            },
         },
      });
   }

   private generateTimeSlots(
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
