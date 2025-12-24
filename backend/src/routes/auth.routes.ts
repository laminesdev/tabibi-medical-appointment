import { Router } from "express";
import { sanitizeInput } from "../middleware/auth.middleware";
import { AuthController } from "../controllers/auth.controller";

const router = Router();
const authController = new AuthController();

// Register route for all user types
router.post(
  "/register",
  sanitizeInput({
    email: "email",
    password: "none",
    firstName: "name",
    lastName: "name",
    phone: "phone",
    gender: "none",
    dateOfBirth: "none",
    role: "none",
    specialty: "text",
    location: "text",
    bio: "text",
    consultationFee: "none",
    experienceYears: "none",
    education: "text",
  }),
  authController.register
);

// Login route
router.post(
  "/login",
  sanitizeInput({
    email: "email",
    password: "none",
  }),
  authController.login
);

// Refresh token route
router.post(
  "/refresh",
  authController.refreshToken
);

export default router;
