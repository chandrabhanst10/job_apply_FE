import type React from "react";
import { PublicHeader } from "../../../components/PublicHeader";
import { PublicFooter } from "../../../components/PublicFooter";
import { Chrome, ShieldCheck, Lock, RefreshCw } from "lucide-react";

export const ExtensionPrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      <PublicHeader />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-10">
        <div className="space-y-4 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
            <Chrome className="h-3.5 w-3.5" /> Chrome Extension Specific Policy
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Browser Extension Privacy Policy</h1>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
            Specific privacy and security practices governing the official AutoApply Chrome Extension.
          </p>
        </div>

        <div className="space-y-8 text-xs text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-400" /> 1. No Password Collection
            </h2>
            <p>
              The extension NEVER collects, prompts for, or transmits your LinkedIn or Naukri passwords. All platform interactions rely on existing active browser session cookies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-400" /> 2. Scope of Extension Access
            </h2>
            <p>
              The extension requests host permissions strictly for <code>*.linkedin.com</code> and <code>*.naukri.com</code>. It does NOT read or monitor browsing activity on any non-job portals.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-amber-400" /> 3. One-Click Extension Revocation
            </h2>
            <p>
              You can instantly disable the extension or revoke permissions anytime in Chrome via <code>chrome://extensions</code> or through the Trust Center.
            </p>
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

export default ExtensionPrivacyPolicyPage;
