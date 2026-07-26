import type React from "react";
import { Link } from "react-router-dom";
import { Bot, ShieldCheck, ArrowRight } from "lucide-react";
import { useAuthStore } from "../store/authStore";

export const PublicHeader: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Bot className="h-5 w-5" />
          </div>
          <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            AutoApply.ai
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-400">
          <Link to="/" className="hover:text-white transition">Product</Link>
          <Link to="/trust-center" className="hover:text-white transition flex items-center gap-1.5 text-indigo-400 font-bold">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" /> Trust Center
          </Link>
          <Link to="/security-policy" className="hover:text-white transition">Security</Link>
          <Link to="/ai-usage" className="hover:text-white transition">AI Ethics</Link>
          <Link to="/status" className="hover:text-white transition flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            System Status
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
            >
              Go to Dashboard <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2 rounded-xl transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
              >
                Get Started <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
