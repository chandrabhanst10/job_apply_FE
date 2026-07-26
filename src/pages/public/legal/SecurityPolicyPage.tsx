import type React from "react";
import { PublicHeader } from "../../../components/PublicHeader";
import { PublicFooter } from "../../../components/PublicFooter";
import { ShieldCheck, Lock, Server } from "lucide-react";

export const SecurityPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      <PublicHeader />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-10">
        <div className="space-y-4 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <ShieldCheck className="h-3.5 w-3.5" /> Security Architecture & Controls
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Security Policy</h1>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
            Our comprehensive technical defense architecture, cryptographic standards, and infrastructure security controls.
          </p>
        </div>

        <div className="space-y-8 text-xs text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-400" /> 1. Encryption Standards
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Data at Rest:</strong> AES-256 GCM cryptographic encryption for stored tokens and database records.</li>
              <li><strong>Data in Transit:</strong> TLS 1.3 encryption with strict HTTP Strict Transport Security (HSTS) headers.</li>
              <li><strong>Password Hashing:</strong> Passwords hashed using salted bcrypt algorithm (cost factor 12).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="h-4 w-4 text-indigo-400" /> 2. Network & Application Security
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Short-lived JSON Web Tokens (JWT) for API authorization.</li>
              <li>Double-submit CSRF token validation on mutating endpoints.</li>
              <li>Strict CORS policies limiting cross-origin request headers.</li>
              <li>Rate limiting on authentication and token sync endpoints.</li>
            </ul>
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

export default SecurityPolicyPage;
