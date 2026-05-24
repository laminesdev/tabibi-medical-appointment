import { Request, Response } from "express";
import { SearchService } from "../services/search.service";
import { catchAsync } from "../middleware/error.middleware";
import { ResponseUtils } from "../utils/response.utils";

export class SearchController {
  private searchService: SearchService;

  constructor() {
    this.searchService = new SearchService();
  }

  searchDoctors = catchAsync(async (req: Request, res: Response) => {
    const params = req.query;

    const result = await this.searchService.searchDoctors(params);

    ResponseUtils.paginated(res, result.doctors, result.pagination.total, result.pagination.page, result.pagination.limit);
  });

  getDoctorById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await this.searchService.getDoctorById(id);

    ResponseUtils.success(res, result, "Doctor retrieved successfully");
  });

  getFeaturedDoctors = catchAsync(async (_req: Request, res: Response) => {
    const result = await this.searchService.getFeaturedDoctors();

    ResponseUtils.success(res, result, "Featured doctors retrieved successfully");
  });

  getAvailableSlots = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { date } = req.query as { date: string };

    const result = await this.searchService.getAvailableSlots(id, date);

    ResponseUtils.success(res, result, "Available slots retrieved successfully");
  });
}
