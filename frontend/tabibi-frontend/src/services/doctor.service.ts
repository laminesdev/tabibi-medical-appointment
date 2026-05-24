import api from "./api";
import type { Appointment, AppointmentQuery, AppointmentStatus } from "@/types/appointment.types";
import type { ScheduleData, ScheduleDay, DoctorProfile } from "@/types/doctor.types";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";

function parseScheduleDay(value: string | null): ScheduleDay | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as ScheduleDay;
  } catch {
    return null;
  }
}

function serializeScheduleDay(day: ScheduleDay | null): string | null {
  if (!day) return null;
  return JSON.stringify(day);
}

function parseSchedule(data: {
  id?: string;
  doctorId?: string;
  monday?: string | null;
  tuesday?: string | null;
  wednesday?: string | null;
  thursday?: string | null;
  friday?: string | null;
  saturday?: string | null;
  sunday?: string | null;
  timeSlotDuration: number;
}): ScheduleData {
  return {
    id: data.id,
    doctorId: data.doctorId,
    monday: parseScheduleDay(data.monday ?? null),
    tuesday: parseScheduleDay(data.tuesday ?? null),
    wednesday: parseScheduleDay(data.wednesday ?? null),
    thursday: parseScheduleDay(data.thursday ?? null),
    friday: parseScheduleDay(data.friday ?? null),
    saturday: parseScheduleDay(data.saturday ?? null),
    sunday: parseScheduleDay(data.sunday ?? null),
    timeSlotDuration: data.timeSlotDuration,
  };
}

function serializeSchedule(data: ScheduleData): Record<string, unknown> {
  return {
    monday: serializeScheduleDay(data.monday),
    tuesday: serializeScheduleDay(data.tuesday),
    wednesday: serializeScheduleDay(data.wednesday),
    thursday: serializeScheduleDay(data.thursday),
    friday: serializeScheduleDay(data.friday),
    saturday: serializeScheduleDay(data.saturday),
    sunday: serializeScheduleDay(data.sunday),
    timeSlotDuration: data.timeSlotDuration,
  };
}

export const doctorService = {
  async getAppointments(params?: AppointmentQuery): Promise<PaginatedResponse<Appointment>> {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.dateFrom) query.set("dateFrom", params.dateFrom);
    if (params?.dateTo) query.set("dateTo", params.dateTo);
    if (params?.search) query.set("search", params.search);

    const response = await api.get<PaginatedResponse<Appointment>>(
      `/doctors/appointments?${query.toString()}`
    );
    return response.data;
  },

  async getAppointmentById(id: string): Promise<Appointment> {
    const response = await api.get<ApiResponse<Appointment>>(`/doctors/appointments/${id}`);
    return response.data.data;
  },

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    const response = await api.patch<ApiResponse<Appointment>>(
      `/doctors/appointments/${id}/status`,
      { status }
    );
    return response.data.data;
  },

  async getSchedule(): Promise<ScheduleData> {
    const response = await api.get<ApiResponse<Record<string, unknown>>>("/doctors/schedule");
    return parseSchedule(response.data.data as Parameters<typeof parseSchedule>[0]);
  },

  async updateSchedule(data: ScheduleData): Promise<ScheduleData> {
    const response = await api.put<ApiResponse<Record<string, unknown>>>("/doctors/schedule", serializeSchedule(data));
    return parseSchedule(response.data.data as Parameters<typeof parseSchedule>[0]);
  },

  async getProfile(): Promise<DoctorProfile> {
    const response = await api.get<ApiResponse<DoctorProfile>>("/doctors/profile");
    return response.data.data;
  },

  async updateProfile(data: Partial<DoctorProfile>): Promise<DoctorProfile> {
    const response = await api.patch<ApiResponse<DoctorProfile>>("/doctors/profile", data);
    return response.data.data;
  },
};
