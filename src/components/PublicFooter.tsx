import type React from "react";
import { Link } from "react-router-dom";
import { Bot, ShieldCheck, Lock } from "lucide-react";

export const PublicFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-xs text-slate-400 font-sans pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Col 1: Brand & Trust */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-white font-black text-lg">
              <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <Bot className="h-4 w-4" />
              </div>
              AutoApply.ai
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Enterprise-grade AI Career Operating System. Privacy-first, zero password storage for LinkedIn/Naukri, AES-256 encrypted token sync, and total user data control.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                <ShieldCheck className="h-3.5 w-3.5" /> 256-Bit SSL Encrypted
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-bold">
                <Lock className="h-3.5 w-3.5" /> No Password Storage
              </span>
            </div>
          </div>

          {/* Col 2: Trust & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Trust & Safety</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/trust-center" className="hover:text-indigo-400 text-indigo-400 font-bold transition flex items-center gap-1">
                  Trust Center
                </Link>
              </li>
              <li><Link to="/security-policy" className="hover:text-white transition">Security Architecture</Link></li>
              <li><Link to="/ai-usage" className="hover:text-white transition">AI Ethics & Safety</Link></li>
              <li><Link to="/extension-privacy" className="hover:text-white transition">Extension Privacy</Link></li>
              <li><Link to="/vulnerability-disclosure" className="hover:text-white transition">Vulnerability Disclosure</Link></li>
            </ul>
          </div>

          {/* Col 3: Legal Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Legal & Terms</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
              <li><Link to="/cookies" className="hover:text-white transition">Cookie Policy</Link></li>
              <li><Link to="/data-retention" className="hover:text-white transition">Data Retention Policy</Link></li>
              <li><Link to="/acceptable-use" className="hover:text-white transition">Acceptable Use Policy</Link></li>
              <li><Link to="/refund-policy" className="hover:text-white transition">Refund & Cancellation</Link></li>
              <li><Link to="/dmca" className="hover:text-white transition">DMCA & Copyright</Link></li>
            </ul>
          </div>

          {/* Col 4: Support & Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Support & Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/contact" className="hover:text-white transition">Contact Support</Link></li>
              <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link to="/status" className="hover:text-white transition flex items-center gap-1">System Status <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /></Link></li>
              <li><a href="/docs" target="_blank" rel="noreferrer" className="hover:text-white transition">Developer Docs</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/60 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} AutoApply.ai. All rights reserved. Registered SaaS Compliance System.
          </div>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-300">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-300">Terms</Link>
            <Link to="/cookies" className="hover:text-slate-300">Cookies</Link>
            <Link to="/trust-center" className="hover:text-slate-300">Trust Center</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
