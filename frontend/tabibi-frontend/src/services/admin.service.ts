import api from "./api";
import type { DashboardData, ApiResponse, PaginatedResponse } from "@/types/api.types";
import type { DoctorProfile, DoctorSummary } from "@/types/doctor.types";
import type { IUser } from "@/types/auth.types";

export interface AdminQuery {
  page?: number;
  limit?: number;
  search?: string;
  specialty?: string;
  location?: string;
  minRating?: number;
  role?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

export const adminService = {
  async getDashboard(dateRange?: {
    startDate?: string;
    endDate?: string;
  }): Promise<DashboardData> {
    const params = new URLSearchParams();
    if (dateRange?.startDate) params.set("startDate", dateRange.startDate);
    if (dateRange?.endDate) params.set("endDate", dateRange.endDate);

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await api.get<ApiResponse<DashboardData>>(`/admin/dashboard${query}`);
    return response.data.data;
  },

  async getDoctors(params?: AdminQuery): Promise<PaginatedResponse<DoctorProfile>> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    if (params?.specialty) query.set("specialty", params.specialty);
    if (params?.location) query.set("location", params.location);
    if (params?.minRating !== undefined) query.set("minRating", String(params.minRating));

    const response = await api.get<PaginatedResponse<DoctorProfile>>(
      `/admin/doctors?${query.toString()}`
    );
    return response.data;
  },

  async getDoctorById(id: string): Promise<DoctorProfile> {
    const response = await api.get<ApiResponse<DoctorProfile>>(`/admin/doctors/${id}`);
    return response.data.data;
  },

  async createDoctor(data: Partial<DoctorProfile> & { email: string; password: string }): Promise<DoctorProfile> {
    const response = await api.post<ApiResponse<DoctorProfile>>("/admin/doctors", data);
    return response.data.data;
  },

  async updateDoctor(id: string, data: Partial<DoctorProfile>): Promise<void> {
    await api.patch(`/admin/doctors/${id}`, data);
  },

  async removeDoctor(id: string): Promise<void> {
    await api.delete(`/admin/doctors/${id}`);
  },

  async getUsers(params?: AdminQuery): Promise<PaginatedResponse<IUser>> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    if (params?.role) query.set("role", params.role);
    if (params?.isActive !== undefined) query.set("isActive", String(params.isActive));
    if (params?.isVerified !== undefined) query.set("isVerified", String(params.isVerified));

    const response = await api.get<PaginatedResponse<IUser>>(`/admin/users?${query.toString()}`);
    return response.data;
  },

  async getUserById(id: string): Promise<IUser> {
    const response = await api.get<ApiResponse<IUser>>(`/admin/users/${id}`);
    return response.data.data;
  },

  async updateUser(id: string, data: Partial<IUser>): Promise<IUser> {
    const response = await api.patch<ApiResponse<IUser>>(`/admin/users/${id}`, data);
    return response.data.data;
  },

  async deactivateUser(id: string): Promise<void> {
    await api.patch(`/admin/users/${id}/deactivate`);
  },

  async reactivateUser(id: string): Promise<void> {
    await api.patch(`/admin/users/${id}/reactivate`);
  },
};
