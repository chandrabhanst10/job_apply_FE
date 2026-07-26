import type React from "react";
import { PublicHeader } from "../../../components/PublicHeader";
import { PublicFooter } from "../../../components/PublicFooter";
import { ShieldCheck, FileText, Lock, Eye, Database, Server, RefreshCw } from "lucide-react";

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      <PublicHeader />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-10">
        <div className="space-y-4 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
            <ShieldCheck className="h-3.5 w-3.5" /> Effective Date: July 2026 • Version 1.0
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Privacy Policy</h1>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
            Your privacy is fundamental to our architecture. This Privacy Policy details how AutoApply.ai collects, protects, uses, and provides user control over personal data and browser credentials.
          </p>
        </div>

        <div className="space-y-8 text-xs text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="h-4 w-4 text-indigo-400" /> 1. Information We Collect
            </h2>
            <p>We strictly collect data required to provide job application automation services:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Account Credentials:</strong> Email address, hashed password, name, and profile preference settings.</li>
              <li><strong>Career Information:</strong> Uploaded resumes, technical skills, target job titles, preferred locations, and work experience.</li>
              <li><strong>Browser Extension Tokens:</strong> Encrypted browser session cookies synced exclusively for LinkedIn and Naukri application execution. Passwords are never collected or stored.</li>
              <li><strong>Application Telemetry:</strong> Log of automated job applications, match scores, and status timestamps.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-400" /> 2. Zero Password Policy
            </h2>
            <p>
              We do NOT collect, store, or transmit your LinkedIn or Naukri account passwords. Our Chrome extension uses local browser session tokens to execute tasks on your behalf without ever possessing your master login credentials.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Eye className="h-4 w-4 text-violet-400" /> 3. AI Data Processing Guarantees
            </h2>
            <p>
              Your uploaded resumes and application inputs are processed by our isolated AI pipeline to extract skills and format cover letters. We do <strong>NOT</strong> share your personal data with public AI training sets or sell data to third-party data brokers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="h-4 w-4 text-sky-400" /> 4. Data Security & Storage
            </h2>
            <p>
              All data at rest is encrypted using AES-256 standards. All data in transit is protected using TLS 1.3 HTTPS protocols. Authentication sessions are secured via short-lived JWT tokens and HTTP-only cookies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-amber-400" /> 5. Data Control & Account Erasure
            </h2>
            <p>
              Under GDPR and CCPA guidelines, you retain total ownership of your data. You may download a full JSON copy of your data or permanently delete your account, resumes, and logs instantly via the Trust Center or User Settings page.
            </p>
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

export default PrivacyPolicyPage;
