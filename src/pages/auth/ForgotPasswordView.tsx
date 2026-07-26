import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { toast } from "sonner";
import { Compass, MailCheck } from "lucide-react";
import type { AppError, ForgotPasswordData } from "../../types";

const forgotSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

type ForgotSchema = z.infer<typeof forgotSchema>;

export const ForgotPasswordView: React.FC = () => {
  const { forgotPassword } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotSchema>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotSchema) => {
    setIsSubmitting(true);
    try {
      const res = await forgotPassword(data as ForgotPasswordData);
      const token = (res.data as { resetToken?: string | null })?.resetToken;
      if (token) {
        setDevToken(token);
      }
      setIsSent(true);
      toast.success("Reset link sent successfully!");
    } catch (err: unknown) {
      const apiErr = err as AppError;
      toast.error(apiErr.message || "Failed to submit request. Try again.");
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
          <h1 className="text-2xl font-bold tracking-tight">Forgot Password</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Enter your email and we'll send you a password reset link
          </p>
        </div>

        <Card className="p-8 shadow-xl">
          {isSent ? (
            <div className="text-center space-y-4">
              <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <MailCheck className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold">Check your inbox</h2>
              <p className="text-sm text-slate-500 leading-normal">
                If the email is registered, we have sent instructions to reset your password.
              </p>

              {devToken && (
                <div className="mt-4 p-4.5 rounded-xl border border-amber-200/50 bg-amber-50/50 dark:bg-amber-950/10 dark:border-amber-900/30 text-left">
                  <p className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Developer Preview</p>
                  <p className="text-xs text-slate-500 mt-1">Since email servers are mocked locally, use this generated token link to reset your password:</p>
                  <Link 
                    to={`/reset-password?token=${devToken}`} 
                    className="inline-block mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline break-all"
                  >
                    Click to Reset Password
                  </Link>
                </div>
              )}

              <div className="pt-4">
                <Link to="/login" className="text-sm font-semibold text-indigo-600 hover:underline">
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                error={errors.email?.message}
                {...register("email")}
              />

              <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
                Send Reset Link
              </Button>
            </form>
          )}

          {!isSent && (
            <div className="mt-6 text-center text-sm">
              <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Back to Sign In
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
