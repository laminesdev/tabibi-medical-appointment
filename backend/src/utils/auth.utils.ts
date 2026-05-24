import { Request } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { env } from "../config/env";
import { ValidationUtils } from "./validation.utils";
import { BadRequestError, UnauthorizedError } from "./errors/app.error";

interface TokenPayload {
   userId: string;
}

export const getUserId = (req: Request): string => {
   if (!req.user) throw new UnauthorizedError("Not authenticated");
   return req.user.id;
};

export class AuthUtils {
   static async hashPassword(password: string): Promise<string> {
      // Validate password strength before hashing
      if (!ValidationUtils.isValidPassword(password)) {
         throw new BadRequestError(
            "Password must be at least 8 characters with uppercase, lowercase, and number"
         );
      }
      return bcrypt.hash(password, 10);
   }

   static async comparePassword(
      password: string,
      hash: string
   ): Promise<boolean> {
      return bcrypt.compare(password, hash);
   }

   static generateAccessToken(payload: object): string {
      return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "15m" });
   }

   static generateRefreshToken(payload: object): string {
      return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
   }

   static verifyAccessToken(token: string): TokenPayload {
      return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
   }

   static verifyRefreshToken(token: string): TokenPayload {
      return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
   }

   // New method to extract token from header
   static extractToken(authHeader: string | undefined): string | null {
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
         return null;
      }
      return authHeader.split(" ")[1];
}
}
