import { Request, Response } from "express";
import { PatientService, BookAppointmentData, PatientAppointmentQuery, RescheduleAppointmentData } from "../services/patient.service";
import { catchAsync } from "../middleware/error.middleware";

export class PatientController {
  private patientService: PatientService;

  constructor() {
    this.patientService = new PatientService();
  }

  bookAppointment = catchAsync(async (req: Request, res: Response) => {
    const patientUserId = req.user?.id!;
    const bookData: BookAppointmentData = req.body;
    
    const result = await this.patientService.bookAppointment(patientUserId, bookData);
    
    res.status(201).json({
      status: "success",
      message: "Appointment booked successfully",
      data: result,
    });
  });

  getAppointments = catchAsync(async (req: Request, res: Response) => {
    const patientUserId = req.user?.id!;
    const params: PatientAppointmentQuery = req.query as any;
    
    const result = await this.patientService.getAppointments(patientUserId, params);
    
    res.status(200).json({
      status: "success",
      message: "Appointments retrieved successfully",
      data: result,
    });
  });

  getAppointmentById = catchAsync(async (req: Request, res: Response) => {
    const patientUserId = req.user?.id!;
    const { id } = req.params;
    
    const result = await this.patientService.getAppointmentById(patientUserId, id);
    
    res.status(200).json({
      status: "success",
      message: "Appointment retrieved successfully",
      data: result,
    });
  });

  cancelAppointment = catchAsync(async (req: Request, res: Response) => {
    const patientUserId = req.user?.id!;
    const { id } = req.params;
    
    const result = await this.patientService.cancelAppointment(patientUserId, id);
    
    res.status(200).json({
      status: "success",
      message: "Appointment cancelled successfully",
      data: result,
    });
  });

  rescheduleAppointment = catchAsync(async (req: Request, res: Response) => {
    const patientUserId = req.user?.id!;
    const { id } = req.params;
    const rescheduleData: RescheduleAppointmentData = req.body;
    
    const result = await this.patientService.rescheduleAppointment(patientUserId, id, rescheduleData);
    
    res.status(200).json({
      status: "success",
      message: "Appointment rescheduled successfully",
      data: result,
    });
  });
}
