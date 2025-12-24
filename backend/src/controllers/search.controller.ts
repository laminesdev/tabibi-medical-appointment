import { Request, Response } from "express";
import { SearchService, SearchDoctorParams } from "../services/search.service";
import { catchAsync } from "../middleware/error.middleware";

export class SearchController {
  private searchService: SearchService;

  constructor() {
    this.searchService = new SearchService();
  }

  searchDoctors = catchAsync(async (req: Request, res: Response) => {
    const params: SearchDoctorParams = req.query as any;
    
    const result = await this.searchService.searchDoctors(params);
    
    res.status(200).json({
      status: "success",
      message: "Doctors retrieved successfully",
      data: result,
    });
  });

  getDoctorById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const result = await this.searchService.getDoctorById(id);
    
    res.status(200).json({
      status: "success",
      message: "Doctor retrieved successfully",
      data: result,
    });
  });
}
