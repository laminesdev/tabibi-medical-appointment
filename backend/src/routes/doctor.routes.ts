import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { DoctorController } from "../controllers/doctor.controller";
import { Role } from "@prisma/client";

const router = Router();
const doctorController = new DoctorController();

// All routes require authentication and doctor authorization
router.use(authenticate, authorize(Role.DOCTOR));

// Get all appointments for doctor
router.get("/appointments", doctorController.getAppointments);

// Get appointment by ID
router.get("/appointments/:id", doctorController.getAppointmentById);

// Update appointment status
router.patch("/appointments/:id/status", doctorController.updateAppointmentStatus);

// Get doctor's schedule
router.get("/schedule", doctorController.getSchedule);

// Update doctor's schedule
router.put("/schedule", doctorController.updateSchedule);

// Get doctor profile
router.get("/profile", doctorController.getProfile);

// Update doctor profile
router.patch("/profile", doctorController.updateProfile);

export default router;
