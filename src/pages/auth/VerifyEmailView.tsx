import type React from "react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Compass, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

export const VerifyEmailView: React.FC = () => {
  const { verifyEmail } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("Verifying your email address...");

  const token = searchParams.get("token") || "";

  useEffect(() => {
    const handleVerify = async () => {
      if (!token) {
        setStatus("failed");
        setMessage("Verification token is missing. Please check your verification link.");
        return;
      }
      try {
        await verifyEmail(token);
        setStatus("success");
        setMessage("Your email address has been successfully verified!");
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        setStatus("failed");
        setMessage(apiErr.message || "Email verification failed. The link may have expired or is invalid.");
      }
    };
    handleVerify();
  }, [token, verifyEmail]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-300">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 mb-4">
            <Compass className="h-6 w-6 text-white animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Email Verification</h1>
        </div>

        <Card className="p-8 text-center shadow-xl">
          {status === "loading" && (
            <div className="space-y-4 py-4">
              <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">{message}</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-5 py-2">
              <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-6 w-6 animate-scale-in" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Verification Successful</h2>
              <p className="text-sm text-slate-500 leading-normal">{message}</p>
              <div className="pt-2">
                <Link to="/dashboard">
                  <Button className="w-full">Go to Dashboard</Button>
                </Link>
              </div>
            </div>
          )}

          {status === "failed" && (
            <div className="space-y-5 py-2">
              <div className="h-12 w-12 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Verification Failed</h2>
              <p className="text-sm text-slate-500 leading-normal">{message}</p>
              <div className="pt-2">
                <Link to="/dashboard">
                  <Button variant="outline" className="w-full">Go to Dashboard</Button>
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
