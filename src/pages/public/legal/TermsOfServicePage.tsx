import type React from "react";
import { PublicHeader } from "../../../components/PublicHeader";
import { PublicFooter } from "../../../components/PublicFooter";
import { FileText, Shield, CheckCircle2, AlertTriangle } from "lucide-react";

export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      <PublicHeader />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-10">
        <div className="space-y-4 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
            <FileText className="h-3.5 w-3.5" /> Effective Date: July 2026 • Version 1.0
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Terms of Service</h1>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
            Please review these Terms of Service governing your access to and use of AutoApply.ai, including our web portal, browser extension, and API services.
          </p>
        </div>

        <div className="space-y-8 text-xs text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">1. Agreement to Terms</h2>
            <p>
              By registering an account, connecting the Chrome extension, or accessing AutoApply.ai, you agree to be bound by these Terms of Service, Privacy Policy, and Cookie Policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">2. Permitted Service Use</h2>
            <p>
              AutoApply.ai provides automated job application tools, resume parsing, and social feed opportunity extraction. Users must ensure that all information uploaded (resumes, work history, contact details) is truthful and accurate.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">3. Platform Compliance & User Responsibility</h2>
            <p>
              Users are responsible for ensuring their usage of job portals (LinkedIn, Naukri) complies with respective terms. AutoApply.ai operates via client-side session synchronization, but users maintain full ownership and discretion over their job application activity.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">4. Subscriptions & Payment Terms</h2>
            <p>
              Pro and Enterprise subscriptions renew on a monthly basis. Cancellations take effect at the end of the current billing cycle. Refund guidelines are governed by our Refund & Cancellation Policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">5. Account Termination</h2>
            <p>
              You may terminate your account at any time via the User Settings or Trust Center. We reserve the right to suspend accounts engaged in malicious activity, credential scraping, or service abuse.
            </p>
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

export default TermsOfServicePage;
