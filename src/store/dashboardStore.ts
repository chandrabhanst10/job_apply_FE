import { create } from "zustand";
import { client } from "../api/client";
import type { AuditLog, ApiResponse, AppError } from "../types";

export interface DashboardSummary {
  totalResumes: number;
  analyzedResumes: number;
  failedAnalyses: number;
  averageAtsScore: number;
}

interface DashboardState {
  summary: DashboardSummary | null;
  recentActivity: AuditLog[];
  isLoading: boolean;

  fetchDashboardData: () => Promise<void>;
  fetchSummary: () => Promise<ApiResponse<DashboardSummary>>;
  fetchRecentActivity: () => Promise<ApiResponse<AuditLog[]>>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  summary: null,
  recentActivity: [],
  isLoading: false,

  fetchSummary: async () => {
    try {
      const res = await client.get<ApiResponse<DashboardSummary>>("/dashboard/summary");
      set({ summary: res.data.data });
      return res.data;
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: AppError } };
      throw apiErr.response?.data || err;
    }
  },

  fetchRecentActivity: async () => {
    try {
      const res = await client.get<ApiResponse<AuditLog[]>>("/dashboard/recent-activity");
      set({ recentActivity: Array.isArray(res.data.data) ? res.data.data : [] });
      return res.data;
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: AppError } };
      throw apiErr.response?.data || err;
    }
  },

  fetchDashboardData: async () => {
    set({ isLoading: true });
    try {
      await Promise.all([get().fetchSummary(), get().fetchRecentActivity()]);
    } catch {
      // Ignored here, individual handlers will throw/report
    } finally {
      set({ isLoading: false });
    }
  },
}));
