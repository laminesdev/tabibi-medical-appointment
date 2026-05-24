export type Role = "PATIENT" | "DOCTOR" | "ADMIN";

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: "MALE" | "FEMALE";
  dateOfBirth?: string;
  role: Role;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: "MALE" | "FEMALE";
  dateOfBirth?: string;
  role: Role;
  specialty?: string;
  location?: string;
  bio?: string;
  consultationFee?: string;
  experienceYears?: string;
  education?: string;
}

export interface AuthResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}
