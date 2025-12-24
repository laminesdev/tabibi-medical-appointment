import { Patient, Prisma } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export interface CreatePatientData {
   userId: string;
   medicalHistory?: string;
}

export interface UpdatePatientData {
   medicalHistory?: string;
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

   async findById(id: string): Promise<Patient | null> {
      return this.prisma.patient.findUnique({
         where: { id },
         include: {
            user: {
               select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                  gender: true,
                  dateOfBirth: true,
               },
            },
         },
      });
   }

   async findByUserId(userId: string): Promise<Patient | null> {
      return this.prisma.patient.findUnique({
         where: { userId },
         include: {
            user: true,
            appointments: {
               where: {
                  date: { gte: new Date() },
               },
               include: {
                  doctor: {
                     include: { user: true },
                  },
               },
               orderBy: { date: "asc" },
               take: 10,
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

   async findAll(params?: {
      page?: number;
      limit?: number;
      search?: string;
   }): Promise<Patient[]> {
      const { page = 1, limit = 10, search } = params || {};
      const { skip, take } = this.getPaginationParams(page, limit);

      const where: Prisma.PatientWhereInput = {};

      if (search) {
         where.user = {
            OR: [
               { firstName: { contains: search, mode: "insensitive" } },
               { lastName: { contains: search, mode: "insensitive" } },
               { email: { contains: search, mode: "insensitive" } },
            ],
         };
      }

      return this.prisma.patient.findMany({
         where,
         include: {
            user: {
               select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
               },
            },
         },
         skip,
         take,
         orderBy: { createdAt: "desc" },
      });
   }

   async count(search?: string): Promise<number> {
      const where: Prisma.PatientWhereInput = {};

      if (search) {
         where.user = {
            OR: [
               { firstName: { contains: search, mode: "insensitive" } },
               { lastName: { contains: search, mode: "insensitive" } },
               { email: { contains: search, mode: "insensitive" } },
            ],
         };
      }

      return this.prisma.patient.count({ where });
   }

   async getStats(patientId: string): Promise<{
      totalAppointments: number;
      upcomingAppointments: number;
      completedAppointments: number;
      cancelledAppointments: number;
   }> {
      const [total, upcoming, completed, cancelled] = await Promise.all([
         this.prisma.appointment.count({
            where: { patientId },
         }),
         this.prisma.appointment.count({
            where: {
               patientId,
               date: { gte: new Date() },
               status: { in: ["PENDING", "CONFIRMED"] },
            },
         }),
         this.prisma.appointment.count({
            where: { patientId, status: "COMPLETED" },
         }),
         this.prisma.appointment.count({
            where: { patientId, status: "CANCELLED" },
         }),
      ]);

      return {
         totalAppointments: total,
         upcomingAppointments: upcoming,
         completedAppointments: completed,
         cancelledAppointments: cancelled,
      };
   }
}
