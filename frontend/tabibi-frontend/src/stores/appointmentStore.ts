import { create } from "zustand";
import type { Appointment, BookAppointmentData, RescheduleData, AppointmentQuery } from "@/types/appointment.types";
import type { Pagination } from "@/types/api.types";
import { patientService } from "@/services/patient.service";

interface AppointmentState {
  appointments: Appointment[];
  currentAppointment: Appointment | null;
  pagination: Pagination;
  isLoading: boolean;
  error: string | null;

  fetchAppointments: (params?: AppointmentQuery) => Promise<void>;
  fetchById: (id: string) => Promise<void>;
  bookAppointment: (data: BookAppointmentData) => Promise<Appointment>;
  cancelAppointment: (id: string) => Promise<void>;
  rescheduleAppointment: (id: string, data: RescheduleData) => Promise<Appointment>;
}

const defaultPagination: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

export const useAppointmentStore = create<AppointmentState>((set) => ({
  appointments: [],
  currentAppointment: null,
  pagination: defaultPagination,
  isLoading: false,
  error: null,

  fetchAppointments: async (params?: AppointmentQuery) => {
    set({ isLoading: true, error: null });
    try {
      const response = await patientService.getAppointments(params);
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
      const appointment = await patientService.getAppointmentById(id);
      set({ currentAppointment: appointment, isLoading: false });
    } catch (err: unknown) {
      const message = (err as { message?: string }).message || "Failed to fetch appointment";
      set({ error: message, isLoading: false });
    }
  },

  bookAppointment: async (data: BookAppointmentData) => {
    set({ isLoading: true, error: null });
    try {
      const appointment = await patientService.bookAppointment(data);
      set({ isLoading: false });
      return appointment;
    } catch (err: unknown) {
      const message = (err as { message?: string }).message || "Failed to book appointment";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  cancelAppointment: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await patientService.cancelAppointment(id);
      set((state) => ({
        appointments: state.appointments.map((a) =>
          a.id === id ? { ...a, status: "CANCELLED" as const } : a
        ),
        currentAppointment:
          state.currentAppointment?.id === id
            ? { ...state.currentAppointment, status: "CANCELLED" as const }
            : state.currentAppointment,
        isLoading: false,
      }));
    } catch (err: unknown) {
      const message = (err as { message?: string }).message || "Failed to cancel appointment";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  rescheduleAppointment: async (id: string, data: RescheduleData) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await patientService.rescheduleAppointment(id, data);
      set((state) => ({
        appointments: state.appointments.map((a) =>
          a.id === id ? updated : a
        ),
        currentAppointment: updated,
        isLoading: false,
      }));
      return updated;
    } catch (err: unknown) {
      const message = (err as { message?: string }).message || "Failed to reschedule appointment";
      set({ error: message, isLoading: false });
      throw err;
    }
  },
}));
