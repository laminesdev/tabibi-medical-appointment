import { Doctor, Schedule, Appointment } from "@prisma/client";
import { BaseRepository } from "./base.repository";
import { PaginationParams } from "./user.repository";

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

export interface SearchDoctorsCriteria extends PaginationParams {
   specialty?: string;
   location?: string;
   minRating?: number;
   maxRating?: number;
   minFee?: number;
   maxFee?: number;
   experienceMin?: number;
   experienceMax?: number;
   search?: string;
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
         },
      });
   }

   async findById(id: string): Promise<Doctor | null> {
      return this.prisma.doctor.findUnique({
         where: { id },
         include: {
            user: true,
            schedule: true,
            appointments: {
               include: {
                  patient: {
                     include: { user: true },
                  },
               },
               orderBy: { date: "desc" },
               take: 20,
            },
         },
      });
   }

   async findByUserId(userId: string): Promise<Doctor | null> {
      return this.prisma.doctor.findUnique({
         where: { userId },
         include: {
            user: true,
            schedule: true,
            appointments: {
               where: {
                  date: {
                     gte: new Date(),
                  },
               },
               include: {
                  patient: {
                     include: { user: true },
                  },
               },
               orderBy: { date: "asc" },
            },
         },
      });
   }

   async update(id: string, data: UpdateDoctorData): Promise<Doctor> {
      const updateData: any = { ...data };

      if (data.specialty) updateData.specialty = data.specialty.trim();
      if (data.location) updateData.location = data.location.trim();
      if (data.bio) updateData.bio = data.bio.trim();
      if (data.education) updateData.education = data.education.trim();

      return this.prisma.doctor.update({
         where: { id },
         data: updateData,
      });
   }

   async delete(id: string): Promise<Doctor> {
      return this.prisma.doctor.delete({
         where: { id },
      });
   }

   async search(criteria: SearchDoctorsCriteria): Promise<Doctor[]> {
      const {
         page = 1,
         limit = 10,
         specialty,
         location,
         minRating,
         maxRating,
         minFee,
         maxFee,
         experienceMin,
         experienceMax,
         search,
      } = criteria;

      const skip = (page - 1) * limit;

      const where: any = {};

      if (specialty)
         where.specialty = { contains: specialty, mode: "insensitive" };
      if (location)
         where.location = { contains: location, mode: "insensitive" };
      if (minRating !== undefined) where.rating = { gte: minRating };
      if (maxRating !== undefined)
         where.rating = { ...where.rating, lte: maxRating };
      if (minFee !== undefined) where.consultationFee = { gte: minFee };
      if (maxFee !== undefined)
         where.consultationFee = { ...where.consultationFee, lte: maxFee };
      if (experienceMin !== undefined)
         where.experienceYears = { gte: experienceMin };
      if (experienceMax !== undefined)
         where.experienceYears = {
            ...where.experienceYears,
            lte: experienceMax,
         };

      if (search) {
         where.OR = [
            { user: { firstName: { contains: search, mode: "insensitive" } } },
            { user: { lastName: { contains: search, mode: "insensitive" } } },
            { bio: { contains: search, mode: "insensitive" } },
            { education: { contains: search, mode: "insensitive" } },
         ];
      }

      return this.prisma.doctor.findMany({
         where,
         include: {
            user: true,
            schedule: true,
            appointments: {
               where: {
                  date: {
                     gte: new Date(),
                  },
               },
               take: 5,
            },
         },
         skip,
         take: limit,
         orderBy: [
            { rating: "desc" },
            { totalReviews: "desc" },
            { experienceYears: "desc" },
         ],
      });
   }

   async getSchedule(doctorId: string): Promise<Schedule | null> {
      return this.prisma.schedule.findUnique({
         where: { doctorId },
      });
   }

   async createOrUpdateSchedule(
      doctorId: string,
      scheduleData: Partial<Schedule>
   ): Promise<Schedule> {
      return this.prisma.schedule.upsert({
         where: { doctorId },
         update: scheduleData,
         create: {
            doctorId,
            ...(scheduleData as any),
         },
      });
   }

   async getAppointments(
      doctorId: string,
      params?: PaginationParams
   ): Promise<Appointment[]> {
      const { page = 1, limit = 10 } = params || {};
      const skip = (page - 1) * limit;

      return this.prisma.appointment.findMany({
         where: { doctorId },
         include: {
            patient: {
               include: { user: true },
            },
         },
         skip,
         take: limit,
         orderBy: { date: "desc" },
      });
   }

   async getUpcomingAppointments(
      doctorId: string,
      limit: number = 10
   ): Promise<Appointment[]> {
      return this.prisma.appointment.findMany({
         where: {
            doctorId,
            date: {
               gte: new Date(),
            },
            status: { in: ["PENDING", "CONFIRMED"] },
         },
         include: {
            patient: {
               include: { user: true },
            },
         },
         orderBy: { date: "asc" },
         take: limit,
      });
   }

   async getAppointmentsByDate(
      doctorId: string,
      date: Date
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
         },
         include: {
            patient: {
               include: { user: true },
            },
         },
         orderBy: { date: "asc" },
      });
   }

   async count(criteria?: Partial<SearchDoctorsCriteria>): Promise<number> {
      const where: any = {};

      if (criteria?.specialty)
         where.specialty = {
            contains: criteria.specialty,
            mode: "insensitive",
         };
      if (criteria?.location)
         where.location = { contains: criteria.location, mode: "insensitive" };
      if (criteria?.minRating !== undefined)
         where.rating = { gte: criteria.minRating };

      return this.prisma.doctor.count({ where });
   }

   async getTopRated(limit: number = 10): Promise<Doctor[]> {
      return this.prisma.doctor.findMany({
         where: {
            rating: { gte: 4.0 },
            totalReviews: { gte: 10 },
         },
         include: {
            user: true,
            schedule: true,
         },
         orderBy: { rating: "desc" },
         take: limit,
      });
   }

   async getBySpecialty(specialty: string): Promise<Doctor[]> {
      return this.prisma.doctor.findMany({
         where: {
            specialty: { contains: specialty, mode: "insensitive" },
         },
         include: {
            user: true,
            schedule: true,
         },
         orderBy: { rating: "desc" },
      });
   }

   async updateRating(doctorId: string, newRating: number): Promise<Doctor> {
      const doctor = await this.findById(doctorId);
      if (!doctor) throw new Error("Doctor not found");

      const currentTotalReviews = doctor.totalReviews || 0;
      const currentRating = doctor.rating || 0;

      const updatedTotalReviews = currentTotalReviews + 1;
      const updatedRating =
         (currentRating * currentTotalReviews + newRating) /
         updatedTotalReviews;

      return this.prisma.doctor.update({
         where: { id: doctorId },
         data: {
            rating: updatedRating,
            totalReviews: updatedTotalReviews,
         },
      });
   }
}
