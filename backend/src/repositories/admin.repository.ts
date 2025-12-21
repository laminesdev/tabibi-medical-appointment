import { Admin } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export interface CreateAdminData {
   userId: string;
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

   async findByUserId(userId: string): Promise<Admin | null> {
      return this.prisma.admin.findUnique({
         where: { userId },
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

   async delete(id: string): Promise<Admin> {
      return this.prisma.admin.delete({
         where: { id },
      });
   }

   async findAll(params?: any): Promise<Admin[]> {
      const { page = 1, limit = 10 } = params || {};
      const skip = (page - 1) * limit;

      return this.prisma.admin.findMany({
         include: {
            user: true,
         },
         skip,
         take: limit,
         orderBy: { createdAt: "desc" },
      });
   }

   async isUserAdmin(userId: string): Promise<boolean> {
      const count = await this.prisma.admin.count({
         where: { userId },
      });
      return count > 0;
   }

   async count(): Promise<number> {
      return this.prisma.admin.count();
   }
}
