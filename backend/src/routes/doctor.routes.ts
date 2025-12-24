import { Router, Request, Response } from "express";
import { catchAsync } from "../middleware/error.middleware";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { AppointmentRepository } from "../repositories/appointment.repository";
import { DoctorRepository } from "../repositories/doctor.repository";
import { ScheduleRepository } from "../repositories/schedule.repository";
import { ScheduleUtils } from "../utils/schedule.utils";
import { BadRequestError, NotFoundError } from "../utils/errors/app.error";
import { Role, AppointmentStatus } from "@prisma/client";

const router = Router();
const appointmentRepository = new AppointmentRepository();
const doctorRepository = new DoctorRepository();
const scheduleRepository = new ScheduleRepository();

// All routes require authentication and doctor authorization
router.use(authenticate, authorize(Role.DOCTOR));

// Get all appointments for doctor
router.get(
  "/appointments",
  catchAsync(async (req: Request, res: Response) => {
    // Get doctor profile ID using the user ID
    const doctorProfile = await doctorRepository.findByUserId(req.user?.id!);
    if (!doctorProfile) {
      throw new BadRequestError("Doctor profile not found");
    }
    const doctorId = doctorProfile.id;
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

    const appointments = await appointmentRepository.findAppointmentsByDoctor(
      doctorId!,
      params
    );

    const total = await appointmentRepository.countAppointments({
      doctorId: doctorId!,
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
    // Get doctor profile ID using the user ID
    const doctorProfile = await doctorRepository.findByUserId(req.user?.id!);
    if (!doctorProfile) {
      throw new BadRequestError("Doctor profile not found");
    }
    const doctorId = doctorProfile.id;

    const appointment = await appointmentRepository.findById(id);

    if (!appointment) {
      throw new NotFoundError("Appointment not found");
    }

    // Ensure doctor owns this appointment
    if (appointment.doctorId !== doctorId) {
      throw new NotFoundError("Appointment not found");
    }

    res.status(200).json({
      status: "success",
      message: "Appointment retrieved successfully",
      data: appointment,
    });
  })
);

// Update appointment status
router.patch(
  "/appointments/:id/status",
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    // Get doctor profile ID using the user ID
    const doctorProfile = await doctorRepository.findByUserId(req.user?.id!);
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
    const appointment = await appointmentRepository.findById(id);

    if (!appointment) {
      throw new NotFoundError("Appointment not found");
    }

    // Ensure doctor owns this appointment
    if (appointment.doctorId !== doctorId) {
      throw new NotFoundError("Appointment not found");
    }

    // Update appointment status
    const updatedAppointment = await appointmentRepository.update(id, {
      status: status as AppointmentStatus,
    });

    res.status(200).json({
      status: "success",
      message: "Appointment status updated successfully",
      data: updatedAppointment,
    });
  })
);

// Get doctor's schedule
router.get(
  "/schedule",
  catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    // Get doctor profile to get the doctorId (profile ID)
    const doctor = await doctorRepository.findByUserId(userId!);
    if (!doctor) {
      throw new NotFoundError("Doctor profile not found");
    }
    const doctorId = doctor.id;

    // Get doctor's schedule
    const schedule = await scheduleRepository.findByDoctorId(doctorId!);

    if (!schedule) {
      throw new NotFoundError("Schedule not found");
    }

    res.status(200).json({
      status: "success",
      message: "Schedule retrieved successfully",
      data: schedule,
    });
  })
);

// Update doctor's schedule
router.put(
  "/schedule",
  catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    // Get doctor profile to get the doctorId (profile ID)
    const doctor = await doctorRepository.findByUserId(userId!);
    if (!doctor) {
      throw new NotFoundError("Doctor profile not found");
    }
    const doctorId = doctor.id;
    const scheduleData = req.body;

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
    const schedule = await scheduleRepository.upsert(doctorId!, {
      ...scheduleData,
      timeSlotDuration: scheduleData.timeSlotDuration 
        ? parseInt(scheduleData.timeSlotDuration) 
        : undefined,
    });

    res.status(200).json({
      status: "success",
      message: "Schedule updated successfully",
      data: schedule,
    });
  })
);

// Get doctor profile
router.get(
  "/profile",
  catchAsync(async (req: Request, res: Response) => {
    const doctorId = req.user?.id;

    const doctor = await doctorRepository.findByUserId(doctorId!);

    if (!doctor) {
      throw new NotFoundError("Doctor profile not found");
    }

    res.status(200).json({
      status: "success",
      message: "Doctor profile retrieved successfully",
      data: doctor,
    });
  })
);

// Update doctor profile
router.patch(
  "/profile",
  catchAsync(async (req: Request, res: Response) => {
    const doctorId = req.user?.id;
    const updateData = req.body;

    // Get doctor profile
    const doctor = await doctorRepository.findByUserId(doctorId!);

    if (!doctor) {
      throw new NotFoundError("Doctor profile not found");
    }

    // Update doctor profile
    const updatedDoctor = await doctorRepository.update(doctor.id, {
      ...updateData,
      consultationFee: updateData.consultationFee 
        ? parseFloat(updateData.consultationFee) 
        : undefined,
      experienceYears: updateData.experienceYears 
        ? parseInt(updateData.experienceYears) 
        : undefined,
    });

    res.status(200).json({
      status: "success",
      message: "Doctor profile updated successfully",
      data: updatedDoctor,
    });
  })
);

export default router;
