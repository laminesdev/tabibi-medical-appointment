export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "RESCHEDULED"
  | "REJECTED";

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
  reason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    userId: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
  };
  doctor: {
    id: string;
    userId: string;
    specialty: string;
    location: string;
    consultationFee: number | null;
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface BookAppointmentData {
  doctorId: string;
  date: string;
  timeSlot: string;
  reason?: string;
}

export interface RescheduleData {
  date: string;
  timeSlot: string;
}

export interface AppointmentQuery {
  status?: string;
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
