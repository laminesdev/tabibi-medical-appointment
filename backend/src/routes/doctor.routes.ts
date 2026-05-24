import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { validateBody, validateQuery, validateParams } from "../middleware/validation.middleware";
import { DoctorController } from "../controllers/doctor.controller";
import { Role } from "@prisma/client";
import { updateAppointmentStatusSchema } from "../utils/validators/appointment.validator";
import { updateScheduleSchema } from "../utils/validators/schedule.validator";
import { updateProfileSchema } from "../utils/validators/user.validator";
import { idParamSchema, doctorAppointmentQuerySchema } from "../utils/validators/common.validator";

const router = Router();
const doctorController = new DoctorController();

router.use(authenticate, authorize(Role.DOCTOR));

router.get("/appointments", validateQuery(doctorAppointmentQuerySchema), doctorController.getAppointments);

router.get("/appointments/:id", validateParams(idParamSchema), doctorController.getAppointmentById);

router.patch("/appointments/:id/status", validateParams(idParamSchema), validateBody(updateAppointmentStatusSchema), doctorController.updateAppointmentStatus);

router.get("/schedule", doctorController.getSchedule);

router.put("/schedule", validateBody(updateScheduleSchema), doctorController.updateSchedule);

router.get("/profile", doctorController.getProfile);

router.patch("/profile", validateBody(updateProfileSchema), doctorController.updateProfile);

export default router;
