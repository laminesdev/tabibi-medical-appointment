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

export interface IPatientData {
   id: string;
   userId: string;
   medicalHistory?: string;
   createdAt: Date;
   updatedAt: Date;
}

export interface IPatientWithUser extends IUser, IPatientData {}

export interface IAdminData {
   id: string;
   userId: string;
   createdAt: Date;
   updatedAt: Date;
}

export interface IAdminWithUser extends IUser, IAdminData {}

// DTOs (Data Transfer Objects)
export type CreateUserDTO = {
   email: string;
   password: string;
   firstName: string;
   lastName: string;
   phone: string;
   gender: Gender;
   dateOfBirth?: Date;
   role?: Role;
};

export type UpdateUserDTO = Partial<{
   firstName: string;
   lastName: string;
   phone: string;
   gender: Gender;
   dateOfBirth?: Date;
   isActive: boolean;
}>;

export type CreatePatientDTO = CreateUserDTO & {
   medicalHistory?: string;
};

export type CreateDoctorDTO = CreateUserDTO & {
   specialty: string;
   location: string;
   bio?: string;
   consultationFee?: number;
   experienceYears?: number;
   education?: string;
};

export type UpdateDoctorDTO = Partial<{
   specialty: string;
   location: string;
   bio: string;
   consultationFee: number;
   experienceYears: number;
   education: string;
}>;
