import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { toast } from "sonner";
import { Compass, Eye, EyeOff } from "lucide-react";
import { OAuthButtons } from "../../components/OAuthButtons";
import type { AppError, RegisterData } from "../../types";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the Terms of Service, Privacy Policy, and Cookie Policy to create an account."
  })
});

type RegisterSchema = z.infer<typeof registerSchema>;

export const SignUpView: React.FC = () => {
  const { registerUser } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterSchema) => {
    setIsSubmitting(true);
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        termsAccepted: true,
        privacyAccepted: true,
        cookieAccepted: true
      } as RegisterData);
      toast.success("Account created and logged in successfully!");
      navigate("/dashboard");
    } catch (err: unknown) {
      const apiErr = err as AppError;
      toast.error(apiErr.message || "Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-8 transition-colors duration-300">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 mb-4">
            <Compass className="h-6 w-6 text-white animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Get started with automated resume analysis and job auto-apply
          </p>
        </div>

        <Card className="p-8 shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              error={errors.name?.message}
              {...register("name")}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              error={errors.email?.message}
              {...register("email")}
            />

            <div className="relative">
              <Input
                label="Password"
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

            {/* Mandatory Policy Consent Checkbox */}
            <div className="pt-2 space-y-1">
              <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900"
                  {...register("acceptTerms")}
                />
                <span>
                  I agree to the{" "}
                  <Link to="/terms" target="_blank" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                    Terms of Service
                  </Link>
                  ,{" "}
                  <Link to="/privacy" target="_blank" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                    Privacy Policy
                  </Link>
                  , and{" "}
                  <Link to="/cookies" target="_blank" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                    Cookie Policy
                  </Link>
                  .
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="text-xs text-red-500 font-medium">{errors.acceptTerms.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full mt-3" isLoading={isSubmitting}>
              Create Account
            </Button>
          </form>

          <OAuthButtons />

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-500 dark:text-slate-400">Already have an account? </span>
            <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Sign in
            </Link>
          </div>
        </Card>

        {/* Trust Badges */}
        <div className="text-center space-y-1 text-[11px] text-slate-400">
          <p className="font-bold flex items-center justify-center gap-1.5">
            🔒 256-Bit Encrypted • No Password Storage • User-Controlled Data
          </p>
          <p>
            Learn more in our <Link to="/trust-center" className="text-indigo-400 font-semibold hover:underline">Trust Center</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
