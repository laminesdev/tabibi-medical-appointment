import { Role } from "@prisma/client";

export type LoginDTO = {
   email: string;
   password: string;
};

export type RegisterDTO = {
   email: string;
   password: string;
   firstName: string;
   lastName: string;
   phone: string;
   gender: "MALE" | "FEMALE";
   dateOfBirth?: Date;
   role?: Role;
};

export type AuthResponse = {
   user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
      gender: "MALE" | "FEMALE";
      role: Role;
      isVerified: boolean;
   };
   token: string;
   refreshToken?: string;
};

export type TokenPayload = {
   userId: string;
   email: string;
   role: Role;
};

export type RefreshTokenDTO = {
   refreshToken: string;
};

export type ForgotPasswordDTO = {
   email: string;
};

export type ResetPasswordDTO = {
   token: string;
   newPassword: string;
};

export type VerifyEmailDTO = {
   token: string;
};
