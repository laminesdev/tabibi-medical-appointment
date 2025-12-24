import { Router, Request, Response } from "express";
import { catchAsync } from "../middleware/error.middleware";
import { DoctorRepository } from "../repositories/doctor.repository";
import { BadRequestError } from "../utils/errors/app.error";

const router = Router();
const doctorRepository = new DoctorRepository();

// Search for doctors by specialty and/or location
router.get(
  "/doctors",
  catchAsync(async (req: Request, res: Response) => {
    const { specialty, location, search, page, limit, minRating } = req.query;

    // Validate that at least one search parameter is provided
    if (!specialty && !location && !search) {
      throw new BadRequestError("At least one search parameter (specialty, location, or search) is required");
    }

    const params: any = {
      specialty: specialty as string,
      location: location as string,
      search: search as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      minRating: minRating ? parseFloat(minRating as string) : undefined,
    };

    const doctors = await doctorRepository.search(params);
    const total = await doctorRepository.count(params);

    res.status(200).json({
      status: "success",
      message: "Doctors retrieved successfully",
      data: {
        doctors,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total,
        },
      },
    });
  })
);

// Get doctor by ID (public endpoint)
router.get(
  "/doctors/:id",
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const doctor = await doctorRepository.findById(id);

    if (!doctor) {
      throw new BadRequestError("Doctor not found");
    }

    res.status(200).json({
      status: "success",
      message: "Doctor retrieved successfully",
      data: doctor,
    });
  })
);

export default router;
