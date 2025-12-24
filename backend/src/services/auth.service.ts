import { UserRepository } from "../repositories/user.repository";
import { DoctorRepository } from "../repositories/doctor.repository";
import { PatientRepository } from "../repositories/patient.repository";
import { AdminRepository } from "../repositories/admin.repository";
import { AuthUtils } from "../utils/auth.utils";
import { ValidationUtils } from "../utils/validation.utils";
import { Role } from "@prisma/client";
import { BadRequestError, ConflictError, UnauthorizedError } from "../utils/errors/app.error";

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  dateOfBirth?: string;
  role?: string;
  // Doctor specific fields
  specialty?: string;
  location?: string;
  bio?: string;
  consultationFee?: string;
  experienceYears?: string;
  education?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface TokenData {
  refreshToken: string;
}

export class AuthService {
  private userRepository: UserRepository;
  private doctorRepository: DoctorRepository;
  private patientRepository: PatientRepository;
  private adminRepository: AdminRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.doctorRepository = new DoctorRepository();
    this.patientRepository = new PatientRepository();
    this.adminRepository = new AdminRepository();
  }

  async register(data: RegisterData): Promise<any> {
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
    } = data;

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
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    // Check if phone already exists
    const existingPhone = await this.userRepository.existsByPhone(phone);
    if (existingPhone) {
      throw new ConflictError("User with this phone number already exists");
    }

    // Hash password
    const hashedPassword = await AuthUtils.hashPassword(password);

    // Create user
    const user = await this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      gender: gender as any,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      role: role as Role,
    });

    // Create role-specific profile
    let profile;
    if (role === "DOCTOR") {
      if (!specialty || !location) {
        throw new BadRequestError("Specialty and location are required for doctors");
      }
      profile = await this.doctorRepository.create({
        userId: user.id,
        specialty,
        location,
        bio,
        consultationFee: consultationFee ? parseFloat(consultationFee) : undefined,
        experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
        education,
      });
    } else if (role === "PATIENT") {
      profile = await this.patientRepository.create({
        userId: user.id,
      });
    } else if (role === "ADMIN") {
      profile = await this.adminRepository.create({
        userId: user.id,
      });
    }

    return {
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
    };
  }

  async login(data: LoginData): Promise<any> {
    const { email, password } = data;

    if (!email || !password) {
      throw new BadRequestError("Email and password are required");
    }

    // Find user by email
    const user = await this.userRepository.findByEmail(email);
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
    const accessToken = AuthUtils.generateAccessToken({
      userId: user.id,
      role: user.role,
    });
    const refreshToken = AuthUtils.generateRefreshToken({
      userId: user.id,
      role: user.role,
    });

    // Get user profile based on role
    let profile;
    if (user.role === "DOCTOR") {
      profile = await this.doctorRepository.findByUserId(user.id);
    } else if (user.role === "PATIENT") {
      profile = await this.patientRepository.findByUserId(user.id);
    } else if (user.role === "ADMIN") {
      profile = await this.adminRepository.findByUserId(user.id);
    }

    return {
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
    };
  }

  async refreshToken(data: TokenData): Promise<any> {
    const { refreshToken } = data;

    if (!refreshToken) {
      throw new BadRequestError("Refresh token is required");
    }

    try {
      const decoded = AuthUtils.verifyRefreshToken(refreshToken);
      const user = await this.userRepository.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new UnauthorizedError("Invalid refresh token");
      }

      const newAccessToken = AuthUtils.generateAccessToken({
        userId: user.id,
        role: user.role,
      });

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw new UnauthorizedError("Invalid refresh token");
    }
  }
}
