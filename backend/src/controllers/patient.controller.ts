import { Request, Response } from "express";
import { PatientService, BookAppointmentData, RescheduleAppointmentData } from "../services/patient.service";
import { catchAsync } from "../middleware/error.middleware";
import { ResponseUtils } from "../utils/response.utils";
import { getUserId } from "../utils/auth.utils";

export class PatientController {
  private patientService: PatientService;

  constructor() {
    this.patientService = new PatientService();
  }

  getProfile = catchAsync(async (req: Request, res: Response) => {
    const patientUserId = getUserId(req);

    const result = await this.patientService.getProfile(patientUserId);

    ResponseUtils.success(res, result, "Patient profile retrieved successfully");
  });

  bookAppointment = catchAsync(async (req: Request, res: Response) => {
    const patientUserId = getUserId(req);
    const bookData: BookAppointmentData = req.body;

    const result = await this.patientService.bookAppointment(patientUserId, bookData);

    ResponseUtils.success(res, result, "Appointment booked successfully", 201);
  });

  getAppointments = catchAsync(async (req: Request, res: Response) => {
    const patientUserId = getUserId(req);
    const params = req.query;

    const result = await this.patientService.getAppointments(patientUserId, params);

    ResponseUtils.paginated(res, result.appointments, result.pagination.total, result.pagination.page, result.pagination.limit);
  });

  getAppointmentById = catchAsync(async (req: Request, res: Response) => {
    const patientUserId = getUserId(req);
    const { id } = req.params;

    const result = await this.patientService.getAppointmentById(patientUserId, id);

    ResponseUtils.success(res, result, "Appointment retrieved successfully");
  });

  cancelAppointment = catchAsync(async (req: Request, res: Response) => {
    const patientUserId = getUserId(req);
    const { id } = req.params;

    const result = await this.patientService.cancelAppointment(patientUserId, id);

    ResponseUtils.success(res, result, "Appointment cancelled successfully");
  });

  rescheduleAppointment = catchAsync(async (req: Request, res: Response) => {
    const patientUserId = getUserId(req);
    const { id } = req.params;
    const rescheduleData: RescheduleAppointmentData = req.body;

    const result = await this.patientService.rescheduleAppointment(patientUserId, id, rescheduleData);

    ResponseUtils.success(res, result, "Appointment rescheduled successfully");
  });
}
