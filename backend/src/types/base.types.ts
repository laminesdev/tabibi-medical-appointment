export type ApiResponse<T = any> = {
   success: boolean;
   message: string;
   data?: T;
   errors?: any[];
};

export type PaginationParams = {
   page?: number;
   limit?: number;
   sortBy?: string;
   sortOrder?: "asc" | "desc";
};

export type PaginatedResponse<T> = {
   items: T[];
   total: number;
   page: number;
   limit: number;
   totalPages: number;
   hasNext: boolean;
   hasPrevious: boolean;
};

export type QueryParams = Record<string, string | number | boolean | undefined>;
