import { Router, Request, Response } from "express";
import { catchAsync } from "../middleware/error.middleware";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { UserRepository } from "../repositories/user.repository";
import { DoctorRepository } from "../repositories/doctor.repository";
import { BadRequestError, NotFoundError } from "../utils/errors/app.error";
import { Role } from "@prisma/client";
import { AuthUtils } from "../utils/auth.utils";

const router = Router();
const userRepository = new UserRepository();
const doctorRepository = new DoctorRepository();

// All routes require authentication and admin authorization
router.use(authenticate, authorize(Role.ADMIN));

// Get dashboard statistics
router.get(
  "/dashboard",
  catchAsync(async (_req: Request, res: Response) => {
    // Get user statistics
    const userStats = await userRepository.getStats();
    
    // Get doctor statistics
    const doctors = await doctorRepository.findAll();
    const totalDoctors = doctors.length;
    
    // Get top-rated doctors
    const topDoctors = await doctorRepository.getTopRated(5);
    
    res.status(200).json({
      status: "success",
      message: "Dashboard data retrieved successfully",
      data: {
        users: userStats,
        doctors: {
          total: totalDoctors,
          topRated: topDoctors,
        },
      },
    });
  })
);

// Get all doctors
router.get(
  "/doctors",
  catchAsync(async (req: Request, res: Response) => {
    const { page, limit, search, specialty, location, minRating } = req.query;

    const params: any = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
      specialty: specialty as string,
      location: location as string,
      minRating: minRating ? parseFloat(minRating as string) : undefined,
    };

    const doctors = await doctorRepository.search(params);
    const total = await doctorRepository.count(params);

    res.status(200).json({
      status: "success",
      message: "Doctors retrieved successfully",
      data: {
        doctors,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total,
        },
      },
    });
  })
);

// Get doctor by ID
router.get(
  "/doctors/:id",
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const doctor = await doctorRepository.findById(id);

    if (!doctor) {
      throw new NotFoundError("Doctor not found");
    }

    res.status(200).json({
      status: "success",
      message: "Doctor retrieved successfully",
      data: doctor,
    });
  })
);

// Add a new doctor
router.post(
  "/doctors",
  catchAsync(async (req: Request, res: Response) => {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      phone, 
      gender,
      dateOfBirth,
      specialty,
      location,
      bio,
      consultationFee,
      experienceYears,
      education
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !phone || !gender || !specialty || !location) {
      throw new BadRequestError("Missing required fields");
    }

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new BadRequestError("User with this email already exists");
    }

    // Check if phone already exists
    const existingPhone = await userRepository.existsByPhone(phone);
    if (existingPhone) {
      throw new BadRequestError("User with this phone number already exists");
    }

    // Hash password
    const hashedPassword = await AuthUtils.hashPassword(password);

    // Create user
    const user = await userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      role: Role.DOCTOR,
    });

    // Create doctor profile
    const doctor = await doctorRepository.create({
      userId: user.id,
      specialty,
      location,
      bio,
      consultationFee: consultationFee ? parseFloat(consultationFee) : undefined,
      experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
      education,
    });

    res.status(201).json({
      status: "success",
      message: "Doctor created successfully",
      data: {
        user,
        doctor,
      },
    });
  })
);

// Update a doctor
router.patch(
  "/doctors/:id",
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    // Update doctor profile
    const doctor = await doctorRepository.update(id, {
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
      message: "Doctor updated successfully",
      data: doctor,
    });
  })
);

// Remove a doctor
router.delete(
  "/doctors/:id",
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Find doctor
    const doctor = await doctorRepository.findById(id);
    if (!doctor) {
      throw new NotFoundError("Doctor not found");
    }

    // Deactivate user account
    await userRepository.deactivate(doctor.userId);

    res.status(200).json({
      status: "success",
      message: "Doctor removed successfully",
    });
  })
);

// Get all users
router.get(
  "/users",
  catchAsync(async (req: Request, res: Response) => {
    const { page, limit, role, search, isActive, isVerified } = req.query;

    const params: any = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      role: role as Role,
      search: search as string,
      isActive: isActive !== undefined ? isActive === "true" : undefined,
      isVerified: isVerified !== undefined ? isVerified === "true" : undefined,
    };

    const users = await userRepository.findAll(params);
    const total = await userRepository.count(params);

    res.status(200).json({
      status: "success",
      message: "Users retrieved successfully",
      data: {
        users,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total,
        },
      },
    });
  })
);

// Get user by ID
router.get(
  "/users/:id",
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await userRepository.findById(id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    res.status(200).json({
      status: "success",
      message: "User retrieved successfully",
      data: user,
    });
  })
);

// Update user
router.patch(
  "/users/:id",
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    // Update user
    const user = await userRepository.update(id, updateData);

    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: user,
    });
  })
);

// Deactivate user
router.patch(
  "/users/:id/deactivate",
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Deactivate user
    const user = await userRepository.deactivate(id);

    res.status(200).json({
      status: "success",
      message: "User deactivated successfully",
      data: user,
    });
  })
);

// Reactivate user
router.patch(
  "/users/:id/reactivate",
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Reactivate user
    const user = await userRepository.reactivate(id);

    res.status(200).json({
      status: "success",
      message: "User reactivated successfully",
      data: user,
    });
  })
);

export default router;
