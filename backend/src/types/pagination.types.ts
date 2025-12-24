export interface PaginationParams {
   page?: number;
   limit?: number;
   sortBy?: string;
   sortOrder?: "asc" | "desc";
}

export interface PaginationResult<T> {
   data: T[];
   total: number;
   page: number;
   limit: number;
   totalPages: number;
   hasNext: boolean;
   hasPrevious: boolean;
}

export interface PaginatedResponse<T> {
   items: T[];
   total: number;
   page: number;
   limit: number;
   totalPages: number;
   hasNext: boolean;
   hasPrevious: boolean;
}
