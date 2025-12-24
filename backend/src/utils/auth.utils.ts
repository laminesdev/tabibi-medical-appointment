import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { env } from "../config/env";
import { ValidationUtils } from "./validation.utils";

export class AuthUtils {
   static async hashPassword(password: string): Promise<string> {
      // Validate password strength before hashing
      if (!ValidationUtils.isValidPassword(password)) {
         throw new Error(
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

   static verifyAccessToken(token: string): any {
      return jwt.verify(token, env.JWT_SECRET);
   }

   static verifyRefreshToken(token: string): any {
      return jwt.verify(token, env.JWT_REFRESH_SECRET);
   }

   // New method to extract token from header
   static extractToken(authHeader: string | undefined): string | null {
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
         return null;
      }
      return authHeader.split(" ")[1];
   }

   // New method to validate password strength
   static validatePasswordStrength(password: string): {
      valid: boolean;
      message?: string;
   } {
      if (password.length < 8) {
         return {
            valid: false,
            message: "Password must be at least 8 characters",
         };
      }

      if (!/[A-Z]/.test(password)) {
         return {
            valid: false,
            message: "Password must contain at least one uppercase letter",
         };
      }

      if (!/[a-z]/.test(password)) {
         return {
            valid: false,
            message: "Password must contain at least one lowercase letter",
         };
      }

      if (!/\d/.test(password)) {
         return {
            valid: false,
            message: "Password must contain at least one number",
         };
      }

      return { valid: true };
   }
}
