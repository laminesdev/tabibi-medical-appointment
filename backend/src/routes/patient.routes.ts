import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { validateBody, validateQuery, validateParams } from "../middleware/validation.middleware";
import { PatientController } from "../controllers/patient.controller";
import { Role } from "@prisma/client";
import { createAppointmentSchema, appointmentQuerySchema, rescheduleAppointmentSchema } from "../utils/validators/appointment.validator";
import { idParamSchema } from "../utils/validators/common.validator";

const router = Router();
const patientController = new PatientController();

router.use(authenticate, authorize(Role.PATIENT));

router.get("/profile", patientController.getProfile);

router.post("/appointments", validateBody(createAppointmentSchema), patientController.bookAppointment);

router.get("/appointments", validateQuery(appointmentQuerySchema), patientController.getAppointments);

router.get("/appointments/:id", validateParams(idParamSchema), patientController.getAppointmentById);

router.patch("/appointments/:id/cancel", validateParams(idParamSchema), patientController.cancelAppointment);

router.patch("/appointments/:id/reschedule", validateParams(idParamSchema), validateBody(rescheduleAppointmentSchema), patientController.rescheduleAppointment);

export default router;
