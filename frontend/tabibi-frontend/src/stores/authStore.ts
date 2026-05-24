import { create } from "zustand";
import type { IUser, LoginData, RegisterData, Role } from "@/types/auth.types";
import { authService } from "@/services/auth.service";

interface AuthState {
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  role: Role | null;
  isLoading: boolean;

  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  loadFromStorage: () => void;
  setUser: (user: IUser) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  role: null,
  isLoading: true,

  loadFromStorage: () => {
    const token = localStorage.getItem("accessToken");
    const refresh = localStorage.getItem("refreshToken");
    const userStr = localStorage.getItem("user");

    if (token && refresh && userStr) {
      try {
        const user = JSON.parse(userStr) as IUser;
        set({
          accessToken: token,
          refreshToken: refresh,
          user,
          isAuthenticated: true,
          role: user.role,
          isLoading: false,
        });
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  login: async (data: LoginData) => {
    const response = await authService.login(data);
    localStorage.setItem("accessToken", response.accessToken);
    localStorage.setItem("refreshToken", response.refreshToken);
    localStorage.setItem("user", JSON.stringify(response.user));
    set({
      user: response.user,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      isAuthenticated: true,
      role: response.user.role,
    });
  },

  register: async (data: RegisterData) => {
    await authService.register(data);
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      role: null,
    });
  },

  refreshAccessToken: async () => {
    const { refreshToken } = get();
    if (!refreshToken) throw new Error("No refresh token");

    const tokens = await authService.refreshToken(refreshToken);
    localStorage.setItem("accessToken", tokens.accessToken);
    set({
      accessToken: tokens.accessToken,
    });
  },

  setUser: (user: IUser) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },
}));
