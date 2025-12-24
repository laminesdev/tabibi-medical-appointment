import { z } from "zod";

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
         console.error("Environment validation failed:");
         error.issues.forEach((issue) => {
            const path = issue.path.join(".");
            console.error(`   ${path}: ${issue.message}`);
         });
         process.exit(1);
      }
      throw error;
   }
};

export type EnvConfig = z.infer<typeof envSchema>;

export const env = validateEnv();
