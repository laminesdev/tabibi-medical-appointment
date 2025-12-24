import { z } from "zod";

export const updateProfileSchema = z.object({
   firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .optional(),
   lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .optional(),
   phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
      .optional(),
   gender: z.enum(["MALE", "FEMALE"]).optional(),
   dateOfBirth: z
      .string()
      .transform((val) => new Date(val))
      .optional(),
});

export const changePasswordSchema = z.object({
   currentPassword: z.string().min(1, "Current password is required"),
   newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
