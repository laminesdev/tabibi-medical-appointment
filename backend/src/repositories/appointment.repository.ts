import { Appointment, AppointmentStatus, Prisma } from "@prisma/client";
import { BaseRepository } from "./base.repository";
import {
   CreateAppointmentDTO,
   UpdateAppointmentDTO,
} from "../types/appointment.types";
import { ConflictError } from "../utils/errors/app.error";

export class AppointmentRepository extends BaseRepository {
   async create(
      data: CreateAppointmentDTO & { patientId: string }
   ): Promise<Appointment> {
      try {
         return await this.prisma.appointment.create({
            data: {
               patientId: data.patientId,
               doctorId: data.doctorId,
               date: data.date,
               timeSlot: data.timeSlot,
               reason: data.reason,
               status: "PENDING",
            },
         });
      } catch (error) {
         if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
               const meta = error.meta as { target?: string[] };
               if (meta?.target?.includes("doctorId") && 
                   meta?.target?.includes("date") && 
                   meta?.target?.includes("timeSlot")) {
                  throw new ConflictError("Time slot is already booked");
               }
            }
         }
         throw error;
      }
   }

   async findById(id: string): Promise<Appointment | null> {
      return this.prisma.appointment.findUnique({
         where: { id },
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

   async update(id: string, data: UpdateAppointmentDTO): Promise<Appointment> {
      return this.prisma.appointment.update({
         where: { id },
         data,
      });
   }

   async findByTimeSlot(
      doctorId: string,
      date: Date,
      timeSlot: string
   ): Promise<Appointment | null> {
      const { gte, lte } = this.getDateRangeCondition(date);

      return this.prisma.appointment.findFirst({
         where: {
            doctorId,
            date: {
               gte,
               lte,
            },
            timeSlot,
            status: {
               notIn: ["CANCELLED", "REJECTED"],
            },
         },
      });
   }

   async getBookedSlots(doctorId: string, date: Date): Promise<string[]> {
      const { gte, lte } = this.getDateRangeCondition(date);

      const appointments = await this.prisma.appointment.findMany({
         where: {
            doctorId,
            date: {
               gte,
               lte,
            },
            status: {
               notIn: ["CANCELLED", "REJECTED"],
            },
         },
         select: {
            timeSlot: true,
         },
      });

      return appointments.map((app) => app.timeSlot);
   }

   async findAppointmentsByDoctor(
      doctorId: string,
      params?: {
         status?: AppointmentStatus;
         dateFrom?: Date;
         dateTo?: Date;
         page?: number;
         limit?: number;
      }
   ): Promise<Appointment[]> {
      const { status, dateFrom, dateTo, page = 1, limit = 10 } = params || {};
      const { skip, take } = this.getPaginationParams(page, limit);

      const where: Prisma.AppointmentWhereInput = {
         doctorId,
      };

      if (status) {
         where.status = status;
      }

      if (dateFrom || dateTo) {
         where.date = {};
         if (dateFrom) where.date.gte = dateFrom;
         if (dateTo) where.date.lte = dateTo;
      }

      return this.prisma.appointment.findMany({
         where,
         include: {
            patient: {
               include: { user: true },
            },
         },
         skip,
         take,
         orderBy: { date: "asc" },
      });
   }

   async findAppointmentsByPatient(
      patientId: string,
      params?: {
         status?: AppointmentStatus;
         dateFrom?: Date;
         dateTo?: Date;
         page?: number;
         limit?: number;
      }
   ): Promise<Appointment[]> {
      const { status, dateFrom, dateTo, page = 1, limit = 10 } = params || {};
      const { skip, take } = this.getPaginationParams(page, limit);

      const where: Prisma.AppointmentWhereInput = {
         patientId,
      };

      if (status) {
         where.status = status;
      }

      if (dateFrom || dateTo) {
         where.date = {};
         if (dateFrom) where.date.gte = dateFrom;
         if (dateTo) where.date.lte = dateTo;
      }

      return this.prisma.appointment.findMany({
         where,
         include: {
            doctor: {
               include: { user: true },
            },
         },
         skip,
         take,
         orderBy: { date: "asc" },
      });
   }

   async countAppointments(
      where?: Prisma.AppointmentWhereInput
   ): Promise<number> {
      return this.prisma.appointment.count({ where });
   }

   // FIXED: Transactional appointment creation with proper error handling
   async createWithTransaction(
      data: CreateAppointmentDTO & { patientId: string }
   ): Promise<Appointment> {
      try {
         return await this.prisma.$transaction(async (prisma) => {
            return await prisma.appointment.create({
               data: {
                  patientId: data.patientId,
                  doctorId: data.doctorId,
                  date: data.date,
                  timeSlot: data.timeSlot,
                  reason: data.reason,
                  status: "PENDING",
               },
            });
         });
      } catch (error) {
         if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
               const meta = error.meta as { target?: string[] };
               if (meta?.target?.includes("doctorId") && 
                   meta?.target?.includes("date") && 
                   meta?.target?.includes("timeSlot")) {
                  throw new ConflictError("Time slot is already booked");
               }
            }
         }
         throw error;
      }
   }
}
