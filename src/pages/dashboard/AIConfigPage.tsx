import type React from "react";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Skeleton } from "../../components/ui/Skeleton";
import { toast } from "sonner";
import { client } from "../../api/client";
import { 
  Bot, 
  Sparkles, 
  Save, 
  Terminal, 
  CheckCircle2, 
  Briefcase, 
  Bell, 
  RotateCcw, 
  Play, 
  X, 
  Globe, 
  AlertTriangle,
  FileCode
} from "lucide-react";

interface PromptItem {
  promptKey: string;
  name: string;
  category: string;
  description: string;
  defaultPrompt: string;
  currentPrompt: string;
  version: number;
  isCustomized: boolean;
  updatedAt: string;
}

interface JobPreferences {
  preferredTitles: string[];
  preferredSkills: string[];
  preferredIndustries: string[];
  experienceLevel: "entry" | "mid" | "senior" | "lead" | "executive" | "any";
  employmentType: "full_time" | "part_time" | "contract" | "internship" | "any";
  workMode: "remote" | "hybrid" | "onsite" | "any";
  minSalary: number;
  maxSalary: number;
  preferredCompanies: string[];
  blockedCompanies: string[];
  preferredTechnologies: string[];
  preferredKeywords: string[];
  blockedKeywords: string[];
  minResumeMatch: number;
  minAiConfidence: number;
}



interface NotificationSettings {
  newJobFound: boolean;
  applicationSuccess: boolean;
  applicationFailure: boolean;
  recruiterReply: boolean;
  aiErrors: boolean;
  dailySummary: boolean;
}

export const AIConfigPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"prompts" | "preferences" | "notifications">("prompts");
  const [isLoading, setIsLoading] = useState(true);

  // Prompts Management State
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [selectedPromptKey, setSelectedPromptKey] = useState<string>("resume_analysis");
  const [editedPromptText, setEditedPromptText] = useState<string>("");
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);
  const [isResettingPrompt, setIsResettingPrompt] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Prompt Testing Modal State
  const [showTestModal, setShowTestModal] = useState(false);
  const [testSampleInput, setTestSampleInput] = useState("Candidate Resume: Senior React & Node.js Developer with 5 years experience in TypeScript, Tailwind, MongoDB, AWS.");
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [isTestingPrompt, setIsTestingPrompt] = useState(false);

  // Form Inputs State for other tabs
  const [jobPrefEdits, setJobPrefEdits] = useState<JobPreferences | null>(null);
  const [notifEdits, setNotifEdits] = useState<NotificationSettings | null>(null);
  const [isSavingOther, setIsSavingOther] = useState(false);

  const fetchPromptsData = async () => {
    try {
      const [promptsRes, configRes] = await Promise.all([
        client.get("/prompts"),
        client.get("/users/ai-config")
      ]);

      const promptData = promptsRes.data.data as PromptItem[];
      setPrompts(promptData);

      setSelectedPromptKey((prev) => {
        const match = promptData.find((p) => p.promptKey === prev) || promptData[0];
        if (match) {
          setEditedPromptText(match.currentPrompt);
          return match.promptKey;
        }
        return prev;
      });

      const conf = configRes.data.data;
      if (conf.jobPreferences) setJobPrefEdits(conf.jobPreferences);
      if (conf.notifications) setNotifEdits(conf.notifications);
    } catch {
      toast.error("Failed to load AI Configuration settings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    Promise.all([
      client.get("/prompts"),
      client.get("/users/ai-config")
    ]).then(([promptsRes, configRes]) => {
      if (!active) return;

      const promptData = promptsRes.data.data as PromptItem[];
      setPrompts(promptData);

      setSelectedPromptKey((prev) => {
        const match = promptData.find((p) => p.promptKey === prev) || promptData[0];
        if (match) {
          setEditedPromptText(match.currentPrompt);
          return match.promptKey;
        }
        return prev;
      });

      const conf = configRes.data.data;
      if (conf.jobPreferences) setJobPrefEdits(conf.jobPreferences);
      if (conf.notifications) setNotifEdits(conf.notifications);
    }).catch(() => {
      if (!active) return;
      toast.error("Failed to load AI Configuration settings.");
    }).finally(() => {
      if (active) setIsLoading(false);
    });

    return () => { active = false; };
  }, []);

  const activePromptItem = prompts.find((p) => p.promptKey === selectedPromptKey);
  const isUnsaved = activePromptItem ? editedPromptText !== activePromptItem.currentPrompt : false;

  // Handle Save Prompt Override
  const handleSavePrompt = async () => {
    if (!activePromptItem) return;
    setIsSavingPrompt(true);
    try {
      await client.patch(`/prompts/${selectedPromptKey}`, {
        customPrompt: editedPromptText
      });
      toast.success(`Prompt "${activePromptItem.name}" saved successfully!`);
      fetchPromptsData();
    } catch {
      toast.error("Failed to save prompt override.");
    } finally {
      setIsSavingPrompt(false);
    }
  };

  // Handle Reset Prompt to Application Default
  const handleResetPrompt = async () => {
    if (!activePromptItem) return;
    setIsResettingPrompt(true);
    try {
      const res = await client.delete(`/prompts/${selectedPromptKey}`);
      toast.success(`Prompt "${activePromptItem.name}" reset to application default!`);
      setShowResetModal(false);
      setEditedPromptText(res.data.data.currentPrompt);
      fetchPromptsData();
    } catch {
      toast.error("Failed to reset prompt.");
    } finally {
      setIsResettingPrompt(false);
    }
  };

  // Handle Test Prompt
  const handleRunTestPrompt = async () => {
    setIsTestingPrompt(true);
    setTestOutput(null);
    try {
      const res = await client.post("/prompts/test", {
        promptText: editedPromptText,
        sampleInput: testSampleInput
      });
      setTestOutput(res.data.data.output);
      toast.success("Prompt test executed successfully!");
    } catch {
      toast.error("Failed to run prompt test.");
    } finally {
      setIsTestingPrompt(false);
    }
  };

  // Save other settings tabs
  const handleSaveOtherSettings = async () => {
    setIsSavingOther(true);
    try {
      await client.patch("/users/ai-config", {
        jobPreferences: jobPrefEdits,
        notifications: notifEdits
      });
      toast.success("Settings saved successfully!");
      fetchPromptsData();
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setIsSavingOther(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-100/60 dark:from-indigo-950/40 dark:via-slate-900/60 dark:to-slate-950 p-6 rounded-3xl border border-indigo-200/60 dark:border-indigo-500/20 shadow-xl backdrop-blur-xl relative text-slate-900 dark:text-slate-100">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Bot className="h-3.5 w-3.5 animate-pulse text-indigo-500" />
              Centralized Prompt & AI System
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            AI Configuration Center
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl">
            Customize AI prompts, test instructions, and job match preferences with isolated user overrides.
          </p>
        </div>

        {activeTab !== "prompts" && (
          <Button
            onClick={handleSaveOtherSettings}
            isLoading={isSavingOther}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs"
          >
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        )}
      </div>

      {/* Tabs Navigation Header */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("prompts")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "prompts"
              ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          AI Prompts ({prompts.length})
        </button>

        <button
          onClick={() => setActiveTab("preferences")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "preferences"
              ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Briefcase className="h-4 w-4" />
          Job Preferences
        </button>



        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "notifications"
              ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Bell className="h-4 w-4" />
          Notifications
        </button>
      </div>

      {/* TAB 1: AI PROMPTS MANAGEMENT */}
      {activeTab === "prompts" && (
        <Card className="p-6">
          <CardHeader className="p-0 pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Sparkles className="h-5 w-5 text-indigo-500" />
                Prompt Management System
              </CardTitle>
              <CardDescription>
                Customize AI prompt templates per stage while preserving application system defaults.
              </CardDescription>
            </div>
          </CardHeader>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Prompt Cards Selector */}
            <div className="space-y-2 lg:col-span-1 border-r border-slate-100 dark:border-slate-800/80 pr-4 max-h-[600px] overflow-y-auto pr-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Available Prompts</p>
              {prompts.map((p) => {
                const isSelected = selectedPromptKey === p.promptKey;
                return (
                  <button
                    key={p.promptKey}
                    onClick={() => {
                      setSelectedPromptKey(p.promptKey);
                      setEditedPromptText(p.currentPrompt);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl transition-all border flex flex-col gap-1.5 ${
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-300 font-bold shadow-sm"
                        : "bg-white/50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold">{p.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        p.isCustomized
                          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                          : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}>
                        {p.isCustomized ? "Customized" : `Default (v${p.version})`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal line-clamp-1">{p.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Right Editor Pane */}
            {activePromptItem && (
              <div className="lg:col-span-2 space-y-4">
                {/* Editor Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{activePromptItem.name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        activePromptItem.isCustomized
                          ? "bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}>
                        {activePromptItem.isCustomized ? "User Customized Prompt" : `Application Default (v${activePromptItem.version})`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{activePromptItem.description}</p>
                  </div>

                  {/* Top Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    {activePromptItem.isCustomized && (
                      <Button
                        onClick={() => setShowResetModal(true)}
                        variant="outline"
                        className="text-xs px-3 py-1.5 border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl"
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-1" />
                        Reset
                      </Button>
                    )}

                    <Button
                      onClick={() => setShowTestModal(true)}
                      className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1"
                    >
                      <Play className="h-3.5 w-3.5 fill-white" />
                      Test
                    </Button>

                    <Button
                      onClick={handleSavePrompt}
                      isLoading={isSavingPrompt}
                      disabled={!isUnsaved}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-xl shadow"
                    >
                      <Save className="h-3.5 w-3.5 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>

                {/* Editor Textarea */}
                <div className="space-y-2 relative">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <FileCode className="h-4 w-4 text-indigo-500" />
                      Prompt Instructions Template:
                    </span>
                    {isUnsaved && (
                      <span className="text-amber-500 flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" /> Unsaved Changes
                      </span>
                    )}
                  </div>

                  <textarea
                    rows={10}
                    value={editedPromptText}
                    onChange={(e) => setEditedPromptText(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed shadow-inner"
                  />

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                    <span>Characters: {editedPromptText.length}</span>
                    <span>Est. Tokens: ~{Math.ceil(editedPromptText.length / 4)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* TAB 2: JOB PREFERENCES */}
      {activeTab === "preferences" && jobPrefEdits && (
        <Card className="p-6 space-y-6">
          <CardHeader className="p-0 pb-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Briefcase className="h-5 w-5 text-indigo-500" />
              Target Job & Match Preferences
            </CardTitle>
            <CardDescription>
              Configure target job titles, required skills, employment types, match percentage thresholds, and company filters.
            </CardDescription>
          </CardHeader>

          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-center gap-3">
            <Globe className="h-5 w-5 text-indigo-500 shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-indigo-700 dark:text-indigo-300">Global Location Coverage (Worldwide Default)</p>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">Location preferences are disabled. AI automatically scans and applies to matched postings globally worldwide.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Preferred Job Titles (Comma Separated)"
              value={jobPrefEdits.preferredTitles.join(", ")}
              onChange={(e) => setJobPrefEdits({ ...jobPrefEdits, preferredTitles: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              placeholder="Frontend Engineer, React Developer, Full Stack Engineer"
            />

            <Input
              label="Preferred Skills (Comma Separated)"
              value={jobPrefEdits.preferredSkills.join(", ")}
              onChange={(e) => setJobPrefEdits({ ...jobPrefEdits, preferredSkills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              placeholder="React, TypeScript, Node.js, Python, AWS"
            />

            <Input
              label="Preferred Industries (Comma Separated)"
              value={jobPrefEdits.preferredIndustries.join(", ")}
              onChange={(e) => setJobPrefEdits({ ...jobPrefEdits, preferredIndustries: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              placeholder="Fintech, SaaS, E-commerce, Artificial Intelligence"
            />

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Experience Level</label>
              <select
                value={jobPrefEdits.experienceLevel}
                onChange={(e) => setJobPrefEdits({ ...jobPrefEdits, experienceLevel: e.target.value as JobPreferences["experienceLevel"] })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100"
              >
                <option value="any">Any Experience Level</option>
                <option value="entry">Entry Level (0-2 Yrs)</option>
                <option value="mid">Mid Level (2-5 Yrs)</option>
                <option value="senior">Senior Level (5-8 Yrs)</option>
                <option value="lead">Lead / Principal (8+ Yrs)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Work Mode</label>
              <select
                value={jobPrefEdits.workMode}
                onChange={(e) => setJobPrefEdits({ ...jobPrefEdits, workMode: e.target.value as JobPreferences["workMode"] })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100"
              >
                <option value="any">Any Work Mode</option>
                <option value="remote">Remote Only</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-Site</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Employment Type</label>
              <select
                value={jobPrefEdits.employmentType}
                onChange={(e) => setJobPrefEdits({ ...jobPrefEdits, employmentType: e.target.value as JobPreferences["employmentType"] })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100"
              >
                <option value="any">Any Type</option>
                <option value="full_time">Full-Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <Input
              label="Preferred Companies (Comma Separated)"
              value={jobPrefEdits.preferredCompanies.join(", ")}
              onChange={(e) => setJobPrefEdits({ ...jobPrefEdits, preferredCompanies: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              placeholder="Google, Stripe, Microsoft, Meta"
            />

            <Input
              label="Blocked Companies (Comma Separated)"
              value={jobPrefEdits.blockedCompanies.join(", ")}
              onChange={(e) => setJobPrefEdits({ ...jobPrefEdits, blockedCompanies: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              placeholder="Company A, Company B"
            />

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">Minimum Resume Match Threshold:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{jobPrefEdits.minResumeMatch}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={jobPrefEdits.minResumeMatch}
                onChange={(e) => setJobPrefEdits({ ...jobPrefEdits, minResumeMatch: Number(e.target.value) })}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">Minimum AI Confidence Threshold:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{jobPrefEdits.minAiConfidence}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={jobPrefEdits.minAiConfidence}
                onChange={(e) => setJobPrefEdits({ ...jobPrefEdits, minAiConfidence: Number(e.target.value) })}
                className="w-full accent-emerald-600"
              />
            </div>
          </div>
        </Card>
      )}



      {/* TAB 5: NOTIFICATIONS */}
      {activeTab === "notifications" && notifEdits && (
        <Card className="p-6 space-y-6">
          <CardHeader className="p-0 pb-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Bell className="h-5 w-5 text-indigo-500" />
              Real-time Alert Preferences
            </CardTitle>
            <CardDescription>
              Toggle push and email notifications for background AI automation events.
            </CardDescription>
          </CardHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(notifEdits).map(([key, val]) => (
              <div key={key} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                  <p className="text-[10px] text-slate-500">Receive alerts when this event fires</p>
                </div>
                <input
                  type="checkbox"
                  checked={val}
                  onChange={(e) => setNotifEdits({ ...notifEdits, [key]: e.target.checked })}
                  className="h-5 w-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Interactive Reset Confirmation Modal */}
      {showResetModal && activePromptItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative text-slate-900 dark:text-slate-100">
            <div className="flex items-center gap-2 text-rose-500">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Reset Prompt to Default?</h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to remove your custom override for <strong>"{activePromptItem.name}"</strong>? Your AI pipeline will automatically revert to using the application default template.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                onClick={() => setShowResetModal(false)}
                variant="outline"
                className="text-xs rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleResetPrompt}
                isLoading={isResettingPrompt}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl"
              >
                Confirm Reset
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Prompt Testing Modal */}
      {showTestModal && activePromptItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-5 shadow-2xl relative text-slate-900 dark:text-slate-100">
            <button
              onClick={() => setShowTestModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-slate-800/50"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-indigo-500" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Live AI Prompt Tester ({activePromptItem.name})
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Prompt Text:</label>
                <textarea
                  rows={4}
                  value={editedPromptText}
                  onChange={(e) => setEditedPromptText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Sample Test Input Data:</label>
                <textarea
                  rows={3}
                  value={testSampleInput}
                  onChange={(e) => setTestSampleInput(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <Button
                  onClick={handleRunTestPrompt}
                  isLoading={isTestingPrompt}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow flex items-center gap-2"
                >
                  <Play className="h-4 w-4 fill-white" />
                  Run AI Test Execution
                </Button>
              </div>

              {testOutput && (
                <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> AI Output Preview Response:
                  </p>
                  <div className="p-4 rounded-2xl bg-slate-950 text-emerald-300 font-mono text-xs overflow-y-auto max-h-48 border border-slate-800 leading-relaxed shadow-inner">
                    <pre className="whitespace-pre-wrap">{testOutput}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIConfigPage;
