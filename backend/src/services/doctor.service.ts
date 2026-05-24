import { AppointmentRepository } from "../repositories/appointment.repository";
import { DoctorRepository } from "../repositories/doctor.repository";
import { ScheduleRepository } from "../repositories/schedule.repository";
import { UserRepository } from "../repositories/user.repository";
import { ScheduleUtils } from "../utils/schedule.utils";
import { BadRequestError, NotFoundError } from "../utils/errors/app.error";
import { Appointment, AppointmentStatus, Schedule, Doctor, Gender } from "@prisma/client";

export interface DoctorAppointmentQuery {
  status?: AppointmentStatus;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

export interface PaginatedAppointments {
  appointments: Appointment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface DoctorScheduleData {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
  timeSlotDuration?: string;
}

export interface DoctorProfileUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: Gender;
  dateOfBirth?: Date;
  consultationFee?: string;
  experienceYears?: string;
  bio?: string;
  specialty?: string;
  location?: string;
  education?: string;
}

export class DoctorService {
  private appointmentRepository: AppointmentRepository;
  private doctorRepository: DoctorRepository;
  private scheduleRepository: ScheduleRepository;
  private userRepository: UserRepository;

  constructor() {
    this.appointmentRepository = new AppointmentRepository();
    this.doctorRepository = new DoctorRepository();
    this.scheduleRepository = new ScheduleRepository();
    this.userRepository = new UserRepository();
  }

  async getAppointments(doctorUserId: string, params: DoctorAppointmentQuery): Promise<PaginatedAppointments> {
    // Get doctor profile ID using the user ID
    const doctorProfile = await this.doctorRepository.findByUserId(doctorUserId);
    if (!doctorProfile) {
      throw new NotFoundError("Doctor profile not found");
    }

    const doctorId = doctorProfile.id;
    const {
      status,
      dateFrom,
      dateTo,
      page,
      limit
    } = params;

    const queryParams: Partial<DoctorAppointmentQuery> = {
      page,
      limit,
    };

    if (status) {
      queryParams.status = status;
    }

    if (dateFrom) {
      queryParams.dateFrom = new Date(dateFrom);
    }

    if (dateTo) {
      queryParams.dateTo = new Date(dateTo);
    }

    const appointments = await this.appointmentRepository.findAppointmentsByDoctor(
      doctorId,
      queryParams
    );

    const total = await this.appointmentRepository.countAppointments({
      doctorId,
      ...(status && { status: status as AppointmentStatus }),
    });

    return {
      appointments,
      pagination: {
        page: queryParams.page || 1,
        limit: queryParams.limit || 10,
        total,
      },
    };
  }

  async getAppointmentById(doctorUserId: string, appointmentId: string): Promise<Appointment> {
    // Get doctor profile ID using the user ID
    const doctorProfile = await this.doctorRepository.findByUserId(doctorUserId);
    if (!doctorProfile) {
      throw new NotFoundError("Doctor profile not found");
    }

    const doctorId = doctorProfile.id;

    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundError("Appointment not found");
    }

    // Ensure doctor owns this appointment
    if (appointment.doctorId !== doctorId) {
      throw new NotFoundError("Appointment not found");
    }

    return appointment;
  }

  async updateAppointmentStatus(doctorUserId: string, appointmentId: string, status: string): Promise<Appointment> {
    // Get doctor profile ID using the user ID
    const doctorProfile = await this.doctorRepository.findByUserId(doctorUserId);
    if (!doctorProfile) {
      throw new NotFoundError("Doctor profile not found");
    }

    const doctorId = doctorProfile.id;

    if (!status) {
      throw new BadRequestError("Status is required");
    }

    // Validate status
    if (!Object.values(AppointmentStatus).includes(status as AppointmentStatus)) {
      throw new BadRequestError("Invalid status");
    }

    // Find appointment
    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundError("Appointment not found");
    }

    // Ensure doctor owns this appointment
    if (appointment.doctorId !== doctorId) {
      throw new NotFoundError("Appointment not found");
    }

    // Update appointment status
    const updatedAppointment = await this.appointmentRepository.update(appointmentId, {
      status: status as AppointmentStatus,
    });

    return updatedAppointment;
  }

  async getSchedule(doctorUserId: string): Promise<Schedule> {
    // Get doctor profile to get the doctorId (profile ID)
    const doctor = await this.doctorRepository.findByUserId(doctorUserId);
    if (!doctor) {
      throw new NotFoundError("Doctor profile not found");
    }

    const doctorId = doctor.id;

    // Get doctor's schedule
    const schedule = await this.scheduleRepository.findByDoctorId(doctorId);
    if (!schedule) {
      throw new NotFoundError("Schedule not found");
    }

    return schedule;
  }

  async updateSchedule(doctorUserId: string, scheduleData: DoctorScheduleData): Promise<Schedule> {
    // Get doctor profile to get the doctorId (profile ID)
    const doctor = await this.doctorRepository.findByUserId(doctorUserId);
    if (!doctor) {
      throw new NotFoundError("Doctor profile not found");
    }

    const doctorId = doctor.id;

    // Validate schedule data
    const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    for (const day of weekdays) {
      const dayScheduleValue = scheduleData[day as keyof DoctorScheduleData];
      if (typeof dayScheduleValue === "string") {
        try {
          JSON.parse(dayScheduleValue);
        } catch {
          throw new BadRequestError(`Invalid JSON format for ${day} schedule`);
        }

        const daySchedule = ScheduleUtils.parseScheduleDay(dayScheduleValue);
        if (!daySchedule) {
          throw new BadRequestError(`Invalid schedule data for ${day}`);
        }
      }
    }

    // Update or create schedule
    const schedule = await this.scheduleRepository.upsert(doctorId, {
      ...scheduleData,
      timeSlotDuration: scheduleData.timeSlotDuration ? parseInt(scheduleData.timeSlotDuration) : undefined,
    });

    return schedule;
  }

  async getProfile(doctorUserId: string): Promise<Doctor> {
    const doctor = await this.doctorRepository.findByUserId(doctorUserId);
    if (!doctor) {
      throw new NotFoundError("Doctor profile not found");
    }

    return doctor;
  }

  async updateProfile(doctorUserId: string, updateData: DoctorProfileUpdateData): Promise<Doctor> {
    const doctor = await this.doctorRepository.findByUserId(doctorUserId);
    if (!doctor) {
      throw new NotFoundError("Doctor profile not found");
    }

    const { firstName, lastName, phone, gender, dateOfBirth, ...doctorFields } = updateData;

    if (firstName !== undefined || lastName !== undefined || phone !== undefined || gender !== undefined || dateOfBirth !== undefined) {
      await this.userRepository.update(doctorUserId, {
        firstName,
        lastName,
        phone,
        gender,
        dateOfBirth,
      });
    }

    const updatedDoctor = await this.doctorRepository.update(doctor.id, {
      ...doctorFields,
      consultationFee: updateData.consultationFee ? parseFloat(updateData.consultationFee) : undefined,
      experienceYears: updateData.experienceYears ? parseInt(updateData.experienceYears) : undefined,
    });

    return updatedDoctor;
  }
}
