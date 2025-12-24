import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { AdminController } from "../controllers/admin.controller";
import { Role } from "@prisma/client";

const router = Router();
const adminController = new AdminController();

// All routes require authentication and admin authorization
router.use(authenticate, authorize(Role.ADMIN));

// Get dashboard statistics
router.get("/dashboard", adminController.getDashboard);

// Get all doctors
router.get("/doctors", adminController.getDoctors);

// Get doctor by ID
router.get("/doctors/:id", adminController.getDoctorById);

// Add a new doctor
router.post("/doctors", adminController.createDoctor);

// Update a doctor
router.patch("/doctors/:id", adminController.updateDoctor);

// Remove a doctor
router.delete("/doctors/:id", adminController.removeDoctor);

// Get all users
router.get("/users", adminController.getUsers);

// Get user by ID
router.get("/users/:id", adminController.getUserById);

// Update user
router.patch("/users/:id", adminController.updateUser);

// Deactivate user
router.patch("/users/:id/deactivate", adminController.deactivateUser);

// Reactivate user
router.patch("/users/:id/reactivate", adminController.reactivateUser);

export default router;
