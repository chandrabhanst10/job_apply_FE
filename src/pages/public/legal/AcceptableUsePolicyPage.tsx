import type React from "react";
import { PublicHeader } from "../../../components/PublicHeader";
import { PublicFooter } from "../../../components/PublicFooter";
import { Shield, AlertOctagon, CheckCircle2 } from "lucide-react";

export const AcceptableUsePolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      <PublicHeader />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-10">
        <div className="space-y-4 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
            <Shield className="h-3.5 w-3.5" /> Acceptable Use Policy
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Acceptable Use Policy</h1>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
            Guidelines and rules governing fair, responsible, and legal usage of AutoApply.ai.
          </p>
        </div>

        <div className="space-y-8 text-xs text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">1. Prohibited Conduct</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>Submitting false or fraudulent resume details to prospective employers.</li>
              <li>Attempting to reverse-engineer, decompile, or extract backend API source code.</li>
              <li>Using automated scripts to launch denial of service (DoS) attacks on AutoApply servers.</li>
              <li>Misusing browser extension access to harvest unapproved recruiter credentials.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">2. Rate Limiting & Fair Use</h2>
            <p>
              To ensure platform stability, account tier limits (e.g., maximum daily applications) are enforced. Bypassing rate limits is strictly prohibited.
            </p>
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

export default AcceptableUsePolicyPage;
