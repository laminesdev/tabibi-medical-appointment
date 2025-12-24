import { Request, Response } from "express";
import { AdminService, CreateDoctorData, UpdateDoctorData, SearchDoctorParams, SearchUserParams } from "../services/admin.service";
import { catchAsync } from "../middleware/error.middleware";

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  getDashboard = catchAsync(async (_req: Request, res: Response) => {
    const result = await this.adminService.getDashboardData();
    
    res.status(200).json({
      status: "success",
      message: "Dashboard data retrieved successfully",
      data: result,
    });
  });

  getDoctors = catchAsync(async (req: Request, res: Response) => {
    const params: SearchDoctorParams = req.query as any;
    
    const result = await this.adminService.searchDoctors(params);
    
    res.status(200).json({
      status: "success",
      message: "Doctors retrieved successfully",
      data: result,
    });
  });

  getDoctorById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const result = await this.adminService.getDoctorById(id);
    
    res.status(200).json({
      status: "success",
      message: "Doctor retrieved successfully",
      data: result,
    });
  });

  createDoctor = catchAsync(async (req: Request, res: Response) => {
    const createData: CreateDoctorData = req.body;
    
    const result = await this.adminService.createDoctor(createData);
    
    res.status(201).json({
      status: "success",
      message: "Doctor created successfully",
      data: result,
    });
  });

  updateDoctor = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData: UpdateDoctorData = req.body;
    
    const result = await this.adminService.updateDoctor(id, updateData);
    
    res.status(200).json({
      status: "success",
      message: "Doctor updated successfully",
      data: result,
    });
  });

  removeDoctor = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    await this.adminService.removeDoctor(id);
    
    res.status(200).json({
      status: "success",
      message: "Doctor removed successfully",
    });
  });

  getUsers = catchAsync(async (req: Request, res: Response) => {
    const params: SearchUserParams = req.query as any;
    
    const result = await this.adminService.searchUsers(params);
    
    res.status(200).json({
      status: "success",
      message: "Users retrieved successfully",
      data: result,
    });
  });

  getUserById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const result = await this.adminService.getUserById(id);
    
    res.status(200).json({
      status: "success",
      message: "User retrieved successfully",
      data: result,
    });
  });

  updateUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;
    
    const result = await this.adminService.updateUser(id, updateData);
    
    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: result,
    });
  });

  deactivateUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const result = await this.adminService.deactivateUser(id);
    
    res.status(200).json({
      status: "success",
      message: "User deactivated successfully",
      data: result,
    });
  });

  reactivateUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const result = await this.adminService.reactivateUser(id);
    
    res.status(200).json({
      status: "success",
      message: "User reactivated successfully",
      data: result,
    });
  });
}
