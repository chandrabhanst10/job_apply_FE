import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  Chrome, 
  Cpu, 
  Key, 
  UserCheck, 
  Trash2, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ChevronDown,
  LogOut,
  Globe,
  Radio,
  Server,
} from "lucide-react";
import { PublicHeader } from "../../components/PublicHeader";
import { PublicFooter } from "../../components/PublicFooter";
import { useAuthStore } from "../../store/authStore";
import { client } from "../../api/client";
import { toast } from "sonner";

export const TrustCenterPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    "security" | "data" | "extension" | "ai" | "permissions" | "dashboard" | "control" | "compliance" | "faq"
  >("security");

  const [sessions, setSessions] = useState<Array<{ id: string; createdByIp: string | null; userAgent: string | null; createdAt: string; isRevoked: boolean }>>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const res = await client.get("/compliance/sessions");
      if (res.data?.success) {
        setSessions(res.data.data.sessions || []);
      }
    } catch {
      toast.error("Failed to load active sessions.");
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || activeTab !== "dashboard") return;

    let cancelled = false;

    client
      .get("/compliance/sessions")
      .then((res) => {
        if (!cancelled && res.data?.success) {
          setSessions(res.data.data.sessions || []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Failed to load active sessions.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingSessions(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, activeTab]);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const res = await client.delete(`/compliance/sessions/${sessionId}`);
      if (res.data.success) {
        toast.success("Session revoked successfully.");
        loadSessions();
      }
    } catch {
      toast.error("Failed to revoke session.");
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const response = await client.get("/compliance/export-data", {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `user_data_export_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Data export downloaded successfully!");
    } catch {
      toast.error("Data export failed or requires sign in.");
    } finally {
      setExporting(false);
    }
  };

  const handleDataAction = async (type: "delete_resumes" | "delete_ai_history" | "delete_account") => {
    if (!isAuthenticated) {
      toast.error("Please sign in to execute data actions.");
      return;
    }
    const confirmMessage = 
      type === "delete_account" 
        ? "Are you sure you want to delete your entire account? This action is irreversible." 
        : `Are you sure you want to request '${type}'?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      const res = await client.post("/compliance/request-action", { type });
      if (res.data.success) {
        toast.success(`Data action '${type}' completed successfully.`);
        if (type === "delete_account") {
          useAuthStore.getState().logoutUser();
          window.location.href = "/";
        }
      }
    } catch {
      toast.error("Failed to execute data action.");
    }
  };

  const permissionsList = [
    {
      permission: "storage",
      reason: "Local synchronization of preferences & auto-apply state",
      benefit: "Saves your targeted keywords and session state across browser tabs",
      optional: false,
      example: "Storing job title preferences like 'React Developer' locally in Chrome"
    },
    {
      permission: "cookies",
      reason: "Secure authentication session sync with LinkedIn & Naukri",
      benefit: "Allows auto-apply without asking for your password or credentials",
      optional: false,
      example: "Syncing encrypted session cookie tokens so AI can auto-submit applications"
    },
    {
      permission: "activeTab / tabs",
      reason: "Detecting recruiter posts and job application pages in open tabs",
      benefit: "Automates form filling on Easy Apply modals and job posting feeds",
      optional: false,
      example: "Extracting job title & recruiter details from current active LinkedIn tab"
    },
    {
      permission: "scripting",
      reason: "Injecting automated helper script to click 'Next' and 'Submit'",
      benefit: "Automates repetitive form clicks seamlessly",
      optional: false,
      example: "Filling ATS resume fields and submitting applications on job portals"
    },
    {
      permission: "Host: *.linkedin.com & *.naukri.com",
      reason: "Automating application workflows directly on target job portals",
      benefit: "Executes job matching directly on official platform domains",
      optional: false,
      example: "Scanning feeds for recruiter hiring posts on linkedin.com"
    }
  ];

  const faqs = [
    {
      q: "Do you ever store my LinkedIn or Naukri account password?",
      a: "NEVER. We do not ask for, accept, or store your passwords. The Chrome extension uses encrypted session cookie synchronization to interact with job portals directly on your device."
    },
    {
      q: "Is my resume or profile data used to train AI models?",
      a: "No. Your resumes, profiles, and job applications remain strictly private. We never share your data with public AI datasets or use your personal inputs for training base AI models."
    },
    {
      q: "How can I export or permanently delete all my stored data?",
      a: "You can download a complete JSON export of all your stored data anytime from the Trust Center or Settings page. You can also trigger instant deletion of your resumes, AI history, or full account deletion with a single click."
    },
    {
      q: "How are my session cookies protected?",
      a: "Session tokens are encrypted using military-grade AES-256 encryption both in-transit and at-rest, transmitted exclusively over TLS 1.3 HTTPS, and stored in HTTP-only isolated storage."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
      <PublicHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 space-y-12">
        {/* Banner / Hero */}
        <div className="relative rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/30 p-8 md:p-12 overflow-hidden shadow-2xl">
          <div className="absolute -right-12 -bottom-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
              <ShieldCheck className="h-4 w-4 text-indigo-400" /> Enterprise SaaS Security & Transparency
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              Trust & Compliance Center
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              We are committed to total transparency. Explore how your personal data is protected, how our browser extension operates without storing passwords, how AI handles your resume, and how you maintain complete control over your information.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-2 text-xs font-bold scrollbar-none">
          {[
            { id: "security", label: "Security Architecture", icon: Lock },
            { id: "data", label: "Data Collection", icon: Database },
            { id: "extension", label: "Extension Transparency", icon: Chrome },
            { id: "ai", label: "AI Ethics & Model Usage", icon: Cpu },
            { id: "permissions", label: "Permissions Breakdown", icon: Key },
            { id: "dashboard", label: "Security Dashboard", icon: Radio },
            { id: "control", label: "Data Controls & Erasure", icon: UserCheck },
            { id: "compliance", label: "Compliance Readiness", icon: ShieldCheck },
            { id: "faq", label: "Trust FAQ", icon: HelpCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="space-y-8">
          {/* TAB 1: Security Architecture */}
          {activeTab === "security" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">AES-256 Encryption</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Sensitive session data, tokens, and storage objects are encrypted at rest using AES-256 GCM cryptographic standards.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Globe className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">TLS 1.3 & HTTPS</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    All network traffic between browser extension, web application, and API servers strictly enforces TLS 1.3 encryption.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                    <Key className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">JWT & HTTP-Only Cookies</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Authentication uses short-lived JWT access tokens and HTTP-only, secure, SameSite cookies to block XSS vector theft.
                  </p>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Server className="h-5 w-5 text-indigo-400" /> Infrastructure Security Controls
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Password Hashing:</strong> Passwords are hashed using bcrypt with salt factor 12. Plaintext passwords are never stored or logged.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>CSRF & Rate Limiting:</strong> Double-submit CSRF token verification and strict IP rate limiting prevent automated attacks.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Zero Password Vault:</strong> We never handle or store your LinkedIn or Naukri passwords. Session cookies are synced directly.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Automated Audit Logs:</strong> Security audit logs track authentication, permission grants, and data exports.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: Data Collection */}
          {activeTab === "data" && (
            <div className="space-y-6">
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Database className="h-5 w-5 text-indigo-400" /> Transparent Data Handling
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-3 px-4">Data Type</th>
                        <th className="py-3 px-4">Purpose</th>
                        <th className="py-3 px-4">Retention Period</th>
                        <th className="py-3 px-4">Access Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      <tr>
                        <td className="py-3.5 px-4 font-bold text-white">Account Profile (Email, Name)</td>
                        <td className="py-3.5 px-4">Authentication and service notifications</td>
                        <td className="py-3.5 px-4">Until account deletion</td>
                        <td className="py-3.5 px-4 text-emerald-400 font-semibold">Strictly User-Owned</td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-4 font-bold text-white">Uploaded Resumes (.pdf, .docx)</td>
                        <td className="py-3.5 px-4">AI skill extraction and job matching</td>
                        <td className="py-3.5 px-4">Until user deletes file or account</td>
                        <td className="py-3.5 px-4 text-emerald-400 font-semibold">Encrypted Storage</td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-4 font-bold text-white">Application History & Preferences</td>
                        <td className="py-3.5 px-4">Prevent duplicate applications and track stats</td>
                        <td className="py-3.5 px-4">User controllable</td>
                        <td className="py-3.5 px-4 text-emerald-400 font-semibold">User Accessible</td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-4 font-bold text-white">Encrypted Session Tokens</td>
                        <td className="py-3.5 px-4">Auto-apply execution via browser extension</td>
                        <td className="py-3.5 px-4">Active session duration only</td>
                        <td className="py-3.5 px-4 text-emerald-400 font-semibold">AES-256 Vault</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Extension Transparency */}
          {activeTab === "extension" && (
            <div className="space-y-6">
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Chrome className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Browser Extension Architecture</h3>
                    <p className="text-xs text-slate-400">How the AutoApply Chrome extension operates securely</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-xs text-slate-300">
                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" /> Zero Password Storage Guarantee
                    </h4>
                    <p className="text-slate-400 leading-relaxed">
                      The Chrome extension operates by synchronizing active browser authentication cookies directly with your permission. We NEVER prompt for or store your LinkedIn/Naukri passwords.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-indigo-400" /> One-Click Revocation
                    </h4>
                    <p className="text-slate-400 leading-relaxed">
                      You can instantly disconnect the extension or clear synced session cookies anytime from the extension popup, user settings, or Chrome permissions page.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI Transparency */}
          {activeTab === "ai" && (
            <div className="space-y-6">
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                    <Cpu className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">AI Processing & Model Governance</h3>
                    <p className="text-xs text-slate-400">Our commitment to AI privacy, ethics, and accuracy</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs text-slate-300">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white text-sm">No Private Data Training:</strong> Your resumes, job post interactions, and personal information are strictly isolated and NEVER used to train or fine-tune public base AI models.
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white text-sm">Deterministic Prompt Engineering:</strong> AI prompts extract objective skills, calculate keyword match percentages, and construct tailored cover letters based strictly on your uploaded resume data.
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white text-sm">AI Limitations & Human Review:</strong> AI recommendations provide suitability scores, but candidates maintain full control to set minimum match thresholds and manually review applications before submission.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Permissions Breakdown */}
          {activeTab === "permissions" && (
            <div className="space-y-6">
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Key className="h-5 w-5 text-indigo-400" /> Chrome Extension Permission Guide
                </h3>

                <div className="space-y-4">
                  {permissionsList.map((item, idx) => (
                    <div key={idx} className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-bold text-indigo-400">{item.permission}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
                          {item.optional ? "Optional" : "Required"}
                        </span>
                      </div>
                      <p className="text-xs text-white font-semibold">{item.reason}</p>
                      <p className="text-xs text-slate-400"><strong>User Benefit:</strong> {item.benefit}</p>
                      <p className="text-[11px] text-slate-500 font-mono">Example: {item.example}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Security Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Radio className="h-5 w-5 text-indigo-400" /> Security & Active Session Dashboard
                    </h3>
                    <p className="text-xs text-slate-400">View connected devices and manage active authentication sessions</p>
                  </div>
                  {isAuthenticated && (
                    <button
                      onClick={loadSessions}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1.5 transition"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Refresh
                    </button>
                  )}
                </div>

                {!isAuthenticated ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <p className="text-xs text-slate-400">Please sign in to view your live security dashboard and manage connected sessions.</p>
                    <Link to="/login" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white">
                      Sign In to Dashboard
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {loadingSessions ? (
                      <div className="text-xs text-slate-400 animate-pulse">Loading active sessions...</div>
                    ) : sessions.length === 0 ? (
                      <div className="text-xs text-slate-400">No active sessions found.</div>
                    ) : (
                      <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
                        {sessions.map((s) => (
                          <div key={s.id} className="p-4 flex items-center justify-between text-xs">
                            <div className="space-y-1">
                              <div className="font-bold text-white flex items-center gap-2">
                                IP: {s.createdByIp || "Unknown"}
                                {s.isRevoked && <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px]">Revoked</span>}
                              </div>
                              <div className="text-slate-400 text-[11px] truncate max-w-md">{s.userAgent || "Browser Agent"}</div>
                              <div className="text-slate-500 text-[10px]">Created: {new Date(s.createdAt).toLocaleString()}</div>
                            </div>
                            {!s.isRevoked && (
                              <button
                                onClick={() => handleRevokeSession(s.id)}
                                className="px-3 py-1.5 rounded-lg bg-red-600/20 border border-red-500/30 text-red-300 hover:bg-red-600 hover:text-white transition text-xs font-bold flex items-center gap-1"
                              >
                                <LogOut className="h-3.5 w-3.5" /> Revoke
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: Data Controls & Erasure */}
          {activeTab === "control" && (
            <div className="space-y-6">
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-indigo-400" /> Data Ownership & Control Panel
                  </h3>
                  <p className="text-xs text-slate-400">Instant access to export or permanently delete your stored information</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Download className="h-4 w-4 text-indigo-400" /> Export All Data (JSON)
                    </h4>
                    <p className="text-slate-400 leading-relaxed">
                      Download a structured, machine-readable JSON file containing your account profile, preferences, resume metadata, and application history.
                    </p>
                    <button
                      onClick={handleExportData}
                      disabled={exporting}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold transition flex items-center justify-center gap-2"
                    >
                      <Download className="h-4 w-4" /> {exporting ? "Preparing Export..." : "Download Full Data Export"}
                    </button>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2 text-red-400">
                      <Trash2 className="h-4 w-4 text-red-400" /> Permanent Erasure Controls
                    </h4>
                    <p className="text-slate-400 leading-relaxed">
                      Execute immediate right-to-be-forgotten requests for your resumes, AI logs, or complete account deletion.
                    </p>
                    <div className="space-y-2 pt-1">
                      <button
                        onClick={() => handleDataAction("delete_resumes")}
                        className="w-full py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500/40 text-slate-200 hover:text-red-300 font-bold transition flex items-center justify-center gap-2"
                      >
                        Delete Uploaded Resumes
                      </button>
                      <button
                        onClick={() => handleDataAction("delete_ai_history")}
                        className="w-full py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500/40 text-slate-200 hover:text-red-300 font-bold transition flex items-center justify-center gap-2"
                      >
                        Purge AI Generation History
                      </button>
                      <button
                        onClick={() => handleDataAction("delete_account")}
                        className="w-full py-2.5 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white font-bold transition flex items-center justify-center gap-2"
                      >
                        Delete Entire Account & Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: Compliance Readiness */}
          {activeTab === "compliance" && (
            <div className="space-y-6">
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-indigo-400" /> Global Compliance Readiness
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="font-bold text-white text-sm text-emerald-400">GDPR Compliance Ready</h4>
                    <ul className="space-y-2 text-slate-300">
                      <li>• Right of Access: Automated JSON data export</li>
                      <li>• Right to Erasure: Instant account & document purging</li>
                      <li>• Data Portability: Standard structured exports</li>
                      <li>• Explicit Consent: Opt-in tracking for legal terms</li>
                    </ul>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="font-bold text-white text-sm text-indigo-400">CCPA / CPRA Ready</h4>
                    <ul className="space-y-2 text-slate-300">
                      <li>• Do Not Sell My Data: Zero data monetization</li>
                      <li>• Transparent Disclosure: Clear collection metrics</li>
                      <li>• Non-Discrimination: Equal service guarantees</li>
                      <li>• Direct Opt-Out: Granular analytics controls</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: FAQ */}
          {activeTab === "faq" && (
            <div className="space-y-6">
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-indigo-400" /> Frequently Asked Questions
                </h3>

                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                        className="w-full p-5 text-left flex items-center justify-between font-bold text-white text-xs hover:text-indigo-400 transition"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${openFaq === index ? "rotate-180 text-indigo-400" : "text-slate-500"}`} />
                      </button>
                      {openFaq === index && (
                        <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default TrustCenterPage;
