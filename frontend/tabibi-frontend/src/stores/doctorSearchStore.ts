import { create } from "zustand";
import type { DoctorSummary } from "@/types/doctor.types";
import type { Pagination } from "@/types/api.types";
import { searchService, type SearchFilters } from "@/services/search.service";

interface DoctorSearchState {
  results: DoctorSummary[];
  pagination: Pagination;
  filters: SearchFilters;
  isLoading: boolean;
  error: string | null;

  search: (filters: SearchFilters) => Promise<void>;
  clearFilters: () => void;
  setPage: (page: number) => Promise<void>;
}

const defaultPagination: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

export const useDoctorSearchStore = create<DoctorSearchState>((set, get) => ({
  results: [],
  pagination: defaultPagination,
  filters: {},
  isLoading: false,
  error: null,

  search: async (filters: SearchFilters) => {
    set({ isLoading: true, error: null, filters });
    try {
      const response = await searchService.searchDoctors(filters);
      set({
        results: response.data,
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (err: unknown) {
      const message = (err as { message?: string }).message || "Failed to search doctors";
      set({ error: message, isLoading: false });
    }
  },

  clearFilters: () => {
    set({ filters: {}, results: [], pagination: defaultPagination, error: null });
  },

  setPage: async (page: number) => {
    const { filters } = get();
    await get().search({ ...filters, page });
  },
}));
