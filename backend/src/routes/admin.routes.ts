import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { validateBody, validateQuery, validateParams } from "../middleware/validation.middleware";
import { AdminController } from "../controllers/admin.controller";
import { Role } from "@prisma/client";
import { adminCreateDoctorSchema, updateDoctorSchema } from "../utils/validators/doctor.validator";
import { updateProfileSchema } from "../utils/validators/user.validator";
import { idParamSchema, adminDoctorQuerySchema, adminUserQuerySchema, adminDashboardQuerySchema } from "../utils/validators/common.validator";

const router = Router();
const adminController = new AdminController();

router.use(authenticate, authorize(Role.ADMIN));

router.get("/dashboard", validateQuery(adminDashboardQuerySchema), adminController.getDashboard);

router.get("/doctors", validateQuery(adminDoctorQuerySchema), adminController.getDoctors);

router.get("/doctors/:id", validateParams(idParamSchema), adminController.getDoctorById);

router.post("/doctors", validateBody(adminCreateDoctorSchema), adminController.createDoctor);

router.patch("/doctors/:id", validateParams(idParamSchema), validateBody(updateDoctorSchema), adminController.updateDoctor);

router.delete("/doctors/:id", validateParams(idParamSchema), adminController.removeDoctor);

router.get("/users", validateQuery(adminUserQuerySchema), adminController.getUsers);

router.get("/users/:id", validateParams(idParamSchema), adminController.getUserById);

router.patch("/users/:id", validateParams(idParamSchema), validateBody(updateProfileSchema), adminController.updateUser);

router.patch("/users/:id/deactivate", validateParams(idParamSchema), adminController.deactivateUser);

router.patch("/users/:id/reactivate", validateParams(idParamSchema), adminController.reactivateUser);

export default router;
