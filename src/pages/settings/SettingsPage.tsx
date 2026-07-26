import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "../../store/authStore";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { toast } from "sonner";
import { 
  Upload, 
  Loader2,
  Lock,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Mail,
  Compass,
  Linkedin,
  Briefcase,
  Sparkles
} from "lucide-react";
import { client } from "../../api/client";
import type { AppError, ChangePasswordData } from "../../types";

const DEFAULT_AI_PROMPT = `Analyze this resume to extract suitable target job titles and locations for automated job applying.
If the candidate has frontend or backend skills like ReactJS, NodeJS, JavaScript, Python, Java, etc., please extract and list a rich set of 4-6 specific target job titles matching their technical skill sets (e.g., including "React Developer", "ReactJS Developer", "Node JS Developer", "Node.js Developer", "Frontend Developer", "Backend Engineer", "Full Stack Developer" if they have both frontend and backend skills) to give the user more diverse job search opportunities.`;

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  aiPrompt: z.string().max(2000).optional(),
  targetSkills: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[a-z]/, "Must include a lowercase letter")
    .regex(/[0-9]/, "Must include a number"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match",
  path: ["confirmPassword"],
});

type ProfileSchema = z.infer<typeof profileSchema>;
type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;

export const SettingsPage: React.FC = () => {
  const { user, updateProfile, uploadAvatar, changePassword, deleteAccount } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [connections, setConnections] = useState<{
    linkedin: { isConnected: boolean; username: string | null; lastSyncAt: string | null };
    naukri: { isConnected: boolean; username: string | null; lastSyncAt: string | null };
  } | null>(null);



  const [isSyncingExtension, setIsSyncingExtension] = useState<Record<string, boolean>>({
    linkedin: false,
    naukri: false
  });

  const fetchConnectionStatus = useCallback(async () => {
    try {
      const res = await client.get("/connections/status");
      setConnections(res.data.data);
    } catch {
      toast.error("Failed to load connection settings");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchConnectionStatus();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchConnectionStatus]);

  useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash === "#linkedin" || hash === "#naukri") {
        const elementId = `${hash.slice(1)}-connection`;
        setTimeout(() => {
          const element = document.getElementById(elementId);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 300);
      }
    };

    handleHashScroll();
    window.addEventListener("hashchange", handleHashScroll);
    return () => window.removeEventListener("hashchange", handleHashScroll);
  }, []);

  const handleExtensionSync = async (platform: "linkedin" | "naukri", username: string) => {
    if (!username) {
      toast.error(`Please enter your ${platform === "linkedin" ? "LinkedIn" : "Naukri"} username/email first.`);
      return;
    }

    setIsSyncingExtension((prev) => ({ ...prev, [platform]: true }));

    // Timeout check if extension doesn't respond in 1.5 seconds
    const timeoutTimer = setTimeout(() => {
      setIsSyncingExtension((prev) => ({ ...prev, [platform]: false }));
      toast.error("Extension not detected. Please verify the 'Auto-Apply Session Sync' extension is loaded and active in Chrome.");
    }, 1500);

    const handleMessage = async (event: MessageEvent) => {
      if (
        event.data?.type === "SYNC_SESSION_COOKIES_RESPONSE" &&
        event.data?.platform === platform
      ) {
        clearTimeout(timeoutTimer);
        window.removeEventListener("message", handleMessage);
        
        setIsSyncingExtension((prev) => ({ ...prev, [platform]: false }));

        if (event.data.success && event.data.cookies) {
          try {
            const cookiesJson = JSON.stringify(event.data.cookies);
            await client.post(`/connections/link/${platform}`, { username, cookiesJson });
            toast.success(`${platform === "linkedin" ? "LinkedIn" : "Naukri"} connected successfully via Extension!`);
            fetchConnectionStatus();
          } catch {
            toast.error("Failed to link connections via extracted cookies.");
          }
        } else {
          toast.error(event.data.error || "Failed to retrieve cookies from extension.");
        }
      }
    };

    window.addEventListener("message", handleMessage);
    window.postMessage({ type: "SYNC_SESSION_COOKIES", platform }, "*");
  };



  const handleUnlink = async (platform: "linkedin" | "naukri") => {
    const confirm = window.confirm(`Are you sure you want to disconnect your ${platform === "linkedin" ? "LinkedIn" : "Naukri"} integration?`);
    if (!confirm) return;

    try {
      await client.post(`/connections/unlink/${platform}`);
      toast.success(`${platform === "linkedin" ? "LinkedIn" : "Naukri"} disconnected successfully!`);
      fetchConnectionStatus();
    } catch {
      toast.error("Failed to disconnect account.");
    }
  };

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.profile?.name || user?.name || "",
      email: user?.email || "",
      aiPrompt: user?.profile?.aiPrompt || DEFAULT_AI_PROMPT,
      targetSkills: user?.profile?.targetSkills?.join(", ") || "",
    },
  });

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmitProfile = async (data: ProfileSchema) => {
    setIsSubmittingProfile(true);
    try {
      const skillsArray = data.targetSkills
        ? data.targetSkills.split(",").map(s => s.trim()).filter(s => s.length > 0)
        : [];
      
      await updateProfile({
        name: data.name,
        email: data.email,
        aiPrompt: data.aiPrompt,
        targetSkills: skillsArray
      });
      toast.success("Profile updated successfully!");
    } catch (err: unknown) {
      const apiErr = err as AppError;
      toast.error(apiErr.message || "Failed to update profile details.");
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const onSubmitPassword = async (data: ChangePasswordSchema) => {
    setIsSubmittingPassword(true);
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      } as ChangePasswordData);
      toast.success("Password changed successfully!");
      resetPasswordForm();
    } catch (err: unknown) {
      const apiErr = err as AppError;
      toast.error(apiErr.message || "Failed to change password. Please check your current password.");
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const maxMb = 2;
      
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file format. Please upload an image (PNG, JPG).");
        return;
      }
      if (file.size > maxMb * 1024 * 1024) {
        toast.error(`Image size must be less than ${maxMb}MB.`);
        return;
      }

      setIsUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      try {
        await uploadAvatar(formData);
        toast.success("Profile picture updated successfully!");
      } catch (err: unknown) {
        const apiErr = err as AppError;
        toast.error(apiErr.message || "Failed to upload avatar picture.");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      "WARNING: This action is permanent! Are you sure you want to delete your account? All resumes and analysis reports will be deleted forever."
    );
    if (!confirmation) return;

    setIsDeleting(true);
    try {
      await deleteAccount();
      toast.success("Your account has been deleted successfully.");
    } catch (err: unknown) {
      const apiErr = err as AppError;
      toast.error(apiErr.message || "Failed to delete account. Try again.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Account Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Manage your personal details, security settings, and account preference.
        </p>
      </div>

      {/* Verification Warning Alert */}
      {!user?.isEmailVerified && (
        <div className="border border-amber-200/50 bg-amber-50/50 dark:bg-amber-950/10 dark:border-amber-900/30 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="h-10 w-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Email Address Unverified</p>
            <p className="text-xs text-slate-500 mt-0.5">Please check your inbox to verify your email. Verification enables all core security features.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Profile Picture Uploader */}
        <div className="space-y-6">
          <Card className="p-8 text-center flex flex-col items-center justify-center">
            <CardHeader className="px-0 w-full text-left pb-4 mb-6">
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Update your public profile display picture</CardDescription>
            </CardHeader>

            <div className="relative group h-32 w-32 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-md">
              <img
                src={user?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "User"}`}
                alt="Profile Avatar"
                className="h-full w-full object-cover"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              disabled={isUploading}
            />
            
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-6 flex items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4" />
              Upload Image
            </Button>
          </Card>

          {/* Verification Status Card */}
          <Card className="p-6">
            <CardHeader className="px-0 pb-4 mb-4">
              <CardTitle className="text-sm">Account Status</CardTitle>
            </CardHeader>
            <div className="flex items-center gap-3">
              {user?.isEmailVerified ? (
                <>
                  <div className="h-8 w-8 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Verified Account</span>
                </>
              ) : (
                <>
                  <div className="h-8 w-8 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Awaiting Verification</span>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Form Columns */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Profile Details Form */}
          <Card className="p-8">
            <CardHeader className="px-0 pb-4 mb-6">
              <CardTitle>Personal Details</CardTitle>
              <CardDescription>Modify your account identity and email settings</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="John Doe"
                  error={profileErrors.name?.message}
                  {...registerProfile("name")}
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  error={profileErrors.email?.message}
                  {...registerProfile("email")}
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/60">
                <Button type="submit" isLoading={isSubmittingProfile}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>

          {/* AI & Autopilot settings Form */}
          <Card className="p-8">
            <CardHeader className="px-0 pb-4 mb-6 flex flex-row items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500 shrink-0" />
              <div>
                <CardTitle>AI Autopilot Prompt Control</CardTitle>
                <CardDescription>Customize the scanning prompts and target keywords to guide the AI suggestions</CardDescription>
              </div>
            </CardHeader>

            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Custom AI Scanning Prompt
                  </label>
                  <textarea
                    placeholder="Provide a custom instruction to guide the AI during resume scanning (e.g. Extract target titles matching React, ReactJS, NodeJS...)"
                    className="flex min-h-[120px] w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-3 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-50 text-slate-700 dark:text-slate-300 transition-all font-medium"
                    {...registerProfile("aiPrompt")}
                  />
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Leave blank to use the default system prompt. Use this to guide the AI on what roles or location variations it should extract.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Target Skills (Comma Separated)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. React, Node.js, TypeScript, Docker"
                    {...registerProfile("targetSkills")}
                  />
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Enter key skills to prioritize. The AI will look specifically for these skills when parsing your resume and suggesting target roles.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/60">
                <Button type="submit" isLoading={isSubmittingProfile}>
                  Save AI Settings
                </Button>
              </div>
            </form>
          </Card>

          {/* Integrations Card */}
          <Card className="p-8">
            <CardHeader className="px-0 pb-4 mb-6 flex flex-row items-center gap-2">
              <Compass className="h-5 w-5 text-indigo-500 shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
              <div>
                <CardTitle>Platform Integrations</CardTitle>
                <CardDescription>Securely connect your LinkedIn and Naukri accounts using session cookies to automate applications</CardDescription>
              </div>
            </CardHeader>

            <div className="space-y-8">
              {/* Chrome Extension Instructions Panel */}
              <div className="bg-indigo-50/50 dark:bg-indigo-950/15 border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl p-5 flex gap-4.5 items-start">
                <Compass className="h-6 w-6 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
                <div className="text-xs leading-relaxed">
                  <p className="font-bold text-indigo-900 dark:text-indigo-300">1-Click Synchronization Extension</p>
                  <p className="text-slate-500 mt-1">
                    To make account linking completely automated without manual cookie copy-pasting:
                  </p>
                  <ol className="list-decimal list-inside text-slate-500 mt-2 space-y-1 pl-1 font-semibold">
                    <li>Open Chrome Extensions page: <code className="px-1.5 py-0.5 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800 rounded font-mono text-[10px]">chrome://extensions</code></li>
                    <li>Toggle the <strong>Developer mode</strong> switch in the top-right corner.</li>
                    <li>Click <strong>Load unpacked</strong> and select the <code className="px-1.5 py-0.5 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800 rounded font-mono text-[10px]">chrome-extension</code> folder inside this repository root.</li>
                  </ol>
                </div>
              </div>

              {/* LinkedIn Section */}
              <div id="linkedin-connection" className="border-b border-slate-100 dark:border-slate-800/60 pb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                    <Linkedin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">LinkedIn Automation</h3>
                    <p className="text-xs text-slate-500">Auto-submit Easy Apply applications</p>
                  </div>
                </div>

                {connections?.linkedin.isConnected ? (
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Connected Account: </span>
                      <span className="text-emerald-500 font-bold">{connections.linkedin.username}</span>
                      <p className="text-slate-500 mt-1">Last Linked: {connections.linkedin.lastSyncAt ? new Date(connections.linkedin.lastSyncAt).toLocaleString() : "N/A"}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="border-rose-200 text-rose-600 hover:bg-rose-50"
                      onClick={() => handleUnlink("linkedin")}
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-start">
                    <Button
                      variant="outline"
                      onClick={() => handleExtensionSync("linkedin", user?.email || "")}
                      isLoading={isSyncingExtension.linkedin}
                      className="flex items-center gap-1.5 px-6"
                    >
                      <Compass className="h-4 w-4 text-indigo-500" />
                      Sync via Extension
                    </Button>
                  </div>
                )}
              </div>

              {/* Naukri Section */}
              <div id="naukri-connection">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-sky-500/10 text-sky-500 rounded-xl flex items-center justify-center shrink-0">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Naukri Automation</h3>
                    <p className="text-xs text-slate-500">Auto-submit applications via Naukri portal</p>
                  </div>
                </div>

                {connections?.naukri.isConnected ? (
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Connected Account: </span>
                      <span className="text-emerald-500 font-bold">{connections.naukri.username}</span>
                      <p className="text-slate-500 mt-1">Last Linked: {connections.naukri.lastSyncAt ? new Date(connections.naukri.lastSyncAt).toLocaleString() : "N/A"}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="border-rose-200 text-rose-600 hover:bg-rose-50"
                      onClick={() => handleUnlink("naukri")}
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-start">
                    <Button
                      variant="outline"
                      onClick={() => handleExtensionSync("naukri", user?.email || "")}
                      isLoading={isSyncingExtension.naukri}
                      className="flex items-center gap-1.5 px-6"
                    >
                      <Compass className="h-4 w-4 text-indigo-500" />
                      Sync via Extension
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Change Password Form */}
          <Card className="p-8">
            <CardHeader className="px-0 pb-4 mb-6 flex flex-row items-center gap-2">
              <Lock className="h-5 w-5 text-slate-400 shrink-0" />
              <div>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Ensure your account is using a long, random password to stay secure</CardDescription>
              </div>
            </CardHeader>

            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="••••••••"
                  error={passwordErrors.currentPassword?.message}
                  {...registerPassword("currentPassword")}
                />

                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  error={passwordErrors.newPassword?.message}
                  {...registerPassword("newPassword")}
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••"
                  error={passwordErrors.confirmPassword?.message}
                  {...registerPassword("confirmPassword")}
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/60">
                <Button type="submit" isLoading={isSubmittingPassword}>
                  Update Password
                </Button>
              </div>
            </form>
          </Card>

          {/* Privacy & Data Ownership Card */}
          <Card className="p-8">
            <CardHeader className="px-0 pb-4 mb-6 flex flex-row items-center gap-2">
              <Compass className="h-5 w-5 text-indigo-500 shrink-0" />
              <div>
                <CardTitle>Privacy & Data Rights Control</CardTitle>
                <CardDescription>Export your data, manage privacy consents, and execute right-to-be-forgotten requests</CardDescription>
              </div>
            </CardHeader>

            <div className="space-y-6 text-xs text-slate-600 dark:text-slate-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    📥 Full Data Export
                  </h4>
                  <p className="text-[11px] text-slate-500">Download a full machine-readable JSON copy of your profile, resumes, and application logs.</p>
                  <a
                    href="/trust-center"
                    className="inline-block py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition"
                  >
                    Go to Trust Center Data Export
                  </a>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    🛡️ Privacy & Cookie Preferences
                  </h4>
                  <p className="text-[11px] text-slate-500">Manage opt-ins and view complete transparency reports for your browser session.</p>
                  <a
                    href="/privacy"
                    target="_blank"
                    className="inline-block py-2 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-[11px] transition"
                  >
                    View Privacy Policy
                  </a>
                </div>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-8 border-rose-200/50 dark:border-rose-950/20">
            <CardHeader className="px-0 pb-4 mb-6 flex flex-row items-center gap-2">
              <Trash2 className="h-5 w-5 text-rose-500 shrink-0 animate-pulse" />
              <div>
                <CardTitle className="text-rose-700 dark:text-rose-400">Danger Zone</CardTitle>
                <CardDescription>Permanently delete your account and all associated documents</CardDescription>
              </div>
            </CardHeader>
            
            <p className="text-xs text-slate-500 leading-normal mb-6 font-medium">
              Once your account is deleted, all of your resumes, parsing files, and AI statistics will be permanently removed. This action cannot be undone.
            </p>

            <div className="flex justify-start">
              <Button 
                variant="ghost" 
                className="bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/10 dark:hover:bg-rose-950/20 dark:text-rose-400 border border-rose-200/40"
                onClick={handleDeleteAccount}
                isLoading={isDeleting}
              >
                Delete Account
              </Button>
            </div>
          </Card>

        </div>

      </div>
    </div>
  );
};
