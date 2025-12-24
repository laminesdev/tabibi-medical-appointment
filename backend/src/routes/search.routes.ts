import { Router } from "express";
import { SearchController } from "../controllers/search.controller";

const router = Router();
const searchController = new SearchController();

// Search for doctors by specialty and/or location
router.get("/doctors", searchController.searchDoctors);

// Get doctor by ID (public endpoint)
router.get("/doctors/:id", searchController.getDoctorById);

export default router;
