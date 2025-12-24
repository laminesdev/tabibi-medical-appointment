import { AppointmentStatus } from "@prisma/client";

export interface IAppointment {
   id: string;
   patientId: string;
   doctorId: string;
   date: Date;
   timeSlot: string; // Format: "HH:mm-HH:mm"
   status: AppointmentStatus;
   reason?: string;
   notes?: string;
   createdAt: Date;
   updatedAt: Date;
}

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

export type AppointmentQueryParams = {
   patientId?: string;
   doctorId?: string;
   status?: AppointmentStatus;
   dateFrom?: Date;
   dateTo?: Date;
   page?: number;
   limit?: number;
};

export type TimeSlot = {
   start: string; // Format: "HH:mm"
   end: string; // Format: "HH:mm"
};

export type AppointmentWithDetails = IAppointment & {
  patient: {
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      phone: string;
      email: string;
    };
  };
  doctor: {
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    specialty: string;
    location: string;
  };
};
