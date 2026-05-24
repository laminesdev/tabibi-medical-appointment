import { Router } from "express";
import { validateQuery, validateParams } from "../middleware/validation.middleware";
import { SearchController } from "../controllers/search.controller";
import { searchDoctorsSchema, doctorSlotsQuerySchema } from "../utils/validators/doctor.validator";
import { idParamSchema } from "../utils/validators/common.validator";

const router = Router();
const searchController = new SearchController();

router.get("/doctors", validateQuery(searchDoctorsSchema), searchController.searchDoctors);

router.get("/doctors/featured", searchController.getFeaturedDoctors);

router.get("/doctors/:id/slots", validateParams(idParamSchema), validateQuery(doctorSlotsQuerySchema), searchController.getAvailableSlots);

router.get("/doctors/:id", validateParams(idParamSchema), searchController.getDoctorById);

export default router;
