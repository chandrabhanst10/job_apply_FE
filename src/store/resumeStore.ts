import { create } from "zustand";
import { client } from "../api/client";
import type { Resume, ResumeAnalysis, ResumeMatchResult, ApiResponse, AppError } from "../types";

interface ResumeState {
  resumes: Resume[];
  selectedResume: Resume | null;
  selectedAnalysis: ResumeAnalysis | null;
  matchResult: ResumeMatchResult | null;
  isLoading: boolean;
  isUploading: boolean;
  isAnalyzing: boolean;
  isMatching: boolean;
  uploadProgress: number;

  fetchResumes: () => Promise<ApiResponse<Resume[]>>;
  fetchResumeDetail: (id: string) => Promise<ApiResponse<{ resume: Resume; analysis?: ResumeAnalysis }>>;
  uploadResume: (file: File) => Promise<ApiResponse<{ resume: Resume; analysis?: ResumeAnalysis }>>;
  deleteResume: (id: string) => Promise<ApiResponse<unknown>>;
  analyzeResume: (id: string) => Promise<ApiResponse<ResumeAnalysis>>;
  matchResume: (id: string, jobDescription: string) => Promise<ApiResponse<ResumeMatchResult>>;
  resetMatchResult: () => void;
}

export const useResumeStore = create<ResumeState>((set) => ({
  resumes: [],
  selectedResume: null,
  selectedAnalysis: null,
  matchResult: null,
  isLoading: false,
  isUploading: false,
  isAnalyzing: false,
  isMatching: false,
  uploadProgress: 0,

  fetchResumes: async () => {
    set({ isLoading: true });
    try {
      const res = await client.get<ApiResponse<Resume[]>>("/resumes");
      const normalized = (Array.isArray(res.data.data) ? res.data.data : []).map((r) => ({
        ...r,
        id: r.id || r._id,
        fileName: r.fileName || r.originalName,
        fileUrl: r.fileUrl || r.path,
      }));
      set({ resumes: normalized, isLoading: false });
      return res.data;
    } catch (err: unknown) {
      set({ isLoading: false });
      const apiErr = err as { response?: { data?: AppError } };
      throw apiErr.response?.data || err;
    }
  },

  fetchResumeDetail: async (id) => {
    set({ isLoading: true, matchResult: null });
    try {
      const res = await client.get<ApiResponse<{ resume: Resume; analysis?: ResumeAnalysis }>>(
        `/resumes/${id}`
      );
      const data = res.data.data;
      const normalizedResume = {
        ...data.resume,
        id: data.resume.id || data.resume._id,
        fileName: data.resume.fileName || data.resume.originalName,
        fileUrl: data.resume.fileUrl || data.resume.path,
      };
      set({
        selectedResume: normalizedResume,
        selectedAnalysis: data.analysis || null,
        isLoading: false,
      });
      return res.data;
    } catch (err: unknown) {
      set({ isLoading: false });
      const apiErr = err as { response?: { data?: AppError } };
      throw apiErr.response?.data || err;
    }
  },

  uploadResume: async (file) => {
    set({ isUploading: true, uploadProgress: 0 });
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await client.post<ApiResponse<{ resume: Resume; analysis?: ResumeAnalysis }>>("/resumes", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          set({ uploadProgress: percent });
        },
      });
      const data = res.data.data;
      const normalizedResume = {
        ...data.resume,
        id: data.resume.id || data.resume._id,
        fileName: data.resume.fileName || data.resume.originalName,
        fileUrl: data.resume.fileUrl || data.resume.path,
      };
      // Append new normalized resume to state
      set((state) => ({
        resumes: [normalizedResume, ...state.resumes],
        isUploading: false,
        uploadProgress: 0,
      }));
      return res.data;
    } catch (err: unknown) {
      set({ isUploading: false, uploadProgress: 0 });
      const apiErr = err as { response?: { data?: AppError } };
      throw apiErr.response?.data || err;
    }
  },

  deleteResume: async (id) => {
    try {
      const res = await client.delete<ApiResponse<unknown>>(`/resumes/${id}`);
      set((state) => ({
        resumes: state.resumes.filter((r) => r.id !== id),
        selectedResume: state.selectedResume?.id === id ? null : state.selectedResume,
        selectedAnalysis: state.selectedResume?.id === id ? null : state.selectedAnalysis,
      }));
      return res.data;
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: AppError } };
      throw apiErr.response?.data || err;
    }
  },

  analyzeResume: async (id) => {
    set({ isAnalyzing: true });
    try {
      const res = await client.post<ApiResponse<ResumeAnalysis>>(`/resumes/${id}/analyze`);
      set({
        selectedAnalysis: res.data.data,
        isAnalyzing: false,
      });
      
      // Update the status of the resume in the list to completed
      set((state) => ({
        resumes: state.resumes.map((r) => (r.id === id ? { ...r, status: "completed" } : r)),
        selectedResume: state.selectedResume?.id === id ? { ...state.selectedResume, status: "completed" } : state.selectedResume
      }));

      return res.data;
    } catch (err: unknown) {
      set({ isAnalyzing: false });
      // Update status to failed
      set((state) => ({
        resumes: state.resumes.map((r) => (r.id === id ? { ...r, status: "failed" } : r)),
        selectedResume: state.selectedResume?.id === id ? { ...state.selectedResume, status: "failed" } : state.selectedResume
      }));
      const apiErr = err as { response?: { data?: AppError } };
      throw apiErr.response?.data || err;
    }
  },

  matchResume: async (id, jobDescription) => {
    set({ isMatching: true });
    try {
      const res = await client.post<ApiResponse<ResumeMatchResult>>(`/resumes/${id}/match`, {
        jobDescription,
      });
      set({ matchResult: res.data.data, isMatching: false });
      return res.data;
    } catch (err: unknown) {
      set({ isMatching: false });
      const apiErr = err as { response?: { data?: AppError } };
      throw apiErr.response?.data || err;
    }
  },

  resetMatchResult: () => {
    set({ matchResult: null });
  },
}));
