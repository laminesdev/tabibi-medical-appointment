import { z } from "zod";
import { Gender } from "@prisma/client";

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
   gender: z.nativeEnum(Gender).optional(),
   dateOfBirth: z
      .string()
      .transform((val) => new Date(val))
      .optional(),
   specialty: z.string().min(2).optional(),
   location: z.string().min(2).optional(),
   bio: z.string().optional(),
   consultationFee: z.string().optional(),
   experienceYears: z.string().optional(),
   education: z.string().optional(),
});


