export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  status: string;
  data: T[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

export interface DashboardData {
  users: {
    total: number;
    byRole: Record<string, number>;
    activeCount: number;
    verifiedCount: number;
    recentSignups: number;
  };
  doctors: {
    total: number;
    topRated: {
      id: string;
      userId: string;
      specialty: string;
      location: string;
      rating: number;
      totalReviews: number;
      consultationFee: number | null;
      user: { firstName: string; lastName: string };
    }[];
  };
  appointments: {
    total: number;
    byStatus: Record<string, number>;
    todayCount: number;
  };
}
