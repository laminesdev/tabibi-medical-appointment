import { z } from 'zod';

// Environment variables schema
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  
  // Database
  DATABASE_URL: z.string().url(),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  
  // Email (optional for notifications)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  
  // Redis (optional for caching)
  REDIS_URL: z.string().optional(),
  
  // Frontend URL
  FRONTEND_URL: z.string().default('http://localhost:3000'),
});

// Validate environment variables
export const validateEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Environment validation failed:');
      
      // Zod 4.2+ uses issues instead of errors
      if ('issues' in error) {
        error.issues.forEach((issue) => {
          const path = issue.path.join('.');
          console.error(`   ${path}: ${issue.message}`);
        });
      }
      
      process.exit(1);
    }
    throw error;
  }
};

// Type for environment variables
export type EnvConfig = z.infer<typeof envSchema>;

// Export validated config
export const env = validateEnv();