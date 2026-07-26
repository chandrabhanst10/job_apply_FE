import type React from "react";
import { PublicHeader } from "../../../components/PublicHeader";
import { PublicFooter } from "../../../components/PublicFooter";
import { Cookie, ShieldCheck, Lock } from "lucide-react";

export const CookiePolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      <PublicHeader />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-10">
        <div className="space-y-4 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
            <Cookie className="h-3.5 w-3.5" /> Effective Date: July 2026 • Version 1.0
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Cookie Policy</h1>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
            This Cookie Policy explains how AutoApply.ai uses cookies, local storage, and session tokens to deliver secure authentication and browser extension automation.
          </p>
        </div>

        <div className="space-y-8 text-xs text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">1. What Are Cookies?</h2>
            <p>
              Cookies and local storage objects are small files stored on your browser or device. They enable secure session management, prevent cross-site request forgery (CSRF), and maintain user preferences.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-base font-bold text-white">2. Categories of Cookies We Use</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h3 className="font-bold text-white text-xs flex items-center gap-2">
                  <Lock className="h-4 w-4 text-emerald-400" /> Essential Cookies (Strictly Required)
                </h3>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Used for authentication tokens (JWT), CSRF protection (`csrfToken`), and active user session state. Cannot be disabled without breaking service login.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h3 className="font-bold text-white text-xs flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-400" /> Extension Session Sync Cookies
                </h3>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Encrypted local cookie tokens used exclusively by the Chrome extension to authenticate job application requests on LinkedIn and Naukri.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">3. Security Attributes</h2>
            <p>
              All cookies set by AutoApply.ai incorporate industry-standard security flags: <code>HttpOnly</code> (prevents JavaScript access), <code>Secure</code> (requires HTTPS transmission), and <code>SameSite=Lax</code> (mitigates CSRF vulnerabilities).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">4. Managing Your Cookie Preferences</h2>
            <p>
              You can clear cookies or revoke browser extension permissions anytime via your browser settings or directly in the AutoApply Trust Center and User Settings.
            </p>
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

export default CookiePolicyPage;
