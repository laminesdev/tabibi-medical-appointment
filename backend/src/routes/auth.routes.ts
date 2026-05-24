import { Router } from "express";
import { sanitizeInput } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validation.middleware";
import { AuthController } from "../controllers/auth.controller";
import { registerSchema, loginSchema, refreshTokenSchema } from "../utils/validators/auth.validator";

const router = Router();
const authController = new AuthController();

router.post(
  "/register",
  validateBody(registerSchema),
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

router.post(
  "/login",
  validateBody(loginSchema),
  sanitizeInput({
    email: "email",
    password: "none",
  }),
  authController.login
);

router.post(
  "/refresh",
  validateBody(refreshTokenSchema),
  authController.refreshToken
);

export default router;
