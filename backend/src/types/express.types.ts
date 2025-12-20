import { Request } from "express";
import { IUser } from "./user.types";

declare global {
   namespace Express {
      interface Request {
         user?: IUser;
         token?: string;
      }
   }
}

export interface AuthenticatedRequest extends Request {
   user: IUser;
}

export interface AdminRequest extends AuthenticatedRequest {
   user: IUser & { role: "ADMIN" };
}

export interface DoctorRequest extends AuthenticatedRequest {
   user: IUser & { role: "DOCTOR" };
}

export interface PatientRequest extends AuthenticatedRequest {
   user: IUser & { role: "PATIENT" };
}
