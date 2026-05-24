import { DoctorRepository } from "../repositories/doctor.repository";
import { ScheduleRepository } from "../repositories/schedule.repository";
import { AppointmentRepository } from "../repositories/appointment.repository";
import { ScheduleUtils } from "../utils/schedule.utils";
import { BadRequestError, NotFoundError } from "../utils/errors/app.error";
import { Doctor } from "@prisma/client";
import { AvailableSlot } from "../types/schedule.types";

export interface SearchDoctorResult {
  doctors: Doctor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface SearchDoctorParams {
  specialty?: string;
  location?: string;
  search?: string;
  page?: number;
  limit?: number;
  minRating?: number;
}

export class SearchService {
  private doctorRepository: DoctorRepository;
  private scheduleRepository: ScheduleRepository;
  private appointmentRepository: AppointmentRepository;

  constructor() {
    this.doctorRepository = new DoctorRepository();
    this.scheduleRepository = new ScheduleRepository();
    this.appointmentRepository = new AppointmentRepository();
  }

  async searchDoctors(params: SearchDoctorParams): Promise<SearchDoctorResult> {
    const {
      specialty,
      location,
      search,
      page,
      limit,
      minRating
    } = params;

    // Validate that at least one search parameter is provided
    if (!specialty && !location && !search) {
      throw new BadRequestError("At least one search parameter (specialty, location, or search) is required");
    }

    const searchParams: Partial<SearchDoctorParams> = {
      specialty,
      location,
      search,
      page,
      limit,
      minRating,
    };

    const doctors = await this.doctorRepository.search(searchParams);
    const total = await this.doctorRepository.count(searchParams);

    return {
      doctors,
      pagination: {
        page: searchParams.page || 1,
        limit: searchParams.limit || 10,
        total,
      },
    };
  }

  async getDoctorById(id: string): Promise<Doctor> {
    const doctor = await this.doctorRepository.findById(id);
    if (!doctor) {
      throw new NotFoundError("Doctor not found");
    }
    return doctor;
  }

  async getFeaturedDoctors(limit: number = 10): Promise<Doctor[]> {
    return this.doctorRepository.getTopRated(limit);
  }

  async getAvailableSlots(doctorId: string, date: string): Promise<{ date: string; slots: AvailableSlot[] }> {
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      throw new BadRequestError("Invalid date format");
    }

    const doctor = await this.doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new NotFoundError("Doctor not found");
    }

    const schedule = await this.scheduleRepository.findByDoctorId(doctorId);
    if (!schedule) {
      return { date, slots: [] };
    }

    const dayOfWeek = appointmentDate.getDay();
    const dayName = ScheduleUtils.getWeekdayName(dayOfWeek);
    const daySchedule = ScheduleUtils.getDaySchedule(
      dayOfWeek,
      schedule[dayName as keyof typeof schedule] as string | undefined
    );

    const bookedSlots = await this.appointmentRepository.getBookedSlots(doctorId, appointmentDate);

    const slots = ScheduleUtils.generateAvailableSlots(
      daySchedule,
      appointmentDate,
      schedule.timeSlotDuration,
      bookedSlots
    );

    return { date, slots };
  }
}
