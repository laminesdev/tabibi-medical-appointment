import { Router, Request, Response } from "express";
import { catchAsync } from "../middleware/error.middleware";
import { sanitizeInput } from "../middleware/auth.middleware";
import { AuthUtils } from "../utils/auth.utils";
import { UserRepository } from "../repositories/user.repository";
import { DoctorRepository } from "../repositories/doctor.repository";
import { PatientRepository } from "../repositories/patient.repository";
import { AdminRepository } from "../repositories/admin.repository";
import { BadRequestError, ConflictError, UnauthorizedError } from "../utils/errors/app.error";
import { Role } from "@prisma/client";
import { ValidationUtils } from "../utils/validation.utils";

const router = Router();
const userRepository = new UserRepository();
const doctorRepository = new DoctorRepository();
const patientRepository = new PatientRepository();
const adminRepository = new AdminRepository();

// Register route for all user types
router.post(
  "/register",
  sanitizeInput({
    email: "email",
    password: "none",
    firstName: "name",
    lastName: "name",
    phone: "phone",
    gender: "none",
    dateOfBirth: "none",
    role: "none",
    specialty: "text",
    location: "text",
    bio: "text",
    consultationFee: "none",
    experienceYears: "none",
    education: "text",
  }),
  catchAsync(async (req: Request, res: Response) => {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      gender,
      dateOfBirth,
      role = "PATIENT",
      // Doctor specific fields
      specialty,
      location,
      bio,
      consultationFee,
      experienceYears,
      education,
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !phone || !gender) {
      throw new BadRequestError("Missing required fields");
    }

    // Validate email format
    if (!ValidationUtils.isValidEmail(email)) {
      throw new BadRequestError("Invalid email format");
    }

    // Validate phone format
    if (!ValidationUtils.isValidPhone(phone)) {
      throw new BadRequestError("Invalid phone number format");
    }

    // Validate password strength
    const passwordValidation = AuthUtils.validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      throw new BadRequestError(passwordValidation.message);
    }

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    // Check if phone already exists
    const existingPhone = await userRepository.existsByPhone(phone);
    if (existingPhone) {
      throw new ConflictError("User with this phone number already exists");
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
      role: role as Role,
    });

    // Create role-specific profile
    let profile;
    if (role === "DOCTOR") {
      if (!specialty || !location) {
        throw new BadRequestError("Specialty and location are required for doctors");
      }
      
      profile = await doctorRepository.create({
        userId: user.id,
        specialty,
        location,
        bio,
        consultationFee: consultationFee ? parseFloat(consultationFee) : undefined,
        experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
        education,
      });
    } else if (role === "PATIENT") {
      profile = await patientRepository.create({
        userId: user.id,
      });
    } else if (role === "ADMIN") {
      profile = await adminRepository.create({
        userId: user.id,
      });
    }

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          role: user.role,
          isVerified: user.isVerified,
          isActive: user.isActive,
        },
        profile,
      },
    });
  })
);

// Login route
router.post(
  "/login",
  sanitizeInput({
    email: "email",
    password: "none",
  }),
  catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError("Email and password are required");
    }

    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError("Account is deactivated");
    }

    // Verify password
    const isPasswordValid = await AuthUtils.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Generate tokens
    const accessToken = AuthUtils.generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = AuthUtils.generateRefreshToken({ userId: user.id, role: user.role });

    // Get user profile based on role
    let profile;
    if (user.role === "DOCTOR") {
      profile = await doctorRepository.findByUserId(user.id);
    } else if (user.role === "PATIENT") {
      profile = await patientRepository.findByUserId(user.id);
    } else if (user.role === "ADMIN") {
      profile = await adminRepository.findByUserId(user.id);
    }

    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          role: user.role,
          isVerified: user.isVerified,
          isActive: user.isActive,
        },
        profile,
        accessToken,
        refreshToken,
      },
    });
  })
);

// Refresh token route
router.post(
  "/refresh",
  catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new BadRequestError("Refresh token is required");
    }

    try {
      const decoded = AuthUtils.verifyRefreshToken(refreshToken);
      const user = await userRepository.findById(decoded.userId);

      if (!user || !user.isActive) {
        throw new UnauthorizedError("Invalid refresh token");
      }

      const newAccessToken = AuthUtils.generateAccessToken({ 
        userId: user.id, 
        role: user.role 
      });

      res.status(200).json({
        status: "success",
        message: "Token refreshed successfully",
        data: {
          accessToken: newAccessToken,
        },
      });
    } catch (error) {
      throw new UnauthorizedError("Invalid refresh token");
    }
  })
);

export default router;
