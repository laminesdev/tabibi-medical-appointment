import dotenv from "dotenv";
import { z } from "zod";
import { Logger } from "../utils/logger.utils";

dotenv.config();

const envSchema = z.object({
   NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
   PORT: z.coerce.number().default(5000),

   DATABASE_URL: z.string().url(),

   JWT_SECRET: z.string().min(32),
   JWT_REFRESH_SECRET: z.string().min(32),

   CORS_ORIGIN: z.string().default("http://localhost:3000"),

   RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
   RATE_LIMIT_MAX: z.coerce.number().default(100),

   SMTP_HOST: z.string().optional(),
   SMTP_PORT: z.coerce.number().optional(),
   SMTP_USER: z.string().optional(),
   SMTP_PASS: z.string().optional(),
   SMTP_FROM: z.string().optional(),

   REDIS_URL: z.string().optional(),

   FRONTEND_URL: z.string().default("http://localhost:3000"),
});

export const validateEnv = () => {
   try {
      return envSchema.parse(process.env);
   } catch (error) {
      if (error instanceof z.ZodError) {
         Logger.error("Environment validation failed:");
         error.issues.forEach((issue) => {
            const path = issue.path.join(".");
            Logger.error(`   ${path}: ${issue.message}`);
         });
         throw new Error("Environment validation failed. Check your .env file.");
      }
      throw error;
   }
};

export const env = validateEnv();
