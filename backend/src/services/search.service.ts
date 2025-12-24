import { DoctorRepository } from "../repositories/doctor.repository";
import { BadRequestError } from "../utils/errors/app.error";

export interface SearchDoctorParams {
  specialty?: string;
  location?: string;
  search?: string;
  page?: number;
  limit?: number;
  minRating?: number;
}

export class SearchService {
  private doctorRepository: DoctorRepository;

  constructor() {
    this.doctorRepository = new DoctorRepository();
  }

  async searchDoctors(params: SearchDoctorParams): Promise<any> {
    const {
      specialty,
      location,
      search,
      page,
      limit,
      minRating
    } = params;

    // Validate that at least one search parameter is provided
    if (!specialty && !location && !search) {
      throw new BadRequestError("At least one search parameter (specialty, location, or search) is required");
    }

    const searchParams: any = {
      specialty,
      location,
      search,
      page: page ? parseInt(page as any) : undefined,
      limit: limit ? parseInt(limit as any) : undefined,
      minRating: minRating ? parseFloat(minRating as any) : undefined,
    };

    const doctors = await this.doctorRepository.search(searchParams);
    const total = await this.doctorRepository.count(searchParams);

    return {
      doctors,
      pagination: {
        page: searchParams.page || 1,
        limit: searchParams.limit || 10,
        total,
      },
    };
  }

  async getDoctorById(id: string): Promise<any> {
    const doctor = await this.doctorRepository.findById(id);
    if (!doctor) {
      throw new BadRequestError("Doctor not found");
    }
    return doctor;
  }
}
