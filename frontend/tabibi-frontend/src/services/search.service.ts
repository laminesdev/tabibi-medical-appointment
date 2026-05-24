import api from "./api";
import type { DoctorSummary, DoctorProfile, Slot } from "@/types/doctor.types";
import type { ApiResponse, PaginatedResponse } from "@/types/api.types";

export interface SearchFilters {
  specialty?: string;
  location?: string;
  search?: string;
  minRating?: number;
  page?: number;
  limit?: number;
}

export const searchService = {
  async searchDoctors(filters: SearchFilters): Promise<PaginatedResponse<DoctorSummary>> {
    const params = new URLSearchParams();
    if (filters.specialty) params.set("specialty", filters.specialty);
    if (filters.location) params.set("location", filters.location);
    if (filters.search) params.set("search", filters.search);
    if (filters.minRating !== undefined) params.set("minRating", String(filters.minRating));
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));

    const response = await api.get<PaginatedResponse<DoctorSummary>>(
      `/search/doctors?${params.toString()}`
    );
    return response.data;
  },

  async getFeaturedDoctors(): Promise<DoctorSummary[]> {
    const response = await api.get<ApiResponse<DoctorSummary[]>>("/search/doctors/featured");
    return response.data.data;
  },

  async getDoctorById(id: string): Promise<DoctorProfile> {
    const response = await api.get<ApiResponse<DoctorProfile>>(`/search/doctors/${id}`);
    return response.data.data;
  },

  async getAvailableSlots(doctorId: string, date: string): Promise<Slot[]> {
    const response = await api.get<ApiResponse<{ date: string; slots: Slot[] }>>(
      `/search/doctors/${doctorId}/slots?date=${date}`
    );
    return response.data.data.slots;
  },
};
