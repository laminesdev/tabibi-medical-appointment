import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { PatientController } from "../controllers/patient.controller";
import { Role } from "@prisma/client";

const router = Router();
const patientController = new PatientController();

// All routes require authentication and patient authorization
router.use(authenticate, authorize(Role.PATIENT));

// Book an appointment
router.post("/appointments", patientController.bookAppointment);

// Get all appointments for patient
router.get("/appointments", patientController.getAppointments);

// Get appointment by ID
router.get("/appointments/:id", patientController.getAppointmentById);

// Cancel an appointment
router.patch("/appointments/:id/cancel", patientController.cancelAppointment);

// Reschedule an appointment
router.patch("/appointments/:id/reschedule", patientController.rescheduleAppointment);

export default router;
