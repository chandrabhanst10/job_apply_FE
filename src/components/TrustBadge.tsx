import type React from "react";
import { ShieldCheck, Lock, Database, Eye, RefreshCw } from "lucide-react";

export interface TrustBadgeProps {
  type?: "encryption" | "zero_password" | "user_control" | "ai_privacy" | "gdpr";
  size?: "sm" | "md";
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ type = "encryption", size = "sm" }) => {
  const configs = {
    encryption: {
      label: "256-Bit SSL Encrypted Connection",
      icon: ShieldCheck,
      color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
    },
    zero_password: {
      label: "No Password Storage for LinkedIn/Naukri",
      icon: Lock,
      color: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
    },
    user_control: {
      label: "100% User-Controlled Data & Instant Erasure",
      icon: Database,
      color: "bg-violet-500/10 border-violet-500/20 text-violet-400"
    },
    ai_privacy: {
      label: "AI Privacy Guaranteed (No Model Training)",
      icon: Eye,
      color: "bg-sky-500/10 border-sky-500/20 text-sky-400"
    },
    gdpr: {
      label: "GDPR & CCPA Compliant Architecture",
      icon: RefreshCw,
      color: "bg-amber-500/10 border-amber-500/20 text-amber-400"
    }
  };

  const item = configs[type];
  const Icon = item.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-bold ${item.color} ${size === "sm" ? "text-[11px]" : "text-xs"}`}>
      <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      {item.label}
    </span>
  );
};

export default TrustBadge;
