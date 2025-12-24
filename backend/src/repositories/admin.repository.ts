import { Admin, Prisma } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export interface CreateAdminData {
   userId: string;
}

export interface AdminQueryParams {
   page?: number;
   limit?: number;
   search?: string;
}

export class AdminRepository extends BaseRepository {
   async create(data: CreateAdminData): Promise<Admin> {
      return this.prisma.admin.create({
         data: {
            userId: data.userId,
         },
         include: {
            user: true,
         },
      });
   }

   async findById(id: string): Promise<Admin | null> {
      return this.prisma.admin.findUnique({
         where: { id },
         include: {
            user: true,
         },
      });
   }

   async findByUserId(userId: string): Promise<Admin | null> {
      return this.prisma.admin.findUnique({
         where: { userId },
         include: {
            user: true,
         },
      });
   }

   async isAdmin(userId: string): Promise<boolean> {
      const count = await this.prisma.admin.count({
         where: { userId },
      });
      return count > 0;
   }

   async findAll(params?: AdminQueryParams): Promise<Admin[]> {
      const { page = 1, limit = 10, search } = params || {};
      const { skip, take } = this.getPaginationParams(page, limit);

      const where: Prisma.AdminWhereInput = {};

      if (search) {
         where.user = {
            OR: [
               { firstName: { contains: search, mode: "insensitive" } },
               { lastName: { contains: search, mode: "insensitive" } },
               { email: { contains: search, mode: "insensitive" } },
            ],
         };
      }

      return this.prisma.admin.findMany({
         where,
         include: {
            user: true,
         },
         skip,
         take,
         orderBy: { createdAt: "desc" },
      });
   }

   async count(params?: Partial<AdminQueryParams>): Promise<number> {
      const { search } = params || {};

      const where: Prisma.AdminWhereInput = {};

      if (search) {
         where.user = {
            OR: [
               { firstName: { contains: search, mode: "insensitive" } },
               { lastName: { contains: search, mode: "insensitive" } },
               { email: { contains: search, mode: "insensitive" } },
            ],
         };
      }

      return this.prisma.admin.count({ where });
   }

   async delete(id: string): Promise<Admin> {
      return this.prisma.admin.delete({
         where: { id },
      });
   }

   async deleteByUserId(userId: string): Promise<Admin | null> {
      const admin = await this.findByUserId(userId);
      if (!admin) return null;

      return this.prisma.admin.delete({
         where: { id: admin.id },
      });
   }
}
