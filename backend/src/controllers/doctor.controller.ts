import { Request, Response } from "express";
import { DoctorService, DoctorAppointmentQuery, DoctorScheduleData, DoctorProfileUpdateData } from "../services/doctor.service";
import { catchAsync } from "../middleware/error.middleware";

export class DoctorController {
  private doctorService: DoctorService;

  constructor() {
    this.doctorService = new DoctorService();
  }

  getAppointments = catchAsync(async (req: Request, res: Response) => {
    const doctorUserId = req.user?.id!;
    const params: DoctorAppointmentQuery = req.query as any;
    
    const result = await this.doctorService.getAppointments(doctorUserId, params);
    
    res.status(200).json({
      status: "success",
      message: "Appointments retrieved successfully",
      data: result,
    });
  });

  getAppointmentById = catchAsync(async (req: Request, res: Response) => {
    const doctorUserId = req.user?.id!;
    const { id } = req.params;
    
    const result = await this.doctorService.getAppointmentById(doctorUserId, id);
    
    res.status(200).json({
      status: "success",
      message: "Appointment retrieved successfully",
      data: result,
    });
  });

  updateAppointmentStatus = catchAsync(async (req: Request, res: Response) => {
    const doctorUserId = req.user?.id!;
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await this.doctorService.updateAppointmentStatus(doctorUserId, id, status);
    
    res.status(200).json({
      status: "success",
      message: "Appointment status updated successfully",
      data: result,
    });
  });

  getSchedule = catchAsync(async (req: Request, res: Response) => {
    const doctorUserId = req.user?.id!;
    
    const result = await this.doctorService.getSchedule(doctorUserId);
    
    res.status(200).json({
      status: "success",
      message: "Schedule retrieved successfully",
      data: result,
    });
  });

  updateSchedule = catchAsync(async (req: Request, res: Response) => {
    const doctorUserId = req.user?.id!;
    const scheduleData: DoctorScheduleData = req.body;
    
    const result = await this.doctorService.updateSchedule(doctorUserId, scheduleData);
    
    res.status(200).json({
      status: "success",
      message: "Schedule updated successfully",
      data: result,
    });
  });

  getProfile = catchAsync(async (req: Request, res: Response) => {
    const doctorUserId = req.user?.id!;
    
    const result = await this.doctorService.getProfile(doctorUserId);
    
    res.status(200).json({
      status: "success",
      message: "Doctor profile retrieved successfully",
      data: result,
    });
  });

  updateProfile = catchAsync(async (req: Request, res: Response) => {
    const doctorUserId = req.user?.id!;
    const updateData: DoctorProfileUpdateData = req.body;
    
    const result = await this.doctorService.updateProfile(doctorUserId, updateData);
    
    res.status(200).json({
      status: "success",
      message: "Doctor profile updated successfully",
      data: result,
    });
  });
}
