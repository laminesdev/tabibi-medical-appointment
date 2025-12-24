import { UserRepository } from "../repositories/user.repository";
import { DoctorRepository } from "../repositories/doctor.repository";
import { AuthUtils } from "../utils/auth.utils";
import { BadRequestError, NotFoundError } from "../utils/errors/app.error";
import { Role } from "@prisma/client";

export interface CreateDoctorData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  dateOfBirth?: string;
  specialty: string;
  location: string;
  bio?: string;
  consultationFee?: string;
  experienceYears?: string;
  education?: string;
}

export interface UpdateDoctorData {
  [key: string]: any;
  consultationFee?: string;
  experienceYears?: string;
}

export interface SearchDoctorParams {
  page?: number;
  limit?: number;
  search?: string;
  specialty?: string;
  location?: string;
  minRating?: number;
}

export interface SearchUserParams {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

export class AdminService {
  private userRepository: UserRepository;
  private doctorRepository: DoctorRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.doctorRepository = new DoctorRepository();
  }

  async getDashboardData(): Promise<any> {
    // Get user statistics
    const userStats = await this.userRepository.getStats();
    
    // Get doctor statistics
    const doctors = await this.doctorRepository.findAll();
    const totalDoctors = doctors.length;
    
    // Get top-rated doctors
    const topDoctors = await this.doctorRepository.getTopRated(5);
    
    return {
      users: userStats,
      doctors: {
        total: totalDoctors,
        topRated: topDoctors,
      },
    };
  }

  async searchDoctors(params: SearchDoctorParams): Promise<any> {
    const searchParams: any = {
      page: params.page ? parseInt(params.page as any) : undefined,
      limit: params.limit ? parseInt(params.limit as any) : undefined,
      search: params.search,
      specialty: params.specialty,
      location: params.location,
      minRating: params.minRating ? parseFloat(params.minRating as any) : undefined,
    };
    
    const doctors = await this.doctorRepository.search(searchParams);
    const total = await this.doctorRepository.count(searchParams);
    
    return {
      doctors,
      pagination: {
        page: searchParams.page || 1,
        limit: searchParams.limit || 10,
        total,
      },
    };
  }

  async getDoctorById(id: string): Promise<any> {
    const doctor = await this.doctorRepository.findById(id);
    if (!doctor) {
      throw new NotFoundError("Doctor not found");
    }
    return doctor;
  }

  async createDoctor(data: CreateDoctorData): Promise<any> {
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
    } = data;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !phone || !gender || !specialty || !location) {
      throw new BadRequestError("Missing required fields");
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new BadRequestError("User with this email already exists");
    }

    // Check if phone already exists
    const existingPhone = await this.userRepository.existsByPhone(phone);
    if (existingPhone) {
      throw new BadRequestError("User with this phone number already exists");
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
      role: Role.DOCTOR,
    });

    // Create doctor profile
    const doctor = await this.doctorRepository.create({
      userId: user.id,
      specialty,
      location,
      bio,
      consultationFee: consultationFee ? parseFloat(consultationFee) : undefined,
      experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
      education,
    });

    return {
      user,
      doctor,
    };
  }

  async updateDoctor(id: string, data: UpdateDoctorData): Promise<any> {
    // Update doctor profile
    const doctor = await this.doctorRepository.update(id, {
      ...data,
      consultationFee: data.consultationFee ? parseFloat(data.consultationFee) : undefined,
      experienceYears: data.experienceYears ? parseInt(data.experienceYears) : undefined,
    });

    return doctor;
  }

  async removeDoctor(id: string): Promise<void> {
    // Find doctor
    const doctor = await this.doctorRepository.findById(id);
    if (!doctor) {
      throw new NotFoundError("Doctor not found");
    }

    // Deactivate user account
    await this.userRepository.deactivate(doctor.userId);
  }

  async searchUsers(params: SearchUserParams): Promise<any> {
    const searchParams: any = {
      page: params.page ? parseInt(params.page as any) : undefined,
      limit: params.limit ? parseInt(params.limit as any) : undefined,
      role: params.role as Role,
      search: params.search,
      isActive: params.isActive,
      isVerified: params.isVerified,
    };

    const users = await this.userRepository.findAll(searchParams);
    const total = await this.userRepository.count(searchParams);

    return {
      users,
      pagination: {
        page: searchParams.page || 1,
        limit: searchParams.limit || 10,
        total,
      },
    };
  }

  async getUserById(id: string): Promise<any> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async updateUser(id: string, data: any): Promise<any> {
    // Update user
    const user = await this.userRepository.update(id, data);
    return user;
  }

  async deactivateUser(id: string): Promise<any> {
    // Deactivate user
    const user = await this.userRepository.deactivate(id);
    return user;
  }

  async reactivateUser(id: string): Promise<any> {
    // Reactivate user
    const user = await this.userRepository.reactivate(id);
    return user;
  }
}
