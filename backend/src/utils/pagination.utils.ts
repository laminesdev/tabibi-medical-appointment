export class PaginationUtils {
   static getPaginationParams(params?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
   }): {
      skip: number;
      take: number;
      orderBy?: any;
   } {
      const page = params?.page && params.page > 0 ? params.page : 1;
      const limit =
         params?.limit && params.limit > 0 && params.limit <= 100
            ? params.limit
            : 10;
      const skip = (page - 1) * limit;

      const result: { skip: number; take: number; orderBy?: any } = {
         skip,
         take: limit,
      };

      if (params?.sortBy) {
         result.orderBy = { [params.sortBy]: params.sortOrder || "asc" };
      }

      return result;
   }

   static buildPaginationResult<T>(
      data: T[],
      total: number,
      page: number,
      limit: number
   ): {
      data: T[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
   } {
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrevious = page > 1;

      return {
         data,
         total,
         page,
         limit,
         totalPages,
         hasNext,
         hasPrevious,
      };
   }

   static validatePaginationParams(
      page?: number,
      limit?: number
   ): { page: number; limit: number } {
      const validPage = page && page > 0 ? page : 1;
      const validLimit = limit && limit > 0 && limit <= 100 ? limit : 10;
      return { page: validPage, limit: validLimit };
   }

   static calculateOffset(page: number, limit: number): number {
      return (page - 1) * limit;
   }
}
