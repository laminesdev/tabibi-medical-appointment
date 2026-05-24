export interface DoctorUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface DoctorSummary {
  id: string;
  userId: string;
  specialty: string;
  location: string;
  rating: number;
  totalReviews: number;
  consultationFee: number | null;
  experienceYears: number | null;
  education: string | null;
  bio: string | null;
  user: DoctorUser;
}

export interface DoctorProfile extends DoctorSummary {
  schedule: ScheduleData | null;
  user: DoctorUser & { gender?: "MALE" | "FEMALE"; isActive?: boolean };
}

export interface Slot {
  time: string;
  endTime: string;
  isAvailable: boolean;
  isBreak?: boolean;
}

export interface ScheduleDay {
  isWorkingDay: boolean;
  startTime: string;
  endTime: string;
  breaks: { start: string; end: string }[];
}

export interface ScheduleData {
  id?: string;
  doctorId?: string;
  monday: ScheduleDay | null;
  tuesday: ScheduleDay | null;
  wednesday: ScheduleDay | null;
  thursday: ScheduleDay | null;
  friday: ScheduleDay | null;
  saturday: ScheduleDay | null;
  sunday: ScheduleDay | null;
  timeSlotDuration: number;
}
