import { Doctor, Prisma } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export interface CreateDoctorData {
   userId: string;
   specialty: string;
   location: string;
   bio?: string;
   consultationFee?: number;
   experienceYears?: number;
   education?: string;
}

export interface UpdateDoctorData {
   specialty?: string;
   location?: string;
   bio?: string;
   consultationFee?: number;
   experienceYears?: number;
   education?: string;
   rating?: number;
   totalReviews?: number;
}

export interface SearchDoctorParams {
   specialty?: string;
   location?: string;
   minRating?: number;
   search?: string;
   page?: number;
   limit?: number;
}

export class DoctorRepository extends BaseRepository {
   async create(data: CreateDoctorData): Promise<Doctor> {
      return this.prisma.doctor.create({
         data: {
            userId: data.userId,
            specialty: data.specialty.trim(),
            location: data.location.trim(),
            bio: data.bio?.trim(),
            consultationFee: data.consultationFee,
            experienceYears: data.experienceYears,
            education: data.education?.trim(),
            rating: 0,
            totalReviews: 0,
         },
         include: {
            user: true,
         },
      });
   }

   async findById(id: string): Promise<Doctor | null> {
      return this.prisma.doctor.findUnique({
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
               },
            },
            schedule: true,
         },
      });
   }

   async findByUserId(userId: string): Promise<Doctor | null> {
      return this.prisma.doctor.findUnique({
         where: { userId },
         include: {
            user: true,
            schedule: true,
         },
      });
   }

   async update(id: string, data: UpdateDoctorData): Promise<Doctor> {
      const updateData: any = {};

      if (data.specialty) updateData.specialty = data.specialty.trim();
      if (data.location) updateData.location = data.location.trim();
      if (data.bio !== undefined) updateData.bio = data.bio?.trim();
      if (data.consultationFee !== undefined)
         updateData.consultationFee = data.consultationFee;
      if (data.experienceYears !== undefined)
         updateData.experienceYears = data.experienceYears;
      if (data.education !== undefined)
         updateData.education = data.education?.trim();
      if (data.rating !== undefined) updateData.rating = data.rating;
      if (data.totalReviews !== undefined)
         updateData.totalReviews = data.totalReviews;

      return this.prisma.doctor.update({
         where: { id },
         data: updateData,
      });
   }

   async search(params: SearchDoctorParams): Promise<Doctor[]> {
      const {
         specialty,
         location,
         minRating,
         search,
         page = 1,
         limit = 10,
      } = params;

      const { skip, take } = this.getPaginationParams(page, limit);

      const where: Prisma.DoctorWhereInput = {};

      if (specialty) {
         where.specialty = { contains: specialty, mode: "insensitive" };
      }
      if (location) {
         where.location = { contains: location, mode: "insensitive" };
      }
      if (minRating !== undefined) {
         where.rating = { gte: minRating };
      }
      if (search) {
         where.OR = [
            { specialty: { contains: search, mode: "insensitive" } },
            { location: { contains: search, mode: "insensitive" } },
            { user: { firstName: { contains: search, mode: "insensitive" } } },
            { user: { lastName: { contains: search, mode: "insensitive" } } },
         ];
      }

      return this.prisma.doctor.findMany({
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
            schedule: true,
         },
         skip,
         take,
         orderBy: [{ rating: "desc" }, { totalReviews: "desc" }],
      });
   }

   async findAll(params?: {
      page?: number;
      limit?: number;
   }): Promise<Doctor[]> {
      const { page = 1, limit = 10 } = params || {};
      const { skip, take } = this.getPaginationParams(page, limit);

      return this.prisma.doctor.findMany({
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
            schedule: true,
         },
         skip,
         take,
         orderBy: { createdAt: "desc" },
      });
   }

   async count(params?: Partial<SearchDoctorParams>): Promise<number> {
      const { specialty, location, minRating } = params || {};

      const where: Prisma.DoctorWhereInput = {};

      if (specialty) {
         where.specialty = { contains: specialty, mode: "insensitive" };
      }
      if (location) {
         where.location = { contains: location, mode: "insensitive" };
      }
      if (minRating !== undefined) {
         where.rating = { gte: minRating };
      }

      return this.prisma.doctor.count({ where });
   }

   async getStats(doctorId: string): Promise<{
      totalAppointments: number;
      upcomingAppointments: number;
      completedAppointments: number;
      cancelledAppointments: number;
      averageRating: number;
   }> {
      const [total, upcoming, completed, cancelled, doctor] = await Promise.all(
         [
            this.prisma.appointment.count({
               where: { doctorId },
            }),
            this.prisma.appointment.count({
               where: {
                  doctorId,
                  date: { gte: new Date() },
                  status: { in: ["PENDING", "CONFIRMED"] },
               },
            }),
            this.prisma.appointment.count({
               where: { doctorId, status: "COMPLETED" },
            }),
            this.prisma.appointment.count({
               where: { doctorId, status: "CANCELLED" },
            }),
            this.prisma.doctor.findUnique({
               where: { id: doctorId },
               select: { rating: true },
            }),
         ]
      );

      return {
         totalAppointments: total,
         upcomingAppointments: upcoming,
         completedAppointments: completed,
         cancelledAppointments: cancelled,
         averageRating: doctor?.rating || 0,
      };
   }

   async getTopRated(limit: number = 10): Promise<Doctor[]> {
      return this.prisma.doctor.findMany({
         where: {
            rating: { gte: 4.0 },
            totalReviews: { gte: 5 },
         },
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
            schedule: true,
         },
         orderBy: { rating: "desc" },
         take: limit,
      });
   }
}
