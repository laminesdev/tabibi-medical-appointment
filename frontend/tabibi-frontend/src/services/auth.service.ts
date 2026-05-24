import api from "./api";
import type { LoginData, RegisterData, AuthResponse } from "@/types/auth.types";
import type { ApiResponse } from "@/types/api.types";

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>("/auth/login", data);
    return response.data.data;
  },

  async register(data: RegisterData): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<{ message: string }>>("/auth/register", data);
    return response.data.data;
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await api.post<ApiResponse<{ accessToken: string }>>(
      "/auth/refresh",
      { refreshToken }
    );
    return response.data.data;
  },
};
