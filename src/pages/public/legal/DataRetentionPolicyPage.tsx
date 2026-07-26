import type React from "react";
import { PublicHeader } from "../../../components/PublicHeader";
import { PublicFooter } from "../../../components/PublicFooter";
import { Clock } from "lucide-react";

export const DataRetentionPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      <PublicHeader />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-10">
        <div className="space-y-4 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
            <Clock className="h-3.5 w-3.5" /> Effective Date: July 2026 • Version 1.0
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Data Retention Policy</h1>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
            This policy outlines how long personal data, uploaded documents, session logs, and application history are retained, along with our automated purge schedules.
          </p>
        </div>

        <div className="space-y-8 text-xs text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">1. Retention Schedule Summary</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Data Type</th>
                    <th className="py-3 px-4">Retention Period</th>
                    <th className="py-3 px-4">Deletion Trigger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="py-3 px-4 font-bold text-white">Uploaded Resumes (.pdf, .docx)</td>
                    <td className="py-3 px-4">Active account duration</td>
                    <td className="py-3 px-4">User document deletion or account closure</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-white">Encrypted Session Cookies</td>
                    <td className="py-3 px-4">Active session TTL (max 30 days)</td>
                    <td className="py-3 px-4">Logout, token revocation, or browser disconnect</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-white">Security Audit Logs</td>
                    <td className="py-3 px-4">90 days</td>
                    <td className="py-3 px-4">Automated database rolling log purge</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">2. Immediate User-Triggered Purges</h2>
            <p>
              Users can execute instant deletion requests for their resumes, AI history, or full account data via the Trust Center or User Settings. Once triggered, database records and uploaded files are deleted.
            </p>
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

export default DataRetentionPolicyPage;
