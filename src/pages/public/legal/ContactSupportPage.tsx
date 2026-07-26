import type React from "react";
import { useState } from "react";
import { PublicHeader } from "../../../components/PublicHeader";
import { PublicFooter } from "../../../components/PublicFooter";
import { Mail, MessageSquare, ShieldCheck, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const ContactSupportPage: React.FC = () => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      toast.error("Please fill in both subject and message.");
      return;
    }
    setSent(true);
    toast.success("Support ticket submitted! Our team will respond shortly.");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      <PublicHeader />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-10">
        <div className="space-y-4 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
            <Mail className="h-3.5 w-3.5" /> 24/7 Support & Transparency Contact
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Contact & Support</h1>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
            Have questions about your data, security, or subscription? Reach out directly to our engineering and privacy response team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-indigo-400" /> Send Us a Message
            </h2>

            {sent ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 space-y-2 text-center">
                <CheckCircle2 className="h-8 w-8 mx-auto" />
                <h3 className="font-bold text-white text-sm">Ticket Received</h3>
                <p className="text-xs text-slate-300">Thank you. We typically respond within 2–4 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Privacy inquiry or Bug report"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Message</label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe how we can assist you..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" /> Submit Support Request
                </button>
              </form>
            )}
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Mail className="h-4 w-4 text-indigo-400" /> Key Contact Addresses
              </h3>
              <ul className="space-y-2 text-slate-300">
                <li><strong>General Support:</strong> support@autoapply.ai</li>
                <li><strong>Security & Privacy:</strong> security@autoapply.ai</li>
                <li><strong>Compliance & Legal:</strong> legal@autoapply.ai</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Trust Center Quick Links
              </h3>
              <p className="text-slate-400">
                Looking to download your data export or delete account history? Visit the <a href="/trust-center" className="text-indigo-400 font-bold hover:underline">Trust Center</a>.
              </p>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

export default ContactSupportPage;
