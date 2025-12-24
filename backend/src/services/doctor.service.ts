import { AppointmentRepository } from "../repositories/appointment.repository";
import { DoctorRepository } from "../repositories/doctor.repository";
import { ScheduleRepository } from "../repositories/schedule.repository";
import { ScheduleUtils } from "../utils/schedule.utils";
import { BadRequestError, NotFoundError } from "../utils/errors/app.error";
import { AppointmentStatus } from "@prisma/client";

export interface DoctorAppointmentQuery {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface DoctorScheduleData {
  [key: string]: any;
  timeSlotDuration?: string;
}

export interface DoctorProfileUpdateData {
  [key: string]: any;
  consultationFee?: string;
  experienceYears?: string;
}

export class DoctorService {
  private appointmentRepository: AppointmentRepository;
  private doctorRepository: DoctorRepository;
  private scheduleRepository: ScheduleRepository;

  constructor() {
    this.appointmentRepository = new AppointmentRepository();
    this.doctorRepository = new DoctorRepository();
    this.scheduleRepository = new ScheduleRepository();
  }

  async getAppointments(doctorUserId: string, params: DoctorAppointmentQuery): Promise<any> {
    // Get doctor profile ID using the user ID
    const doctorProfile = await this.doctorRepository.findByUserId(doctorUserId);
    if (!doctorProfile) {
      throw new BadRequestError("Doctor profile not found");
    }

    const doctorId = doctorProfile.id;
    const {
      status,
      dateFrom,
      dateTo,
      page,
      limit
    } = params;

    const queryParams: any = {
      page: page ? parseInt(page as any) : undefined,
      limit: limit ? parseInt(limit as any) : undefined,
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

  async getAppointmentById(doctorUserId: string, appointmentId: string): Promise<any> {
    // Get doctor profile ID using the user ID
    const doctorProfile = await this.doctorRepository.findByUserId(doctorUserId);
    if (!doctorProfile) {
      throw new BadRequestError("Doctor profile not found");
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

  async updateAppointmentStatus(doctorUserId: string, appointmentId: string, status: string): Promise<any> {
    // Get doctor profile ID using the user ID
    const doctorProfile = await this.doctorRepository.findByUserId(doctorUserId);
    if (!doctorProfile) {
      throw new BadRequestError("Doctor profile not found");
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

  async getSchedule(doctorUserId: string): Promise<any> {
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

  async updateSchedule(doctorUserId: string, scheduleData: DoctorScheduleData): Promise<any> {
    // Get doctor profile to get the doctorId (profile ID)
    const doctor = await this.doctorRepository.findByUserId(doctorUserId);
    if (!doctor) {
      throw new NotFoundError("Doctor profile not found");
    }

    const doctorId = doctor.id;

    // Validate schedule data
    const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    for (const day of weekdays) {
      if (scheduleData[day]) {
        try {
          // Try to parse the schedule data to validate JSON
          JSON.parse(scheduleData[day]);

          // Validate the parsed schedule
          const daySchedule = ScheduleUtils.parseScheduleDay(scheduleData[day]);
          if (!daySchedule) {
            throw new BadRequestError(`Invalid schedule data for ${day}`);
          }
        } catch (error) {
          throw new BadRequestError(`Invalid JSON format for ${day} schedule`);
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

  async getProfile(doctorUserId: string): Promise<any> {
    const doctor = await this.doctorRepository.findByUserId(doctorUserId);
    if (!doctor) {
      throw new NotFoundError("Doctor profile not found");
    }

    return doctor;
  }

  async updateProfile(doctorUserId: string, updateData: DoctorProfileUpdateData): Promise<any> {
    // Get doctor profile
    const doctor = await this.doctorRepository.findByUserId(doctorUserId);
    if (!doctor) {
      throw new NotFoundError("Doctor profile not found");
    }

    // Update doctor profile
    const updatedDoctor = await this.doctorRepository.update(doctor.id, {
      ...updateData,
      consultationFee: updateData.consultationFee ? parseFloat(updateData.consultationFee) : undefined,
      experienceYears: updateData.experienceYears ? parseInt(updateData.experienceYears) : undefined,
    });

    return updatedDoctor;
  }
}
