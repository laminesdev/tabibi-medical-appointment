import { UserRepository, UpdateUserData } from "../repositories/user.repository";
import { DoctorRepository } from "../repositories/doctor.repository";
import { AppointmentRepository } from "../repositories/appointment.repository";
import { AuthUtils } from "../utils/auth.utils";
import { BadRequestError, NotFoundError, ConflictError } from "../utils/errors/app.error";
import { Role, Gender, User, Doctor, AppointmentStatus } from "@prisma/client";

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
  consultationFee?: string;
  experienceYears?: string;
  bio?: string;
  specialty?: string;
  location?: string;
  education?: string;
}

export interface DashboardData {
  users: {
    total: number;
    byRole: Record<Role, number>;
    activeCount: number;
    verifiedCount: number;
    recentSignups: number;
  };
  doctors: {
    total: number;
    topRated: Doctor[];
  };
  appointments: {
    total: number;
    byStatus: Record<AppointmentStatus, number>;
    todayCount: number;
  };
}

export interface PaginatedDoctors {
  doctors: Doctor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface PaginatedUsers {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface CreatedDoctorResult {
  user: User;
  doctor: Doctor;
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
  role?: Role;
  search?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

export class AdminService {
  private userRepository: UserRepository;
  private doctorRepository: DoctorRepository;
  private appointmentRepository: AppointmentRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.doctorRepository = new DoctorRepository();
    this.appointmentRepository = new AppointmentRepository();
  }

  async getDashboardData(startDate?: string, endDate?: string): Promise<DashboardData> {
    const dateRange = startDate || endDate
      ? {
           startDate: startDate ? new Date(startDate) : undefined,
           endDate: endDate ? new Date(endDate) : undefined,
        }
      : undefined;

    const appointmentDateFilter = dateRange
      ? { date: { ...(dateRange.startDate && { gte: dateRange.startDate }), ...(dateRange.endDate && { lte: dateRange.endDate }) } }
      : undefined;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [userStats, doctors, topDoctors, totalAppointments, pendingAppointments, confirmedAppointments, cancelledAppointments, completedAppointments, rescheduledAppointments, rejectedAppointments, todayAppointments] = await Promise.all([
      this.userRepository.getStats(dateRange),
      this.doctorRepository.findAll(),
      this.doctorRepository.getTopRated(5),
      this.appointmentRepository.countAppointments(appointmentDateFilter),
      this.appointmentRepository.countAppointments({ ...appointmentDateFilter, status: AppointmentStatus.PENDING }),
      this.appointmentRepository.countAppointments({ ...appointmentDateFilter, status: AppointmentStatus.CONFIRMED }),
      this.appointmentRepository.countAppointments({ ...appointmentDateFilter, status: AppointmentStatus.CANCELLED }),
      this.appointmentRepository.countAppointments({ ...appointmentDateFilter, status: AppointmentStatus.COMPLETED }),
      this.appointmentRepository.countAppointments({ ...appointmentDateFilter, status: AppointmentStatus.RESCHEDULED }),
      this.appointmentRepository.countAppointments({ ...appointmentDateFilter, status: AppointmentStatus.REJECTED }),
      this.appointmentRepository.countAppointments({ date: { gte: todayStart, lte: todayEnd } }),
    ]);
    
    return {
      users: userStats,
      doctors: {
        total: doctors.length,
        topRated: topDoctors,
      },
      appointments: {
        total: totalAppointments,
        byStatus: {
          PENDING: pendingAppointments,
          CONFIRMED: confirmedAppointments,
          CANCELLED: cancelledAppointments,
          COMPLETED: completedAppointments,
          RESCHEDULED: rescheduledAppointments,
          REJECTED: rejectedAppointments,
        },
        todayCount: todayAppointments,
      },
    };
  }

  async searchDoctors(params: SearchDoctorParams): Promise<PaginatedDoctors> {
    const searchParams: Partial<SearchDoctorParams> = {
      page: params.page,
      limit: params.limit,
      search: params.search,
      specialty: params.specialty,
      location: params.location,
      minRating: params.minRating,
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

  async getDoctorById(id: string): Promise<Doctor> {
    const doctor = await this.doctorRepository.findById(id);
    if (!doctor) {
      throw new NotFoundError("Doctor not found");
    }
    return doctor;
  }

  async createDoctor(data: CreateDoctorData): Promise<CreatedDoctorResult> {
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
      gender: gender as Gender,
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

  async updateDoctor(id: string, data: UpdateDoctorData): Promise<Doctor> {
    // Update doctor profile
    const doctor = await this.doctorRepository.update(id, {
      ...data,
      consultationFee: data.consultationFee ? parseFloat(data.consultationFee) : undefined,
      experienceYears: data.experienceYears ? parseInt(data.experienceYears) : undefined,
    });

    return doctor;
  }

  async removeDoctor(id: string): Promise<void> {
    const doctor = await this.doctorRepository.findById(id);
    if (!doctor) {
      throw new NotFoundError("Doctor not found");
    }

    await this.userRepository.deactivate(doctor.userId);
  }

  async searchUsers(params: SearchUserParams): Promise<PaginatedUsers> {
    const searchParams: Partial<SearchUserParams> = {
      page: params.page,
      limit: params.limit,
      role: params.role as Role | undefined,
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

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async updateUser(id: string, data: Partial<UpdateUserData>): Promise<User> {
    // Update user
    const user = await this.userRepository.update(id, data);
    return user;
  }

  async deactivateUser(id: string): Promise<User> {
    // Deactivate user
    const user = await this.userRepository.deactivate(id);
    return user;
  }

  async reactivateUser(id: string): Promise<User> {
    // Reactivate user
    const user = await this.userRepository.reactivate(id);
    return user;
  }
}
