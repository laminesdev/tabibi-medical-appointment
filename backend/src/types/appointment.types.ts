import { AppointmentStatus } from "@prisma/client";

export type CreateAppointmentDTO = {
   doctorId: string;
   date: Date;
   timeSlot: string;
   reason?: string;
};

export type UpdateAppointmentDTO = Partial<{
   date: Date;
   timeSlot: string;
   status: AppointmentStatus;
   reason: string;
   notes: string;
}>;
