// Re-export all types with clear naming
export * from "./base.types";

// User types
export type {
   IUser,
   IPatientData,
   IPatientWithUser,
   IAdminData,
   IAdminWithUser,
   CreateUserDTO,
   UpdateUserDTO,
   CreatePatientDTO,
   CreateDoctorDTO,
   UpdateDoctorDTO,
} from "./user.types";

// Appointment types
export type {
   IAppointment,
   CreateAppointmentDTO,
   UpdateAppointmentDTO,
   AppointmentQueryParams,
   TimeSlot,
   AppointmentWithDetails,
} from "./appointment.types";

// Doctor types
export type {
   IDoctorData,
   IDoctorWithUser,
   ISchedule,
   ScheduleDay,
   UpdateScheduleDTO,
   SearchDoctorsDTO,
   DoctorAvailabilityDTO,
   AvailableSlot as DoctorAvailableSlot,
   DoctorWithSchedule,
} from "./doctor.types";

// Auth types
export type {
   LoginDTO,
   RegisterDTO,
   AuthResponse,
   TokenPayload,
   RefreshTokenDTO,
   ForgotPasswordDTO,
   ResetPasswordDTO,
   VerifyEmailDTO,
} from "./auth.types";

// Express types
export type {
   AuthenticatedRequest,
   AdminRequest,
   DoctorRequest,
   PatientRequest,
} from "./express.types";

// Dashboard types
export type {
   DashboardStats,
   MonthlyStat,
   AdminDashboardQuery,
   DoctorDashboardStats,
   PatientDashboardStats,
} from "./dashboard.types";

// Pagination types
export type {
   PaginationParams,
   PaginationResult,
   PaginatedResponse,
} from "./pagination.types";

// Schedule types
export type {
   ScheduleDayConfig,
   AvailableSlot,
   DoctorAvailability,
} from "./schedule.types";
