import type React from "react";
import { PublicHeader } from "../../../components/PublicHeader";
import { PublicFooter } from "../../../components/PublicFooter";
import { FileText } from "lucide-react";

export const DMCAPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      <PublicHeader />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-10">
        <div className="space-y-4 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold">
            <FileText className="h-3.5 w-3.5" /> Copyright Protection
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Copyright & DMCA Policy</h1>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
            AutoApply.ai respects intellectual property rights. Read our procedures for submitting DMCA takedown notices.
          </p>
        </div>

        <div className="space-y-8 text-xs text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">Submitting a DMCA Takedown Notice</h2>
            <p>
              If you believe content hosted on AutoApply.ai infringes your copyright, send a written notice containing details of the copyrighted work and contact details to <strong>dmca@autoapply.ai</strong>.
            </p>
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

export default DMCAPolicyPage;
