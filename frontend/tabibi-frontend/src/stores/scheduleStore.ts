import { create } from "zustand";
import type { ScheduleData } from "@/types/doctor.types";
import { doctorService } from "@/services/doctor.service";

interface ScheduleState {
  schedule: ScheduleData | null;
  isLoading: boolean;
  error: string | null;

  fetchSchedule: () => Promise<void>;
  updateSchedule: (data: ScheduleData) => Promise<void>;
}

function createDefaultDay(isWorkingDay = false) {
  return {
    isWorkingDay,
    startTime: "09:00",
    endTime: "17:00",
    breaks: [] as { start: string; end: string }[],
  };
}

const defaultSchedule: ScheduleData = {
  monday: createDefaultDay(),
  tuesday: createDefaultDay(),
  wednesday: createDefaultDay(),
  thursday: createDefaultDay(),
  friday: createDefaultDay(),
  saturday: createDefaultDay(),
  sunday: createDefaultDay(),
  timeSlotDuration: 30,
};

export const useScheduleStore = create<ScheduleState>((set) => ({
  schedule: null,
  isLoading: false,
  error: null,

  fetchSchedule: async () => {
    set({ isLoading: true, error: null });
    try {
      const schedule = await doctorService.getSchedule();
      set({ schedule, isLoading: false });
    } catch (err: unknown) {
      const message = (err as { message?: string }).message || "Failed to fetch schedule";
      set({ error: message, isLoading: false });
    }
  },

  updateSchedule: async (data: ScheduleData) => {
    set({ isLoading: true, error: null });
    try {
      const schedule = await doctorService.updateSchedule(data);
      set({ schedule, isLoading: false });
    } catch (err: unknown) {
      const message = (err as { message?: string }).message || "Failed to update schedule";
      set({ error: message, isLoading: false });
      throw err;
    }
  },
}));

export { defaultSchedule };
