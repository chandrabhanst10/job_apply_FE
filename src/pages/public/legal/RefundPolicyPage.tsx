import type React from "react";
import { PublicHeader } from "../../../components/PublicHeader";
import { PublicFooter } from "../../../components/PublicFooter";
import { DollarSign } from "lucide-react";

export const RefundPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      <PublicHeader />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-10">
        <div className="space-y-4 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
            <DollarSign className="h-3.5 w-3.5" /> Refund & Cancellation Policy
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Refund & Cancellation Policy</h1>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
            Transparent pricing and customer satisfaction are core priorities. Read our policies on subscription renewals, cancellations, and refund eligibility.
          </p>
        </div>

        <div className="space-y-8 text-xs text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">1. Subscription Cancellation</h2>
            <p>
              You can cancel your Pro or Enterprise subscription anytime from your Dashboard or User Settings. Once cancelled, your subscription remains active until the end of the paid billing period, and no further charges will be incurred.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">2. 7-Day Refund Guarantee</h2>
            <p>
              New subscribers are eligible for a 100% full refund within 7 days of their initial purchase if they are unsatisfied with the service. Contact support@autoapply.ai to request a refund.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">3. Refund Processing</h2>
            <p>
              Approved refunds are credited back to the original payment method within 5–10 business days.
            </p>
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

export default RefundPolicyPage;
