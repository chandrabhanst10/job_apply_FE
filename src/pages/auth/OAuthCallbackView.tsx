import type React from "react";
import { useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Card } from "../../components/ui/Card";
import { Loader2, AlertTriangle, Compass } from "lucide-react";
import { toast } from "sonner";
import type { AppError } from "../../types";

export const OAuthCallbackView: React.FC = () => {
  const { provider } = useParams<{ provider: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { oauthLogin } = useAuthStore();

  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  useEffect(() => {
    const handleCallback = async () => {
      if (error) {
        toast.error(errorDescription || `Authentication failed: ${error}`);
        navigate("/login");
        return;
      }

      if (!code) {
        toast.error("No authorization code returned from provider.");
        navigate("/login");
        return;
      }

      if (!provider) {
        toast.error("Invalid OAuth provider requested.");
        navigate("/login");
        return;
      }

      try {
        const res = await oauthLogin(provider, code);
        toast.success(`Successfully signed in using ${provider[0].toUpperCase()}${provider.slice(1)}!`);
        
        if (window.opener) {
          window.opener.postMessage(
            { type: "OAUTH_SUCCESS", provider, payload: res?.data },
            window.location.origin
          );
          window.close();
        } else {
          navigate("/dashboard");
        }
      } catch (err: unknown) {
        const apiErr = err as AppError;
        toast.error(apiErr.message || "OAuth login failed. Please try again.");
        if (window.opener) {
          window.opener.postMessage({ type: "OAUTH_ERROR", error: apiErr.message }, window.location.origin);
          window.close();
        } else {
          navigate("/login");
        }
      }
    };

    handleCallback();
  }, [code, error, errorDescription, provider, oauthLogin, navigate]);

  const providerName = provider ? provider[0].toUpperCase() + provider.slice(1) : "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-300">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 mb-4">
            <Compass className="h-6 w-6 text-white animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Authenticating</h1>
        </div>

        <Card className="p-8 text-center shadow-xl">
          {error ? (
            <div className="space-y-4 py-4">
              <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto animate-bounce" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                OAuth Authentication Failed
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-4 animate-pulse">
              <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Signing in with {providerName}...
              </p>
              <p className="text-xs text-slate-400">Please do not close this window</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
