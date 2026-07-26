import type React from "react";
import { PublicHeader } from "../../../components/PublicHeader";
import { PublicFooter } from "../../../components/PublicFooter";
import { Cpu, Lock, Sparkles } from "lucide-react";

export const AIUsagePolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      <PublicHeader />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-10">
        <div className="space-y-4 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold">
            <Cpu className="h-3.5 w-3.5" /> AI Safety, Ethics & Transparency
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">AI Usage Policy</h1>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
            How AutoApply.ai utilizes artificial intelligence for resume parsing, opportunity scoring, and cover letter generation while guaranteeing absolute data isolation.
          </p>
        </div>

        <div className="space-y-8 text-xs text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-400" /> 1. AI Model Privacy Guarantees
            </h2>
            <p>
              We maintain strict isolation boundaries with AI model providers. Your uploaded resumes, technical skills, and candidate profile data are sent via encrypted, stateless API endpoints. <strong>Your personal data is NEVER retained by AI providers or used to train foundation models.</strong>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-400" /> 2. AI Capabilities & Purpose
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li><strong>Resume Extraction:</strong> Extracting technical skills, ATS keyword density, and top matching job titles.</li>
              <li><strong>Job Posting Extraction:</strong> Classifying recruiter hiring posts from LinkedIn/Naukri social feeds.</li>
              <li><strong>ATS Match Scoring:</strong> Calculating percentage alignment between candidate resume and job descriptions.</li>
              <li><strong>Tailored Cover Letters:</strong> Generating customized 3-paragraph professional cover letters matching job requirements.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">3. Limitations & Candidate Autonomy</h2>
            <p>
              AI recommendations provide decision support scores. Candidates maintain full authority to set minimum score thresholds, customize prompts, or enable manual review before job application submission.
            </p>
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

export default AIUsagePolicyPage;
