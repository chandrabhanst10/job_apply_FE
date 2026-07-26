import { create } from "zustand";
import { client, getCookie } from "../api/client";
import type { 
  User, 
  ApiResponse, 
  LoginCredentials, 
  RegisterData, 
  ProfileUpdateData, 
  AuthResponseData, 
  RegisterResponseData,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
  AppError 
} from "../types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  loginUser: (credentials: LoginCredentials) => Promise<ApiResponse<AuthResponseData>>;
  registerUser: (data: RegisterData) => Promise<ApiResponse<RegisterResponseData>>;
  logoutUser: () => Promise<void>;
  checkCurrentUser: () => Promise<User | null>;
  updateProfile: (data: ProfileUpdateData) => Promise<ApiResponse<User>>;
  uploadAvatar: (formData: FormData) => Promise<ApiResponse<User>>;
  forgotPassword: (data: ForgotPasswordData) => Promise<ApiResponse<unknown>>;
  resetPassword: (data: ResetPasswordData) => Promise<ApiResponse<unknown>>;
  changePassword: (data: ChangePasswordData) => Promise<ApiResponse<unknown>>;
  verifyEmail: (token: string) => Promise<ApiResponse<unknown>>;
  deleteAccount: () => Promise<void>;
  oauthLogin: (provider: string, code: string) => Promise<ApiResponse<AuthResponseData>>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,

  setAccessToken: (token) => {
    set({ accessToken: token, isAuthenticated: !!token });
  },

  setUser: (user) => {
    set({ user });
  },

  loginUser: async (credentials) => {
    set({ isLoading: true });
    try {
      const res = await client.post<ApiResponse<AuthResponseData>>(
        "/auth/login",
        credentials
      );
      const { user, accessToken } = res.data.data;
      set({ user, accessToken, isAuthenticated: true, isLoading: false });
      return res.data;
    } catch (err: unknown) {
      set({ isLoading: false });
      const apiErr = err as { response?: { data?: AppError } };
      throw apiErr.response?.data || err;
    }
  },

  registerUser: async (data) => {
    set({ isLoading: true });
    try {
      const res = await client.post<ApiResponse<RegisterResponseData>>("/auth/register", data);
      const { user, accessToken } = res.data.data;
      set({ user, accessToken, isAuthenticated: true, isLoading: false });
      return res.data;
    } catch (err: unknown) {
      set({ isLoading: false });
      const apiErr = err as { response?: { data?: AppError } };
      throw apiErr.response?.data || err;
    }
  },

  logoutUser: async () => {
    try {
      await client.post("/auth/logout");
    } catch {
      // Ignored if network fails during logout
    } finally {
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false, isInitialized: true });
    }
  },

  checkCurrentUser: async () => {
    set({ isLoading: true });
    try {
      // Pre-fetch CSRF token to establish session if cookie is not present
      if (!getCookie("csrfToken")) {
        await client.get("/csrf-token");
      }
      
      // If access token is null in JS memory (e.g., after browser refresh),
      // attempt token refresh first using HttpOnly cookie before fetching profile
      if (!get().accessToken) {
        try {
          const refreshRes = await client.post<ApiResponse<AuthResponseData>>("/auth/refresh-token");
          const newAccessToken = refreshRes.data?.data?.accessToken;
          if (newAccessToken) {
            set({ accessToken: newAccessToken, isAuthenticated: true });
          }
        } catch {
          // If refresh token fails, proceed to /auth/me or catch block
        }
      }

      const res = await client.get<ApiResponse<User>>("/auth/me");
      const user = res.data.data;
      set({ user, isAuthenticated: true, isLoading: false, isInitialized: true });
      return user;
    } catch {
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false, isInitialized: true });
      return null;
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await client.patch<ApiResponse<User>>("/users/profile", data);
      set({ user: res.data.data });
      return res.data;
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: AppError } };
      throw apiErr.response?.data || err;
    }
  },

  uploadAvatar: async (formData) => {
    try {
      const res = await client.post<ApiResponse<User>>("/users/profile/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      set({ user: res.data.data });
      return res.data;
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: AppError } };
      throw apiErr.response?.data || err;
    }
  },

  forgotPassword: async (data) => {
    try {
      const res = await client.post<ApiResponse<unknown>>("/auth/forgot-password", data);
      return res.data;
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: AppError } };
      throw apiErr.response?.data || err;
    }
  },

  resetPassword: async (data) => {
    try {
      const res = await client.post<ApiResponse<unknown>>("/auth/reset-password", data);
      return res.data;
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: AppError } };
      throw apiErr.response?.data || err;
    }
  },

  changePassword: async (data) => {
    try {
      const res = await client.post<ApiResponse<unknown>>("/auth/change-password", data);
      return res.data;
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: AppError } };
      throw apiErr.response?.data || err;
    }
  },

  verifyEmail: async (token) => {
    try {
      const res = await client.post<ApiResponse<unknown>>("/auth/verify-email", { token });
      if (get().user) {
        set({ user: { ...get().user!, isEmailVerified: true } });
      }
      return res.data;
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: AppError } };
      throw apiErr.response?.data || err;
    }
  },

  deleteAccount: async () => {
    try {
      await client.delete("/users/profile");
    } finally {
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
    }
  },

  oauthLogin: async (provider, code) => {
    set({ isLoading: true });
    try {
      const res = await client.post<ApiResponse<AuthResponseData>>(`/auth/oauth/${provider}`, { code });
      const { user, accessToken } = res.data.data;
      set({ user, accessToken, isAuthenticated: true, isLoading: false });
      return res.data;
    } catch (err: unknown) {
      set({ isLoading: false });
      const apiErr = err as { response?: { data?: AppError } };
      throw apiErr.response?.data || err;
    }
  },
}));
