import { IUser } from "./user.types";

// Doctor-specific data (without user info)
export interface IDoctorData {
   id: string;
   userId: string;
   specialty: string;
   location: string;
   bio?: string;
   consultationFee?: number;
   experienceYears?: number;
   education?: string;
   rating?: number;
   totalReviews?: number;
   createdAt: Date;
   updatedAt: Date;
}

// Complete doctor with user info
export interface IDoctorWithUser extends IUser, IDoctorData {}

export interface ISchedule {
   id: string;
   doctorId: string;
   monday?: string; // JSON: { start: "09:00", end: "17:00", breaks: [...] }
   tuesday?: string;
   wednesday?: string;
   thursday?: string;
   friday?: string;
   saturday?: string;
   sunday?: string;
   timeSlotDuration: number;
   createdAt: Date;
   updatedAt: Date;
}

export type ScheduleDay = {
   start: string;
   end: string;
   breaks?: Array<{ start: string; end: string }>;
};

export type UpdateScheduleDTO = Partial<{
   monday?: string | ScheduleDay;
   tuesday?: string | ScheduleDay;
   wednesday?: string | ScheduleDay;
   thursday?: string | ScheduleDay;
   friday?: string | ScheduleDay;
   saturday?: string | ScheduleDay;
   sunday?: string | ScheduleDay;
   timeSlotDuration: number;
}>;

export type SearchDoctorsDTO = {
   specialty?: string;
   location?: string;
   date?: Date;
   page?: number;
   limit?: number;
   minRating?: number;
   maxFee?: number;
};

export type DoctorAvailabilityDTO = {
   doctorId: string;
   date: Date;
};

export type AvailableSlot = {
   timeSlot: string;
   available: boolean;
};

export type DoctorWithSchedule = IDoctorData & {
   schedule?: ISchedule;
};
