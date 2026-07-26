import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface RouteGuardProps {
  children: React.ReactNode;
  publicOnly?: boolean;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children, publicOnly = false }) => {
  const { isAuthenticated, isLoading, isInitialized, checkCurrentUser } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in by querying /auth/me on mount if not yet initialized
    if (!isInitialized) {
      checkCurrentUser();
    }
  }, [isInitialized, checkCurrentUser]);

  if (!isInitialized || isLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 text-slate-100">
        <div className="relative h-16 w-16 animate-spin rounded-full border-4 border-solid border-indigo-500 border-t-transparent"></div>
        <p className="mt-4 text-sm font-medium tracking-wide text-slate-400">Loading workspace...</p>
      </div>
    );
  }

  if (publicOnly && isAuthenticated) {
    // If user is already logged in, redirect away from public login pages to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  if (!publicOnly && !isAuthenticated) {
    // Redirect to login if not logged in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
