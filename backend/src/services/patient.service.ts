import { AppointmentRepository } from "../repositories/appointment.repository";
import { DoctorRepository } from "../repositories/doctor.repository";
import { ScheduleRepository } from "../repositories/schedule.repository";
import { PatientRepository } from "../repositories/patient.repository";
import { AppointmentUtils } from "../utils/appointment.utils";
import { ScheduleUtils } from "../utils/schedule.utils";
import { BadRequestError, NotFoundError } from "../utils/errors/app.error";
import { AppointmentStatus } from "@prisma/client";

export interface BookAppointmentData {
  doctorId: string;
  date: string;
  timeSlot: string;
  reason?: string;
}

export interface PatientAppointmentQuery {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface RescheduleAppointmentData {
  date: string;
  timeSlot: string;
}

export class PatientService {
  private appointmentRepository: AppointmentRepository;
  private doctorRepository: DoctorRepository;
  private scheduleRepository: ScheduleRepository;
  private patientRepository: PatientRepository;

  constructor() {
    this.appointmentRepository = new AppointmentRepository();
    this.doctorRepository = new DoctorRepository();
    this.scheduleRepository = new ScheduleRepository();
    this.patientRepository = new PatientRepository();
  }

  async bookAppointment(patientUserId: string, data: BookAppointmentData): Promise<any> {
    const { doctorId, date, timeSlot, reason } = data;

    // Get patient profile ID using the user ID
    const patientProfile = await this.patientRepository.findByUserId(patientUserId);
    if (!patientProfile) {
      throw new BadRequestError("Patient profile not found");
    }

    const patientId = patientProfile.id;

    if (!doctorId || !date || !timeSlot) {
      throw new BadRequestError("Doctor ID, date, and time slot are required");
    }

    // Validate date format
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      throw new BadRequestError("Invalid date format");
    }

    // Validate time slot format
    if (!AppointmentUtils.isValidTimeSlotFormat(timeSlot)) {
      throw new BadRequestError("Invalid time slot format");
    }

    // Check if doctor exists
    const doctor = await this.doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new NotFoundError("Doctor not found");
    }

    // Get doctor's schedule
    const schedule = await this.scheduleRepository.findByDoctorId(doctorId);
    if (!schedule) {
      throw new BadRequestError("Doctor schedule not configured");
    }

    // Get booked slots for this date
    const bookedSlots = await this.appointmentRepository.getBookedSlots(doctorId, appointmentDate);

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = appointmentDate.getDay();
    const dayName = ScheduleUtils.getWeekdayName(dayOfWeek);

    // Get schedule for this day
    const daySchedule = ScheduleUtils.getDaySchedule(dayOfWeek, schedule[dayName as keyof typeof schedule] as string | undefined);

    // Validate appointment time
    const validation = AppointmentUtils.validateAppointmentTime(
      daySchedule,
      appointmentDate,
      timeSlot,
      bookedSlots,
      schedule.timeSlotDuration
    );

    if (!validation.isValid) {
      throw new BadRequestError(validation.message || "Invalid appointment time");
    }

    // Create appointment
    const appointment = await this.appointmentRepository.create({
      patientId: patientId,
      doctorId,
      date: appointmentDate,
      timeSlot,
      reason,
    });

    return appointment;
  }

  async getAppointments(patientUserId: string, params: PatientAppointmentQuery): Promise<any> {
    // Get patient profile ID using the user ID
    const patientProfile = await this.patientRepository.findByUserId(patientUserId);
    if (!patientProfile) {
      throw new BadRequestError("Patient profile not found");
    }

    const patientId = patientProfile.id;
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

    const appointments = await this.appointmentRepository.findAppointmentsByPatient(
      patientId,
      queryParams
    );

    const total = await this.appointmentRepository.countAppointments({
      patientId,
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

  async getAppointmentById(patientUserId: string, appointmentId: string): Promise<any> {
    // Get patient profile ID using the user ID
    const patientProfile = await this.patientRepository.findByUserId(patientUserId);
    if (!patientProfile) {
      throw new BadRequestError("Patient profile not found");
    }

    const patientId = patientProfile.id;

    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundError("Appointment not found");
    }

    // Ensure patient owns this appointment
    if (appointment.patientId !== patientId) {
      throw new NotFoundError("Appointment not found");
    }

    return appointment;
  }

  async cancelAppointment(patientUserId: string, appointmentId: string): Promise<any> {
    // Get patient profile ID using the user ID
    const patientProfile = await this.patientRepository.findByUserId(patientUserId);
    if (!patientProfile) {
      throw new BadRequestError("Patient profile not found");
    }

    const patientId = patientProfile.id;

    // Find appointment
    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundError("Appointment not found");
    }

    // Ensure patient owns this appointment
    if (appointment.patientId !== patientId) {
      throw new NotFoundError("Appointment not found");
    }

    // Check if appointment can be cancelled
    if (!AppointmentUtils.canCancelOrReschedule(appointment.date)) {
      throw new BadRequestError("Appointment cannot be cancelled (too close to appointment time)");
    }

    // Update status to cancelled
    const updatedAppointment = await this.appointmentRepository.update(appointmentId, {
      status: AppointmentStatus.CANCELLED,
    });

    return updatedAppointment;
  }

  async rescheduleAppointment(patientUserId: string, appointmentId: string, data: RescheduleAppointmentData): Promise<any> {
    const { date, timeSlot } = data;

    // Get patient profile ID using the user ID
    const patientProfile = await this.patientRepository.findByUserId(patientUserId);
    if (!patientProfile) {
      throw new BadRequestError("Patient profile not found");
    }

    const patientId = patientProfile.id;

    if (!date || !timeSlot) {
      throw new BadRequestError("Date and time slot are required");
    }

    // Find appointment
    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundError("Appointment not found");
    }

    // Ensure patient owns this appointment
    if (appointment.patientId !== patientId) {
      throw new NotFoundError("Appointment not found");
    }

    // Check if appointment can be rescheduled
    if (!AppointmentUtils.canCancelOrReschedule(appointment.date)) {
      throw new BadRequestError("Appointment cannot be rescheduled (too close to appointment time)");
    }

    // Validate date format
    const newDate = new Date(date);
    if (isNaN(newDate.getTime())) {
      throw new BadRequestError("Invalid date format");
    }

    // Validate time slot format
    if (!AppointmentUtils.isValidTimeSlotFormat(timeSlot)) {
      throw new BadRequestError("Invalid time slot format");
    }

    // Check if doctor is available at new time
    const schedule = await this.scheduleRepository.findByDoctorId(appointment.doctorId);
    if (!schedule) {
      throw new BadRequestError("Doctor schedule not configured");
    }

    // Get booked slots for new date
    const bookedSlots = await this.appointmentRepository.getBookedSlots(appointment.doctorId, newDate);

    // Get day of week for new date
    const dayOfWeek = newDate.getDay();
    const dayName = ScheduleUtils.getWeekdayName(dayOfWeek);

    // Get schedule for this day
    const daySchedule = ScheduleUtils.getDaySchedule(dayOfWeek, schedule[dayName as keyof typeof schedule] as string | undefined);

    // Validate new appointment time
    const validation = AppointmentUtils.validateAppointmentTime(
      daySchedule,
      newDate,
      timeSlot,
      bookedSlots.filter(slot => slot !== appointment.timeSlot), // Exclude current slot
      schedule.timeSlotDuration
    );

    if (!validation.isValid) {
      throw new BadRequestError(validation.message || "Invalid appointment time");
    }

    // Update appointment
    const updatedAppointment = await this.appointmentRepository.update(appointmentId, {
      date: newDate,
      timeSlot,
      status: AppointmentStatus.PENDING, // Reset status to pending
    });

    return updatedAppointment;
  }
}
