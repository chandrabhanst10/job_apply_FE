export interface UserProfile {
  name: string;
  mobile?: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  country?: string;
  city?: string;
  profileImageUrl?: string;
  aiPrompt?: string;
  targetSkills?: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin" | "super_admin";
  profileImage?: string;
  isEmailVerified: boolean;
  profile?: UserProfile;
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
  id: string;
  _id: string;
  userId: string;
  originalName: string;
  storedName: string;
  path: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  extension: string;
  size: number;
  checksum: string;
  status: "uploaded" | "analyzed" | "analysis_failed" | "pending" | "processing" | "completed" | "failed";
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeAnalysis {
  id: string;
  resumeId: string;
  skills: string[];
  experience: string[];
  education: string[];
  projects: string[];
  certifications: string[];
  atsScore: number;
  summary: string;
  missingSkills: string[];
  suggestions: string[];
  provider: "gemini" | "local";
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  status: "success" | "failure";
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password?: string;
}

export interface ProfileUpdateData {
  name: string;
  email: string;
  aiPrompt?: string;
  targetSkills?: string[];
}

export interface AuthResponseData {
  user: User;
  accessToken: string;
}

export interface RegisterResponseData {
  user: User;
  accessToken: string;
  emailVerificationToken?: string;
}

export interface RefreshResponseData {
  accessToken: string;
}

export interface AppError {
  success?: boolean;
  message: string;
  errors?: string[];
}

export interface LocationStateWithFrom {
  from?: {
    pathname: string;
  };
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword?: string;
}

export interface ResumeMatchResult {
  matchScore: number;
  missingKeywords: string[];
  suggestions: string[];
  tailoredBulletPoints: string[];
  coverLetter?: string;
  provider: "gemini" | "local";
}

