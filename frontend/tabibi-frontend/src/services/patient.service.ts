import api from "./api";
import type { Appointment, BookAppointmentData, RescheduleData, AppointmentQuery } from "@/types/appointment.types";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";
import type { IUser } from "@/types/auth.types";

export interface PatientProfile {
  id: string;
  userId: string;
  medicalHistory: string | null;
  user: IUser;
  createdAt: string;
  updatedAt: string;
}

export const patientService = {
  async getProfile(): Promise<PatientProfile> {
    const response = await api.get<ApiResponse<PatientProfile>>("/patients/profile");
    return response.data.data;
  },

  async getAppointments(params?: AppointmentQuery): Promise<PaginatedResponse<Appointment>> {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.dateFrom) query.set("dateFrom", params.dateFrom);
    if (params?.dateTo) query.set("dateTo", params.dateTo);

    const response = await api.get<PaginatedResponse<Appointment>>(
      `/patients/appointments?${query.toString()}`
    );
    return response.data;
  },

  async getAppointmentById(id: string): Promise<Appointment> {
    const response = await api.get<ApiResponse<Appointment>>(`/patients/appointments/${id}`);
    return response.data.data;
  },

  async bookAppointment(data: BookAppointmentData): Promise<Appointment> {
    const response = await api.post<ApiResponse<Appointment>>("/patients/appointments", data);
    return response.data.data;
  },

  async cancelAppointment(id: string): Promise<void> {
    await api.patch(`/patients/appointments/${id}/cancel`);
  },

  async rescheduleAppointment(id: string, data: RescheduleData): Promise<Appointment> {
    const response = await api.patch<ApiResponse<Appointment>>(
      `/patients/appointments/${id}/reschedule`,
      data
    );
    return response.data.data;
  },
};
