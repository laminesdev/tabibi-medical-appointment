export interface ScheduleDayConfig {
   isWorkingDay: boolean;
   startTime?: string;
   endTime?: string;
   breaks?: Array<{ start: string; end: string }>;
}

// Renamed to avoid conflict with doctor.types.ts
export interface AvailableSlot {
   time: string;
   endTime: string;
   isAvailable: boolean;
   isBreak?: boolean;
}

export interface DoctorAvailability {
   doctorId: string;
   date: Date;
   availableSlots: string[];
   bookedSlots: string[];
   schedule?: ScheduleDayConfig;
}
