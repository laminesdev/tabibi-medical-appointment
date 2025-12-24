// Export from auth.validator
export {
   registerSchema,
   loginSchema,
   refreshTokenSchema,
   forgotPasswordSchema,
   resetPasswordSchema,
   type RegisterInput,
   type LoginInput,
   type RefreshTokenInput,
   type ForgotPasswordInput,
   type ResetPasswordInput,
} from "./auth.validator";

// Export from appointment.validator
export {
   createAppointmentSchema,
   updateAppointmentSchema,
   appointmentQuerySchema,
   type CreateAppointmentInput,
   type UpdateAppointmentInput,
   type AppointmentQueryInput,
} from "./appointment.validator";

// Export from doctor.validator
export {
   searchDoctorsSchema,
   doctorAvailabilitySchema,
   createDoctorSchema,
   updateDoctorSchema,
   scheduleSchema,
   type SearchDoctorsInput,
   type DoctorAvailabilityInput,
   type CreateDoctorInput,
   type UpdateDoctorInput,
   type ScheduleInput,
} from "./doctor.validator";

// Export from user.validator
export {
   updateProfileSchema,
   changePasswordSchema,
   type UpdateProfileInput,
   type ChangePasswordInput,
} from "./user.validator";

// Export from schedule.validator
export {
   timeRangeSchema,
   dayScheduleSchema,
   updateScheduleSchema,
} from "./schedule.validator";
