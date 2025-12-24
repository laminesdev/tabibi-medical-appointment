import { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../utils/errors/app.error";
import { Prisma } from "@prisma/client";
import { Logger } from "../utils/logger.utils";

export const errorHandler = (
   err: unknown,
   req: Request,
   res: Response,
   _next: NextFunction
) => {
   // Convert unknown error to Error type
   const error = err instanceof Error ? err : new Error(String(err));

   Logger.error("Error occurred:", {
      message: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
   });

   // Prisma errors with proper type narrowing
   if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error, res);
   }

   if (error instanceof Prisma.PrismaClientValidationError) {
      return res.status(400).json({
         status: "error",
         message: "Validation error",
         errors: [{ message: "Invalid data provided" }],
      });
   }

   // Application errors
   if (error instanceof AppError) {
      return res.status(error.statusCode).json({
         status: "error",
         message: error.message,
         ...(error instanceof ValidationError && { errors: error.errors }),
         ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
      });
   }

   // JWT errors
   if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
         status: "error",
         message: "Invalid token",
      });
   }

   if (error.name === "TokenExpiredError") {
      return res.status(401).json({
         status: "error",
         message: "Token expired",
      });
   }

   // Default server error
   const statusCode = 500;
   const message =
      process.env.NODE_ENV === "production"
         ? "Internal server error"
         : error.message;

   return res.status(statusCode).json({
      status: "error",
      message,
      ...(process.env.NODE_ENV === "development" && {
         stack: error.stack,
         error: error,
      }),
   });
};

const handlePrismaError = (
  err: Prisma.PrismaClientKnownRequestError,
  res: Response
) => {
  // Type-safe access to err.code and err.meta
  const errorCode = err.code;
  const errorMeta = err.meta;

  switch (errorCode) {
      case "P2002":
         return res.status(409).json({
            status: "error",
            message: "A record with this value already exists",
            field: errorMeta?.target,
         });
      case "P2025":
         return res.status(404).json({
            status: "error",
            message: "Record not found",
         });
      case "P2003":
         return res.status(400).json({
            status: "error",
            message: "Foreign key constraint failed",
         });
      default:
         return res.status(400).json({
            status: "error",
            message: "Database error",
            code: errorCode,
            ...(process.env.NODE_ENV === "development" && { meta: errorMeta }),
         });
   }
};

export const catchAsync = (fn: Function) => {
   return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
   };
};

// Fixed: Proper 404 handler that creates an error
export const notFound = (req: Request, _res: Response, next: NextFunction) => {
   const error = new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404);
   next(error);
};

// Additional helper for route not found
export const routeNotFound = (req: Request, res: Response) => {
   res.status(404).json({
      status: "error",
      message: `Route ${req.originalUrl} not found`,
      method: req.method,
   });
};
