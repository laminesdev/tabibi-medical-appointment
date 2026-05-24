import { Role, Gender } from "@prisma/client";

export interface IUser {
   id: string;
   email: string;
   firstName: string;
   lastName: string;
   phone: string;
   gender: Gender;
   dateOfBirth?: Date;
   role: Role;
   isVerified: boolean;
   isActive: boolean;
   createdAt: Date;
   updatedAt: Date;
}
