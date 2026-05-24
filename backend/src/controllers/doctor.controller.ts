import { Request, Response } from "express";
import { DoctorService, DoctorScheduleData, DoctorProfileUpdateData } from "../services/doctor.service";
import { catchAsync } from "../middleware/error.middleware";
import { ResponseUtils } from "../utils/response.utils";
import { getUserId } from "../utils/auth.utils";

export class DoctorController {
  private doctorService: DoctorService;

  constructor() {
    this.doctorService = new DoctorService();
  }

  getAppointments = catchAsync(async (req: Request, res: Response) => {
    const doctorUserId = getUserId(req);
    const params = req.query;

    const result = await this.doctorService.getAppointments(doctorUserId, params);

    ResponseUtils.paginated(res, result.appointments, result.pagination.total, result.pagination.page, result.pagination.limit);
  });

  getAppointmentById = catchAsync(async (req: Request, res: Response) => {
    const doctorUserId = getUserId(req);
    const { id } = req.params;

    const result = await this.doctorService.getAppointmentById(doctorUserId, id);

    ResponseUtils.success(res, result, "Appointment retrieved successfully");
  });

  updateAppointmentStatus = catchAsync(async (req: Request, res: Response) => {
    const doctorUserId = getUserId(req);
    const { id } = req.params;
    const { status } = req.body;

    const result = await this.doctorService.updateAppointmentStatus(doctorUserId, id, status);

    ResponseUtils.success(res, result, "Appointment status updated successfully");
  });

  getSchedule = catchAsync(async (req: Request, res: Response) => {
    const doctorUserId = getUserId(req);

    const result = await this.doctorService.getSchedule(doctorUserId);

    ResponseUtils.success(res, result, "Schedule retrieved successfully");
  });

  updateSchedule = catchAsync(async (req: Request, res: Response) => {
    const doctorUserId = getUserId(req);
    const scheduleData: DoctorScheduleData = req.body;

    const result = await this.doctorService.updateSchedule(doctorUserId, scheduleData);

    ResponseUtils.success(res, result, "Schedule updated successfully");
  });

  getProfile = catchAsync(async (req: Request, res: Response) => {
    const doctorUserId = getUserId(req);

    const result = await this.doctorService.getProfile(doctorUserId);

    ResponseUtils.success(res, result, "Doctor profile retrieved successfully");
  });

  updateProfile = catchAsync(async (req: Request, res: Response) => {
    const doctorUserId = getUserId(req);
    const updateData: DoctorProfileUpdateData = req.body;

    const result = await this.doctorService.updateProfile(doctorUserId, updateData);

    ResponseUtils.success(res, result, "Doctor profile updated successfully");
  });
}
