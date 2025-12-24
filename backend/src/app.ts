import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { errorHandler, notFound } from "./middleware/error.middleware";
import { requestLogger } from "./middleware/request-logger.middleware";
import { BaseRepository } from "./repositories/base.repository";

// Load environment variables
dotenv.config();

const app = express();

// Request logging
app.use(requestLogger);

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
   origin: process.env.CORS_ORIGIN || "http://localhost:3000",
   credentials: true,
   optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate limiting with safe parsing
const parseRateLimitValue = (value: string | undefined, defaultValue: number): number => {
   if (!value) return defaultValue;
   const parsed = parseInt(value, 10);
   return isNaN(parsed) || parsed <= 0 ? defaultValue : parsed;
};

const limiter = rateLimit({
  windowMs: parseRateLimitValue(process.env.RATE_LIMIT_WINDOW_MS, 900000), // 15 minutes default
  max: parseRateLimitValue(process.env.RATE_LIMIT_MAX, process.env.NODE_ENV === 'development' ? 1000 : 100), // 1000 requests for dev, 100 for prod
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint with database connectivity test
app.get("/health", async (_req: Request, res: Response) => {
   const healthcheck: any = {
      status: "success",
      message: "Tabibi API is running",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || "1.0.0",
      services: {
         api: true,
         database: false,
      }
   };

   try {
      // Test database connection
      const repository = new BaseRepository();
      await repository.getPrisma().$queryRaw`SELECT 1`;
      healthcheck.services.database = true;
      
      res.status(200).json(healthcheck);
   } catch (error) {
      healthcheck.status = "error";
      healthcheck.message = "API is running but database connection failed";
      healthcheck.services.database = false;
      
      // Include only safe error details
      if (process.env.NODE_ENV === "development") {
         // Only show error type, not full message which might contain sensitive info
         healthcheck.error = error instanceof Error ? error.constructor.name : "Unknown error";
      }
      
      res.status(503).json(healthcheck); // 503 Service Unavailable
   }
});

// API routes
import authRoutes from "./routes/auth.routes";
import patientRoutes from "./routes/patient.routes";
import doctorRoutes from "./routes/doctor.routes";
import adminRoutes from "./routes/admin.routes";
import searchRoutes from "./routes/search.routes";

app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/search", searchRoutes);

// 404 handler - MUST be before errorHandler
app.use(notFound);

// Error handling middleware (MUST BE LAST)
app.use(errorHandler);

export default app;
