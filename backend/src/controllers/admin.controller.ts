import { Request, Response } from "express";
import { AdminService } from "../services/admin.service";
import { catchAsync } from "../middleware/error.middleware";
import { ResponseUtils } from "../utils/response.utils";
import { CreateDoctorData, UpdateDoctorData } from "../services/admin.service";
import { UpdateUserData } from "../repositories/user.repository";

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  getDashboard = catchAsync(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

    const result = await this.adminService.getDashboardData(startDate, endDate);

    ResponseUtils.success(res, result, "Dashboard data retrieved successfully");
  });

  getDoctors = catchAsync(async (req: Request, res: Response) => {
    const params = req.query;

    const result = await this.adminService.searchDoctors(params);

    ResponseUtils.paginated(res, result.doctors, result.pagination.total, result.pagination.page, result.pagination.limit);
  });

  getDoctorById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await this.adminService.getDoctorById(id);

    ResponseUtils.success(res, result, "Doctor retrieved successfully");
  });

  createDoctor = catchAsync(async (req: Request, res: Response) => {
    const createData: CreateDoctorData = req.body;

    const result = await this.adminService.createDoctor(createData);

    ResponseUtils.success(res, result, "Doctor created successfully", 201);
  });

  updateDoctor = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData: UpdateDoctorData = req.body;

    const result = await this.adminService.updateDoctor(id, updateData);

    ResponseUtils.success(res, result, "Doctor updated successfully");
  });

  removeDoctor = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    await this.adminService.removeDoctor(id);

    ResponseUtils.success(res, null, "Doctor deactivated successfully");
  });

  getUsers = catchAsync(async (req: Request, res: Response) => {
    const params = req.query;

    const result = await this.adminService.searchUsers(params);

    ResponseUtils.paginated(res, result.users, result.pagination.total, result.pagination.page, result.pagination.limit);
  });

  getUserById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await this.adminService.getUserById(id);

    ResponseUtils.success(res, result, "User retrieved successfully");
  });

  updateUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData: Partial<UpdateUserData> = req.body;

    const result = await this.adminService.updateUser(id, updateData);

    ResponseUtils.success(res, result, "User updated successfully");
  });

  deactivateUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await this.adminService.deactivateUser(id);

    ResponseUtils.success(res, result, "User deactivated successfully");
  });

  reactivateUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await this.adminService.reactivateUser(id);

    ResponseUtils.success(res, result, "User reactivated successfully");
  });
}
