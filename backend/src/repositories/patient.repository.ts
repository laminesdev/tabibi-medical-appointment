import { Patient, Appointment } from "@prisma/client"; // Remove PrismaClient
import { BaseRepository } from "./base.repository";
import { PaginationParams } from "./user.repository";

export interface CreatePatientData {
   userId: string;
   medicalHistory?: string;
}

export interface UpdatePatientData {
   medicalHistory?: string;
}

export interface PatientQueryParams extends PaginationParams {
   userId?: string;
   withAppointments?: boolean;
   appointmentStatus?: string;
}

export class PatientRepository extends BaseRepository {
   async create(data: CreatePatientData): Promise<Patient> {
      return this.prisma.patient.create({
         data: {
            userId: data.userId,
            medicalHistory: data.medicalHistory,
         },
      });
   }

   async findByUserId(userId: string): Promise<Patient | null> {
      return this.prisma.patient.findUnique({
         where: { userId },
         include: {
            user: true,
            appointments: {
               include: {
                  doctor: {
                     include: {
                        user: true,
                        schedule: true,
                     },
                  },
               },
               orderBy: { date: "desc" },
               take: 10,
            },
         },
      });
   }

   async findById(id: string): Promise<Patient | null> {
      return this.prisma.patient.findUnique({
         where: { id },
         include: {
            user: true,
            appointments: {
               include: {
                  doctor: {
                     include: {
                        user: true,
                     },
                  },
               },
            },
         },
      });
   }

   async update(id: string, data: UpdatePatientData): Promise<Patient> {
      return this.prisma.patient.update({
         where: { id },
         data,
      });
   }

   async findAll(params?: PatientQueryParams): Promise<Patient[]> {
      const {
         page = 1,
         limit = 10,
         userId,
         withAppointments = false,
      } = params || {};
      const skip = (page - 1) * limit;

      const where: any = {};
      if (userId) where.userId = userId;

      const include: any = {
         user: true,
      };

      if (withAppointments) {
         include.appointments = {
            include: {
               doctor: {
                  include: { user: true },
               },
            },
         };
      }

      return this.prisma.patient.findMany({
         where,
         include,
         skip,
         take: limit,
         orderBy: { createdAt: "desc" },
      });
   }

   async getAppointments(
      patientId: string,
      params?: PaginationParams
   ): Promise<Appointment[]> {
      const { page = 1, limit = 10 } = params || {};
      const skip = (page - 1) * limit;

      return this.prisma.appointment.findMany({
         where: { patientId },
         include: {
            doctor: {
               include: {
                  user: true,
                  schedule: true,
               },
            },
         },
         skip,
         take: limit,
         orderBy: { date: "desc" },
      });
   }

   async countAppointments(
      patientId: string,
      status?: string
   ): Promise<number> {
      const where: any = { patientId };
      if (status) where.status = status;

      return this.prisma.appointment.count({ where });
   }

   async count(): Promise<number> {
      return this.prisma.patient.count();
   }

   async getRecentPatients(limit: number = 10): Promise<Patient[]> {
      return this.prisma.patient.findMany({
         include: {
            user: true,
         },
         orderBy: { createdAt: "desc" },
         take: limit,
      });
   }
}
