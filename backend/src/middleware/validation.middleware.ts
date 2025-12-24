import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";
import { ValidationError } from "../utils/errors/app.error";

export const validate = (schema: ZodSchema) => {
   return async (req: Request, _res: Response, next: NextFunction) => {
      try {
         await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
         });
         next();
      } catch (error) {
         if (error instanceof ZodError) {
            const errors = error.issues.map((issue) => ({
               field: issue.path.join("."),
               message: issue.message,
            }));
            next(new ValidationError("Validation failed", errors));
         } else {
            next(error);
         }
      }
   };
};

export const validateBody = (schema: ZodSchema) => {
   return async (req: Request, _res: Response, next: NextFunction) => {
      try {
         const validatedData = await schema.parseAsync(req.body);
         req.body = validatedData;
         next();
      } catch (error) {
         if (error instanceof ZodError) {
            const errors = error.issues.map((issue) => ({
               field: issue.path.join("."),
               message: issue.message,
            }));
            next(new ValidationError("Body validation failed", errors));
         } else {
            next(error);
         }
      }
   };
};

export const validateQuery = (schema: ZodSchema) => {
   return async (req: Request, _res: Response, next: NextFunction) => {
      try {
         const validatedData = await schema.parseAsync(req.query);
         // Use type assertion for Express query object
         req.query = validatedData as Record<string, any>;
         next();
      } catch (error) {
         if (error instanceof ZodError) {
            const errors = error.issues.map((issue) => ({
               field: issue.path.join("."),
               message: issue.message,
            }));
            next(new ValidationError("Query validation failed", errors));
         } else {
            next(error);
         }
      }
   };
};

export const validateParams = (schema: ZodSchema) => {
   return async (req: Request, _res: Response, next: NextFunction) => {
      try {
         const validatedData = await schema.parseAsync(req.params);
         // Use type assertion for Express params object
         req.params = validatedData as Record<string, string>;
         next();
      } catch (error) {
         if (error instanceof ZodError) {
            const errors = error.issues.map((issue) => ({
               field: issue.path.join("."),
               message: issue.message,
            }));
            next(new ValidationError("Parameters validation failed", errors));
         } else {
            next(error);
         }
      }
   };
};
