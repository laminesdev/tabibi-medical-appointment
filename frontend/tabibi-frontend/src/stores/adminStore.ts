import { create } from "zustand";
import type { DashboardData, Pagination } from "@/types/api.types";
import type { DoctorProfile } from "@/types/doctor.types";
import type { IUser } from "@/types/auth.types";
import { adminService, type AdminQuery } from "@/services/admin.service";

interface AdminState {
  dashboard: DashboardData | null;
  doctors: DoctorProfile[];
  users: IUser[];
  currentDoctor: DoctorProfile | null;
  currentUser: IUser | null;
  pagination: Pagination;
  isLoading: boolean;
  error: string | null;

  fetchDashboard: (dateRange?: { startDate?: string; endDate?: string }) => Promise<void>;
  fetchDoctors: (params?: AdminQuery) => Promise<void>;
  fetchDoctorById: (id: string) => Promise<void>;
  createDoctor: (data: Partial<DoctorProfile> & { email: string; password: string }) => Promise<void>;
  updateDoctor: (id: string, data: Partial<DoctorProfile>) => Promise<void>;
  removeDoctor: (id: string) => Promise<void>;
  fetchUsers: (params?: AdminQuery) => Promise<void>;
  fetchUserById: (id: string) => Promise<void>;
  updateUser: (id: string, data: Partial<IUser>) => Promise<void>;
  deactivateUser: (id: string) => Promise<void>;
  reactivateUser: (id: string) => Promise<void>;
}

const defaultPagination: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

export const useAdminStore = create<AdminState>((set) => ({
  dashboard: null,
  doctors: [],
  users: [],
  currentDoctor: null,
  currentUser: null,
  pagination: defaultPagination,
  isLoading: false,
  error: null,

  fetchDashboard: async (dateRange) => {
    set({ isLoading: true, error: null });
    try {
      const dashboard = await adminService.getDashboard(dateRange);
      set({ dashboard, isLoading: false });
    } catch (err: unknown) {
      const message = (err as { message?: string }).message || "Failed to fetch dashboard";
      set({ error: message, isLoading: false });
    }
  },

  fetchDoctors: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.getDoctors(params);
      set({ doctors: response.data, pagination: response.pagination, isLoading: false });
    } catch (err: unknown) {
      const message = (err as { message?: string }).message || "Failed to fetch doctors";
      set({ error: message, isLoading: false });
    }
  },

  fetchDoctorById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const doctor = await adminService.getDoctorById(id);
      set({ currentDoctor: doctor, isLoading: false });
    } catch (err: unknown) {
      const message = (err as { message?: string }).message || "Failed to fetch doctor";
      set({ error: message, isLoading: false });
    }
  },

  createDoctor: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await adminService.createDoctor(data);
      set({ isLoading: false });
    } catch (err: unknown) {
      const message = (err as { message?: string }).message || "Failed to create doctor";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateDoctor: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await adminService.updateDoctor(id, data);
      const updated = await adminService.getDoctorById(id);
      set((state) => ({
        doctors: state.doctors.map((d) => (d.id === id ? updated : d)),
        currentDoctor: updated,
        isLoading: false,
      }));
    } catch (err: unknown) {
      const message = (err as { message?: string }).message || "Failed to update doctor";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  removeDoctor: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await adminService.removeDoctor(id);
      set((state) => ({
        doctors: state.doctors.filter((d) => d.id !== id),
        isLoading: false,
      }));
    } catch (err: unknown) {
      const message = (err as { message?: string }).message || "Failed to remove doctor";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  fetchUsers: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.getUsers(params);
      set({ users: response.data, pagination: response.pagination, isLoading: false });
    } catch (err: unknown) {
      const message = (err as { message?: string }).message || "Failed to fetch users";
      set({ error: message, isLoading: false });
    }
  },

  fetchUserById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const user = await adminService.getUserById(id);
      set({ currentUser: user, isLoading: false });
    } catch (err: unknown) {
      const message = (err as { message?: string }).message || "Failed to fetch user";
      set({ error: message, isLoading: false });
    }
  },

  updateUser: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await adminService.updateUser(id, data);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updated : u)),
        currentUser: updated,
        isLoading: false,
      }));
    } catch (err: unknown) {
      const message = (err as { message?: string }).message || "Failed to update user";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  deactivateUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await adminService.deactivateUser(id);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? { ...u, isActive: false } : u)),
        currentUser: state.currentUser?.id === id ? { ...state.currentUser, isActive: false } : state.currentUser,
        isLoading: false,
      }));
    } catch (err: unknown) {
      const message = (err as { message?: string }).message || "Failed to deactivate user";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  reactivateUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await adminService.reactivateUser(id);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? { ...u, isActive: true } : u)),
        currentUser: state.currentUser?.id === id ? { ...state.currentUser, isActive: true } : state.currentUser,
        isLoading: false,
      }));
    } catch (err: unknown) {
      const message = (err as { message?: string }).message || "Failed to reactivate user";
      set({ error: message, isLoading: false });
      throw err;
    }
  },
}));
