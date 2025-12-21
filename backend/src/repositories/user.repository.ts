import { User, Role, Gender } from "@prisma/client"; // Remove PrismaClient import
import { BaseRepository } from "./base.repository";

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

export interface PaginationParams {
   page?: number;
   limit?: number;
}

export interface UserQueryParams extends PaginationParams {
   role?: Role;
   search?: string;
   isActive?: boolean;
   isVerified?: boolean;
}

export class UserRepository extends BaseRepository {
   async create(data: CreateUserData): Promise<User> {
      return this.prisma.user.create({
         data: {
            email: data.email.toLowerCase().trim(),
            password: data.password,
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            phone: data.phone.trim(),
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
         where: { id, isActive: true },
      });
   }

   async findByEmail(email: string): Promise<User | null> {
      return this.prisma.user.findUnique({
         where: {
            email: email.toLowerCase().trim(),
            isActive: true,
         },
      });
   }

   async update(id: string, data: UpdateUserData): Promise<User> {
      const updateData: any = { ...data };

      if (data.firstName) updateData.firstName = data.firstName.trim();
      if (data.lastName) updateData.lastName = data.lastName.trim();
      if (data.phone) updateData.phone = data.phone.trim();

      return this.prisma.user.update({
         where: { id },
         data: updateData,
      });
   }

   async delete(id: string): Promise<User> {
      return this.prisma.user.delete({
         where: { id },
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
      } = params || {};
      const skip = (page - 1) * limit;

      const where: any = {};

      if (role) where.role = role;
      if (isActive !== undefined) where.isActive = isActive;
      if (isVerified !== undefined) where.isVerified = isVerified;

      if (search) {
         where.OR = [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
         ];
      }

      return this.prisma.user.findMany({
         where,
         skip,
         take: limit,
         orderBy: { createdAt: "desc" },
      });
   }

   async findByRole(role: Role, params?: PaginationParams): Promise<User[]> {
      const { page = 1, limit = 10 } = params || {};
      const skip = (page - 1) * limit;

      return this.prisma.user.findMany({
         where: {
            role,
            isActive: true,
         },
         skip,
         take: limit,
         orderBy: { createdAt: "desc" },
      });
   }

   async search(params: UserQueryParams): Promise<User[]> {
      return this.findAll(params);
   }

   async existsByEmail(email: string): Promise<boolean> {
      const count = await this.prisma.user.count({
         where: {
            email: email.toLowerCase().trim(),
            isActive: true,
         },
      });
      return count > 0;
   }

   async existsByPhone(phone: string): Promise<boolean> {
      const count = await this.prisma.user.count({
         where: {
            phone: phone.trim(),
            isActive: true,
         },
      });
      return count > 0;
   }

   async count(params?: Partial<UserQueryParams>): Promise<number> {
      const { role, search, isActive, isVerified } = params || {};

      const where: any = {};

      if (role) where.role = role;
      if (isActive !== undefined) where.isActive = isActive;
      if (isVerified !== undefined) where.isVerified = isVerified;

      if (search) {
         where.OR = [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
         ];
      }

      return this.prisma.user.count({ where });
   }

   async findByIds(ids: string[]): Promise<User[]> {
      return this.prisma.user.findMany({
         where: {
            id: { in: ids },
            isActive: true,
         },
      });
   }
}
