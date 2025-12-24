import { Router, Request, Response } from "express";
import { catchAsync } from "../middleware/error.middleware";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { AppointmentRepository } from "../repositories/appointment.repository";
import { DoctorRepository } from "../repositories/doctor.repository";
import { ScheduleRepository } from "../repositories/schedule.repository";
import { PatientRepository } from "../repositories/patient.repository";
import { AppointmentUtils } from "../utils/appointment.utils";
import { ScheduleUtils } from "../utils/schedule.utils";
import { BadRequestError, NotFoundError } from "../utils/errors/app.error";
import { Role, AppointmentStatus } from "@prisma/client";

const router = Router();
const appointmentRepository = new AppointmentRepository();
const doctorRepository = new DoctorRepository();
const scheduleRepository = new ScheduleRepository();
const patientRepository = new PatientRepository();

// All routes require authentication and patient authorization
router.use(authenticate, authorize(Role.PATIENT));

// Book an appointment
router.post(
  "/appointments",
  catchAsync(async (req: Request, res: Response) => {
    const { doctorId, date, timeSlot, reason } = req.body;
    // Get patient profile ID using the user ID
    const patientProfile = await patientRepository.findByUserId(req.user?.id!);
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
    const doctor = await doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new NotFoundError("Doctor not found");
    }

    // Get doctor's schedule
    const schedule = await scheduleRepository.findByDoctorId(doctorId);
    if (!schedule) {
      throw new BadRequestError("Doctor schedule not configured");
    }

    // Get booked slots for this date
    const bookedSlots = await appointmentRepository.getBookedSlots(doctorId, appointmentDate);

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
    const appointment = await appointmentRepository.create({
      patientId: patientId!,
      doctorId,
      date: appointmentDate,
      timeSlot,
      reason,
    });

    res.status(201).json({
      status: "success",
      message: "Appointment booked successfully",
      data: appointment,
    });
  })
);

// Get all appointments for patient
router.get(
  "/appointments",
  catchAsync(async (req: Request, res: Response) => {
    // Get patient profile ID using the user ID
    const patientProfile = await patientRepository.findByUserId(req.user?.id!);
    if (!patientProfile) {
      throw new BadRequestError("Patient profile not found");
    }
    const patientId = patientProfile.id;
    const { status, dateFrom, dateTo, page, limit } = req.query;

    const params: any = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    };

    if (status) {
      params.status = status;
    }

    if (dateFrom) {
      params.dateFrom = new Date(dateFrom as string);
    }

    if (dateTo) {
      params.dateTo = new Date(dateTo as string);
    }

    const appointments = await appointmentRepository.findAppointmentsByPatient(
      patientId!,
      params
    );

    const total = await appointmentRepository.countAppointments({
      patientId: patientId!,
      ...(status && { status: status as AppointmentStatus }),
    });

    res.status(200).json({
      status: "success",
      message: "Appointments retrieved successfully",
      data: {
        appointments,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total,
        },
      },
    });
  })
);

// Get appointment by ID
router.get(
  "/appointments/:id",
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    // Get patient profile ID using the user ID
    const patientProfile = await patientRepository.findByUserId(req.user?.id!);
    if (!patientProfile) {
      throw new BadRequestError("Patient profile not found");
    }
    const patientId = patientProfile.id;

    const appointment = await appointmentRepository.findById(id);

    if (!appointment) {
      throw new NotFoundError("Appointment not found");
    }

    // Ensure patient owns this appointment
    if (appointment.patientId !== patientId) {
      throw new NotFoundError("Appointment not found");
    }

    res.status(200).json({
      status: "success",
      message: "Appointment retrieved successfully",
      data: appointment,
    });
  })
);

// Cancel an appointment
router.patch(
  "/appointments/:id/cancel",
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    // Get patient profile ID using the user ID
    const patientProfile = await patientRepository.findByUserId(req.user?.id!);
    if (!patientProfile) {
      throw new BadRequestError("Patient profile not found");
    }
    const patientId = patientProfile.id;

    // Find appointment
    const appointment = await appointmentRepository.findById(id);

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
    const updatedAppointment = await appointmentRepository.update(id, {
      status: AppointmentStatus.CANCELLED,
    });

    res.status(200).json({
      status: "success",
      message: "Appointment cancelled successfully",
      data: updatedAppointment,
    });
  })
);

// Reschedule an appointment
router.patch(
  "/appointments/:id/reschedule",
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { date, timeSlot } = req.body;
    // Get patient profile ID using the user ID
    const patientProfile = await patientRepository.findByUserId(req.user?.id!);
    if (!patientProfile) {
      throw new BadRequestError("Patient profile not found");
    }
    const patientId = patientProfile.id;

    if (!date || !timeSlot) {
      throw new BadRequestError("Date and time slot are required");
    }

    // Find appointment
    const appointment = await appointmentRepository.findById(id);

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
    const schedule = await scheduleRepository.findByDoctorId(appointment.doctorId);
    if (!schedule) {
      throw new BadRequestError("Doctor schedule not configured");
    }

    // Get booked slots for new date
    const bookedSlots = await appointmentRepository.getBookedSlots(appointment.doctorId, newDate);

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
    const updatedAppointment = await appointmentRepository.update(id, {
      date: newDate,
      timeSlot,
      status: AppointmentStatus.PENDING, // Reset status to pending
    });

    res.status(200).json({
      status: "success",
      message: "Appointment rescheduled successfully",
      data: updatedAppointment,
    });
  })
);

export default router;
