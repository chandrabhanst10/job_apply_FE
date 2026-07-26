import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { toast } from "sonner";
import { Compass, Eye, EyeOff, KeyRound } from "lucide-react";
import type { AppError, ResetPasswordData } from "../../types";

const resetSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[a-z]/, "Must include a lowercase letter")
    .regex(/[0-9]/, "Must include a number"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetSchema = z.infer<typeof resetSchema>;

export const ResetPasswordView: React.FC = () => {
  const { resetPassword } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = searchParams.get("token") || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetSchema>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetSchema) => {
    if (!token) {
      toast.error("Invalid password reset token.");
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword({
        token,
        password: data.password,
      } as ResetPasswordData);
      toast.success("Password reset successfully! Please sign in with your new password.");
      navigate("/login");
    } catch (err: unknown) {
      const apiErr = err as AppError;
      toast.error(apiErr.message || "Failed to reset password. The link may have expired.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-300">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 mb-4">
            <Compass className="h-6 w-6 text-white animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Enter your new secure password below
          </p>
        </div>

        <Card className="p-8 shadow-xl">
          {!token ? (
            <div className="text-center space-y-4">
              <div className="h-12 w-12 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto">
                <KeyRound className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold">Invalid or Missing Token</h2>
              <p className="text-sm text-slate-500 leading-normal">
                This reset link is missing its authorization token or has already been used. Please request another one.
              </p>
              <div className="pt-4">
                <Link to="/forgot-password" className="text-sm font-semibold text-indigo-600 hover:underline">
                  Forgot Password Help
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="relative">
                <Input
                  label="New Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-[28px] p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm New Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-[28px] p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>

              <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
                Save Password
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
