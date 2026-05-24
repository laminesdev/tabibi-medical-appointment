import { create } from "zustand";
import type { Appointment, AppointmentQuery, AppointmentStatus } from "@/types/appointment.types";
import type { Pagination } from "@/types/api.types";
import { doctorService } from "@/services/doctor.service";

interface DoctorAppointmentState {
  appointments: Appointment[];
  currentAppointment: Appointment | null;
  pagination: Pagination;
  isLoading: boolean;
  error: string | null;

  fetchAppointments: (params?: AppointmentQuery) => Promise<void>;
  fetchById: (id: string) => Promise<void>;
  updateStatus: (id: string, status: AppointmentStatus) => Promise<void>;
}

const defaultPagination: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

export const useDoctorAppointmentStore = create<DoctorAppointmentState>((set) => ({
  appointments: [],
  currentAppointment: null,
  pagination: defaultPagination,
  isLoading: false,
  error: null,

  fetchAppointments: async (params?: AppointmentQuery) => {
    set({ isLoading: true, error: null });
    try {
      const response = await doctorService.getAppointments(params);
      set({
        appointments: response.data,
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (err: unknown) {
      const message = (err as { message?: string }).message || "Failed to fetch appointments";
      set({ error: message, isLoading: false });
    }
  },

  fetchById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const appointment = await doctorService.getAppointmentById(id);
      set({ currentAppointment: appointment, isLoading: false });
    } catch (err: unknown) {
      const message = (err as { message?: string }).message || "Failed to fetch appointment";
      set({ error: message, isLoading: false });
    }
  },

  updateStatus: async (id: string, status: AppointmentStatus) => {
    const updated = await doctorService.updateStatus(id, status);
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === id ? updated : a
      ),
      currentAppointment:
        state.currentAppointment?.id === id ? updated : state.currentAppointment,
    }));
  },
}));
