import { User, Role, Gender, Prisma } from "@prisma/client";
import { BaseRepository } from "./base.repository";
import { SanitizationUtils } from "../utils/sanitization.utils";

export interface CreateUserData {
   email: string;
   password: string;
   firstName: string;
   lastName: string;
   phone: string;
   gender: Gender;
   dateOfBirth?: Date;
   role?: Role;
}

export interface UpdateUserData {
   firstName?: string;
   lastName?: string;
   phone?: string;
   gender?: Gender;
   dateOfBirth?: Date;
   isActive?: boolean;
   isVerified?: boolean;
}

export interface UserQueryParams {
   page?: number;
   limit?: number;
   role?: Role;
   search?: string;
   isActive?: boolean;
   isVerified?: boolean;
   createdAfter?: Date;
}

export class UserRepository extends BaseRepository {
   async create(data: CreateUserData): Promise<User> {
      // Define fields with proper typing
      const fields = {
         email: "email" as const,
         firstName: "name" as const,
         lastName: "name" as const,
         phone: "phone" as const,
      };

      // Sanitize input data
      const sanitizedData = SanitizationUtils.sanitizeObject(data, fields);

      return this.prisma.user.create({
         data: {
            email: sanitizedData.email.toLowerCase().trim(),
            password: sanitizedData.password,
            firstName: sanitizedData.firstName.trim(),
            lastName: sanitizedData.lastName.trim(),
            phone: sanitizedData.phone.trim(),
            gender: data.gender,
            dateOfBirth: data.dateOfBirth,
            role: data.role || "PATIENT",
            isVerified: false,
            isActive: true,
         },
      });
   }

   async findById(id: string): Promise<User | null> {
      return this.prisma.user.findUnique({
         where: { id },
      });
   }

   async findByEmail(email: string): Promise<User | null> {
      const sanitizedEmail = SanitizationUtils.sanitizeEmail(email);
      return this.prisma.user.findUnique({
         where: { email: sanitizedEmail.toLowerCase().trim() },
      });
   }

   async findByIdWithRelations(id: string): Promise<any> {
      return this.prisma.user.findUnique({
         where: { id },
         include: {
            patient: true,
            doctor: {
               include: {
                  schedule: true,
               },
            },
            admin: true,
         },
      });
   }

   async update(id: string, data: UpdateUserData): Promise<User> {
      // Define fields with proper typing
      const fields = {
         firstName: "name" as const,
         lastName: "name" as const,
         phone: "phone" as const,
      };

      // Sanitize input data
      const sanitizedData = SanitizationUtils.sanitizeObject(data, fields);

      const updateData: any = {};

      if (sanitizedData.firstName)
         updateData.firstName = sanitizedData.firstName.trim();
      if (sanitizedData.lastName)
         updateData.lastName = sanitizedData.lastName.trim();
      if (sanitizedData.phone) updateData.phone = sanitizedData.phone.trim();
      if (data.gender) updateData.gender = data.gender;
      if (data.dateOfBirth !== undefined)
         updateData.dateOfBirth = data.dateOfBirth;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      if (data.isVerified !== undefined)
         updateData.isVerified = data.isVerified;

      return this.prisma.user.update({
         where: { id },
         data: updateData,
      });
   }

   async updatePassword(id: string, hashedPassword: string): Promise<User> {
      return this.prisma.user.update({
         where: { id },
         data: { password: hashedPassword },
      });
   }

   async markAsVerified(id: string): Promise<User> {
      return this.prisma.user.update({
         where: { id },
         data: { isVerified: true },
      });
   }

   async deactivate(id: string): Promise<User> {
      return this.prisma.user.update({
         where: { id },
         data: { isActive: false },
      });
   }

   async reactivate(id: string): Promise<User> {
      return this.prisma.user.update({
         where: { id },
         data: { isActive: true },
      });
   }

   async findAll(params?: UserQueryParams): Promise<User[]> {
      const {
         page = 1,
         limit = 10,
         role,
         search,
         isActive,
         isVerified,
         createdAfter,
      } = params || {};

      const { skip, take } = this.getPaginationParams(page, limit);

      const where: Prisma.UserWhereInput = {};

      if (role) where.role = role;
      if (isActive !== undefined) where.isActive = isActive;
      if (isVerified !== undefined) where.isVerified = isVerified;
      if (createdAfter) where.createdAt = { gte: createdAfter };

      if (search) {
         const sanitizedSearch = SanitizationUtils.sanitizeText(search, 50);
         where.OR = [
            { firstName: { contains: sanitizedSearch, mode: "insensitive" } },
            { lastName: { contains: sanitizedSearch, mode: "insensitive" } },
            { email: { contains: sanitizedSearch, mode: "insensitive" } },
            { phone: { contains: sanitizedSearch, mode: "insensitive" } },
         ];
      }

      return this.prisma.user.findMany({
         where,
         skip,
         take,
         orderBy: { createdAt: "desc" },
      });
   }

   async count(params?: Partial<UserQueryParams>): Promise<number> {
      const { role, search, isActive, isVerified } = params || {};

      const where: Prisma.UserWhereInput = {};

      if (role) where.role = role;
      if (isActive !== undefined) where.isActive = isActive;
      if (isVerified !== undefined) where.isVerified = isVerified;

      if (search) {
         const sanitizedSearch = SanitizationUtils.sanitizeText(search, 50);
         where.OR = [
            { firstName: { contains: sanitizedSearch, mode: "insensitive" } },
            { lastName: { contains: sanitizedSearch, mode: "insensitive" } },
            { email: { contains: sanitizedSearch, mode: "insensitive" } },
            { phone: { contains: sanitizedSearch, mode: "insensitive" } },
         ];
      }

      return this.prisma.user.count({ where });
   }

   async existsByEmail(email: string): Promise<boolean> {
      const sanitizedEmail = SanitizationUtils.sanitizeEmail(email);
      const count = await this.prisma.user.count({
         where: { email: sanitizedEmail.toLowerCase().trim() },
      });
      return count > 0;
   }

   async existsByPhone(phone: string): Promise<boolean> {
      const sanitizedPhone = SanitizationUtils.sanitizePhone(phone);
      const count = await this.prisma.user.count({
         where: { phone: sanitizedPhone.trim() },
      });
      return count > 0;
   }

   async getStats(): Promise<{
      total: number;
      byRole: Record<Role, number>;
      activeCount: number;
      verifiedCount: number;
      recentSignups: number;
   }> {
      const [total, byRoleResult, activeCount, verifiedCount] =
         await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.groupBy({
               by: ["role"],
               _count: true,
            }),
            this.prisma.user.count({ where: { isActive: true } }),
            this.prisma.user.count({ where: { isVerified: true } }),
         ]);

      const byRole: Record<Role, number> = {
         PATIENT: 0,
         DOCTOR: 0,
         ADMIN: 0,
      };

      byRoleResult.forEach((item) => {
         byRole[item.role] = item._count;
      });

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const recentSignups = await this.prisma.user.count({
         where: { createdAt: { gte: oneWeekAgo } },
      });

      return {
         total,
         byRole,
         activeCount,
         verifiedCount,
         recentSignups,
      };
   }
}
