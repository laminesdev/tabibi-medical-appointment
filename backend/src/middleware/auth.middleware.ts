import { Request, Response, NextFunction } from "express";
import { AuthUtils } from "../utils/auth.utils";
import { UnauthorizedError, ForbiddenError } from "../utils/errors/app.error";
import { UserRepository } from "../repositories/user.repository";
import { Role } from "@prisma/client";
import { IUser } from "../types/user.types";
import { SanitizationUtils } from "../utils/sanitization.utils";
import { Logger } from "../utils/logger.utils";

// Create a singleton instance to avoid multiple Prisma clients
let userRepository: UserRepository | null = null;

const getUserRepository = (): UserRepository => {
   if (!userRepository) {
      userRepository = new UserRepository();
   }
   return userRepository;
};

export const authenticate = async (
   req: Request,
   _res: Response,
   next: NextFunction
): Promise<void> => {
   try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
         throw new UnauthorizedError("No token provided");
      }

      const token = AuthUtils.extractToken(authHeader);

      if (!token) {
         throw new UnauthorizedError("Invalid token format");
      }

      const decoded = AuthUtils.verifyAccessToken(token);

      const repository = getUserRepository();
      const user = await repository.findById(decoded.userId);

      if (!user) {
         throw new UnauthorizedError("User not found");
      }

      if (!user.isActive) {
         throw new UnauthorizedError("User account is inactive");
      }

      // No casting needed - user.gender is already Gender type from Prisma
      const userData: IUser = {
         id: user.id,
         email: user.email,
         firstName: user.firstName,
         lastName: user.lastName,
         phone: user.phone,
         gender: user.gender, // Direct assignment, no cast needed
         dateOfBirth: user.dateOfBirth || undefined,
         role: user.role,
         isVerified: user.isVerified,
         isActive: user.isActive,
         createdAt: user.createdAt,
         updatedAt: user.updatedAt,
      };

      req.user = userData;
      next();
   } catch (error) {
      next(error);
   }
};

export const authorize = (...allowedRoles: Role[]) => {
   return (req: Request, _res: Response, next: NextFunction): void => {
      try {
         if (!req.user) {
            throw new UnauthorizedError("Authentication required");
         }

         if (!allowedRoles.includes(req.user.role)) {
            throw new ForbiddenError(
               "You do not have permission to access this resource"
            );
         }

         next();
      } catch (error) {
         next(error);
      }
   };
};

export const sanitizeInput = (
   fields: Record<string, "text" | "name" | "email" | "phone" | "none">
) => {
   return (req: Request, _res: Response, next: NextFunction) => {
      try {
         // Sanitize body
         if (req.body && Object.keys(req.body).length > 0) {
            req.body = SanitizationUtils.sanitizeObject(req.body, fields);
         }

         next();
       } catch (error) {
          Logger.error("Input sanitization error:", error);
          next(error);
       }
    };
 };
