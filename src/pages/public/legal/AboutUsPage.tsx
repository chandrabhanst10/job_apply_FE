import type React from "react";
import { PublicHeader } from "../../../components/PublicHeader";
import { PublicFooter } from "../../../components/PublicFooter";
import { Bot, ShieldCheck, Zap, HeartHandshake } from "lucide-react";

export const AboutUsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      <PublicHeader />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-10">
        <div className="space-y-4 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
            <Bot className="h-3.5 w-3.5" /> Next-Gen Career Operating System
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">About AutoApply.ai</h1>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
            Empowering candidates with privacy-first AI automation to streamline job searching, resume optimization, and targeted application workflows.
          </p>
        </div>

        <div className="space-y-8 text-xs text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">Our Mission</h2>
            <p>
              Job searching is fragmented, repetitive, and time-consuming. AutoApply.ai was built to give job seekers an intelligent AI co-pilot that scans social feeds, extracts verified recruiter opportunities, tailors ATS resumes, and auto-submits targeted applications—without ever asking for passwords or compromising candidate privacy.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <ShieldCheck className="h-6 w-6 text-indigo-400" />
              <h3 className="font-bold text-white text-sm">Privacy First</h3>
              <p className="text-slate-400 text-[11px]">Zero password storage, AES-256 encrypted tokens, and complete user data ownership.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <Zap className="h-6 w-6 text-amber-400" />
              <h3 className="font-bold text-white text-sm">Autonomous AI</h3>
              <p className="text-slate-400 text-[11px]">Intelligent feed scanning and deterministic ATS keyword match scoring.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <HeartHandshake className="h-6 w-6 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">Candidate Control</h3>
              <p className="text-slate-400 text-[11px]">Full transparency, instant data export, and single-click account erasure.</p>
            </div>
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

export default AboutUsPage;
