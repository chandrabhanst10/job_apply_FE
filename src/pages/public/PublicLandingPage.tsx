import type React from "react";
import { Link } from "react-router-dom";
import { 
  Sparkles, 
  Bot, 
  Chrome, 
  ShieldCheck, 
  Check, 
  ArrowRight,
} from "lucide-react";

import { useAuthStore } from "../../store/authStore";
import { PublicFooter } from "../../components/PublicFooter";

export const PublicLandingPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
              <Bot className="h-5 w-5" />
            </div>
            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              AutoApply.ai
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <a href="#extension" className="hover:text-white transition">Chrome Extension</a>
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
                  Get Started Free <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold shadow-inner">
            <Sparkles className="h-3.5 w-3.5" /> Next-Gen AI Career Operating System
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Automate Your Job Search with <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">
              Autonomous AI Auto-Pilot
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Scan LinkedIn & Naukri feeds, extract high-converting recruiter opportunities, customize ATS-optimized resumes, and submit 100+ targeted applications daily on complete auto-pilot.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              {isAuthenticated ? "Go to Dashboard" : "Start Auto-Applying Now"} <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#extension"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-sm transition flex items-center justify-center gap-2"
            >
              <Chrome className="h-4 w-4 text-indigo-400" /> Install Chrome Extension
            </a>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16 max-w-4xl mx-auto border-t border-slate-800/80">
            <div>
              <p className="text-2xl font-black text-white">100K+</p>
              <p className="text-xs text-slate-400 font-semibold">Applications Submitted</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">88%</p>
              <p className="text-xs text-slate-400 font-semibold">Average ATS Match Score</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">4.8x</p>
              <p className="text-xs text-slate-400 font-semibold">More Recruiter Interviews</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">AES-256</p>
              <p className="text-xs text-slate-400 font-semibold">Encrypted Vault Storage</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="py-20 border-t border-slate-800/60 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black text-white">Engineered for Maximum Application Conversion</h2>
            <p className="text-xs text-slate-400 max-w-xl mx-auto">Everything you need to automate applications, track interviews, and customize AI prompt behavior.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 hover:border-indigo-500/40 transition">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Bot className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Autonomous Autopilot Worker</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Background Playwright browser pool submits Easy Apply forms on LinkedIn and Naukri using your encrypted session cookies.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 hover:border-indigo-500/40 transition">
              <div className="h-12 w-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Social Feed Scanner</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Continuous AI scan extracts direct recruiter email contacts and hiring posts from social feeds with automatic deduplication.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 hover:border-indigo-500/40 transition">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Centralized AI Prompt Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tune custom AI prompt templates for cover letter generation, ATS keyword optimization, and recruiter outreach messages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Matrix */}
      <section id="pricing" className="py-20 border-t border-slate-800/60 bg-slate-900/40">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black text-white">Simple, Transparent Pricing</h2>
            <p className="text-xs text-slate-400">Choose the plan that fits your career goals.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Free Tier */}
            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Starter Free</h3>
                <div className="text-3xl font-black text-white">$0 <span className="text-xs text-slate-500 font-normal">/ month</span></div>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> 10 Daily Auto-Applications</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> 20 Daily Social Feed Scans</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Chrome Extension Pairing</li>
                </ul>
              </div>
              <Link to={isAuthenticated ? "/dashboard" : "/register"} className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold text-xs text-center transition">
                {isAuthenticated ? "Go to Dashboard" : "Get Started"}
              </Link>
            </div>

            {/* Pro Tier (Popular) */}
            <div className="p-8 rounded-3xl bg-slate-900 border-2 border-indigo-500 space-y-6 flex flex-col justify-between relative shadow-2xl shadow-indigo-500/10">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider">
                Most Popular
              </span>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Professional Pro</h3>
                <div className="text-3xl font-black text-white">$29 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-indigo-400" /> 100 Daily Auto-Applications</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-indigo-400" /> 200 Daily Social Feed Scans</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-indigo-400" /> Custom AI Prompt Templates</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-indigo-400" /> Encrypted Cookie Vault Sync</li>
                </ul>
              </div>
              <Link to={isAuthenticated ? "/dashboard" : "/register"} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs text-center transition shadow-lg shadow-indigo-600/30">
                {isAuthenticated ? "Manage Subscription" : "Upgrade to Pro"}
              </Link>
            </div>

            {/* Enterprise Tier */}
            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Executive Enterprise</h3>
                <div className="text-3xl font-black text-white">$79 <span className="text-xs text-slate-500 font-normal">/ month</span></div>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Unlimited Applications</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Priority Worker Queue</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Dedicated Account Manager</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Developer API Keys & Webhooks</li>
                </ul>
              </div>
              <Link to={isAuthenticated ? "/dashboard" : "/register"} className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold text-xs text-center transition">
                {isAuthenticated ? "Go to Dashboard" : "Contact Sales"}
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
};

export default PublicLandingPage;
