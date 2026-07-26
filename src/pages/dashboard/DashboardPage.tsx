import type React from "react";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { client } from "../../api/client";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Skeleton } from "../../components/ui/Skeleton";
import { toast } from "sonner";
import { 
  Bot, 
  Activity, 
  Layers, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  Download, 
  Play, 
  Pause, 
  Building2, 
  Sparkles,
  Zap,
  Globe,
  X
} from "lucide-react";

interface DashboardSummaryData {
  averageAtsScore: number;
  analyzedCount: number;
  totalJobsFound: number;
  officialJobsFound: number;
  feedJobsFound: number;
  recruiterPostsScanned: number;
  hiringPostsDetected: number;
  companiesDiscovered: number;
  totalApplications: number;
  appliedCount: number;
  pendingCount: number;
  failedCount: number;
  successRate: number;
  autopilotEnabled: boolean;
  activeQueues: {
    feedScanner: "active" | "idle" | "processing";
    applicationEngine: "active" | "idle" | "processing";
    aiProcessor: "active" | "idle" | "processing";
  };
}

interface ActivityEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: "scan" | "match" | "apply" | "ai" | "queue" | "error";
  status: "success" | "pending" | "failed" | "info";
}

interface AIDecisionJob {
  company: string;
  jobTitle: string;
  action: "applied" | "skipped";
  matchScore: number;
  reasons: string[];
  missingSkills?: string[];
  timestamp: string;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState<DashboardSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingAutopilot, setIsTogglingAutopilot] = useState(false);

  const [isExporting, setIsExporting] = useState(false);
  
  // Live SSE Timeline Feed
  const [timelineEvents, setTimelineEvents] = useState<ActivityEvent[]>([]);
  
  // Decision Explanation Modal State
  const [selectedDecision, setSelectedDecision] = useState<AIDecisionJob | null>(null);

  const fetchDashboardMetrics = async () => {
    try {
      const res = await client.get("/dashboard/summary");
      setSummary(res.data.data);
    } catch (err) {
      console.error("Failed to fetch AI Control Center summary", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    client.get("/dashboard/summary").then((res) => {
      if (!active) return;
      setSummary(res.data.data);
    }).catch((err) => {
      if (!active) return;
      console.error("Failed to fetch AI Control Center summary", err);
    }).finally(() => {
      if (active) setIsLoading(false);
    });

    return () => { active = false; };
  }, []);

  // Real-time SSE Live Activity Feed Listener
  useEffect(() => {
    const handleSSEEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ event: string; data: Record<string, unknown> }>;
      const { event, data } = customEvent.detail;
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      let newEvent: ActivityEvent | null = null;

      if (event === "feed_opportunity_discovered") {
        newEvent = {
          id: String(Date.now()),
          timestamp: now,
          title: `Hiring Post Extracted: ${data.jobTitle || "Opportunity"}`,
          description: `Discovered post by ${data.company || "Recruiter"} (Match: ${data.matchScore}%). Queued for auto-apply.`,
          type: "match",
          status: "success"
        };
      } else if (event === "job_application_status") {
        const status = String(data.status);
        newEvent = {
          id: String(Date.now()),
          timestamp: now,
          title: `Job Application: ${status.toUpperCase()}`,
          description: status === "applied" 
            ? `Successfully automated application for ${data.jobUrl || "job"}`
            : status === "applying"
            ? `Automating application execution...`
            : `Application failed: ${data.error || "Execution error"}`,
          type: "apply",
          status: status === "applied" ? "success" : status === "applying" ? "pending" : "failed"
        };
      } else if (event === "feed_scanner.started" || event === "crawler.started") {
        newEvent = {
          id: String(Date.now()),
          timestamp: now,
          title: "AI Crawler Scanner Started",
          description: "Scanning connected recruiter feeds and job listings...",
          type: "scan",
          status: "pending"
        };
      } else if (event === "resume.completed") {
        newEvent = {
          id: String(Date.now()),
          timestamp: now,
          title: `AI Resume Analyzed (${data.score}%)`,
          description: `Gemini completed ATS resume scoring for ${data.fileName || "resume"}`,
          type: "ai",
          status: "success"
        };
      }

      if (newEvent) {
        setTimelineEvents((prev) => [newEvent!, ...prev.slice(0, 25)]);
      }

      fetchDashboardMetrics();
    };

    window.addEventListener("ai_control_center_event", handleSSEEvent);
    return () => window.removeEventListener("ai_control_center_event", handleSSEEvent);
  }, []);

  // Toggle Global AI Autopilot
  const handleToggleAutopilot = async () => {
    if (!summary) return;
    const nextState = !summary.autopilotEnabled;
    setIsTogglingAutopilot(true);

    try {
      await client.patch("/users/autopilot/linkedin", { enabled: nextState });
      toast.success(`AI Autopilot is now ${nextState ? "Active 🟢" : "Paused ⏸️"}`);
      fetchDashboardMetrics();
    } catch {
      toast.error("Failed to toggle AI Autopilot.");
    } finally {
      setIsTogglingAutopilot(false);
    }
  };

  // Export Analytics CSV
  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const res = await client.get("/dashboard/export-report", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ai-control-center-report-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("CSV Report downloaded successfully!");
    } catch {
      toast.error("Failed to export CSV report.");
    } finally {
      setIsExporting(false);
    }
  };

  // ATS Score Color utilities
  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-emerald-500 stroke-emerald-500";
    if (score >= 50) return "text-amber-500 stroke-amber-500";
    return "text-rose-500 stroke-rose-500";
  };

  if (isLoading && !summary) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-72 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  const averageAts = summary?.averageAtsScore || 0;
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (averageAts / 100) * circumference;

  // Mock AI Decisions list for transparency demo
  const sampleDecisions: AIDecisionJob[] = [
    {
      company: "Stripe",
      jobTitle: "Senior Frontend Engineer",
      action: "applied",
      matchScore: 92,
      reasons: [
        "Resume skill match (92%): React, TypeScript, Node.js, Tailwind",
        "ATS score threshold satisfied (92% >= 60%)",
        "Direct official application link available",
        "AI confidence: Very High (95%)"
      ],
      timestamp: "Just now"
    },
    {
      company: "Tech Corp",
      jobTitle: "Java Backend Developer",
      action: "skipped",
      matchScore: 42,
      reasons: [
        "Low skill match (42% < 60% minimum threshold)",
        "Missing required primary skill: Spring Boot, Microservices",
        "Duplicate post previously processed"
      ],
      missingSkills: ["Spring Boot", "AWS Lambda", "Kafka"],
      timestamp: "10 mins ago"
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* AI Control Center Banner & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-100/60 dark:from-indigo-950/40 dark:via-slate-900/60 dark:to-slate-950 p-6 rounded-3xl border border-indigo-200/60 dark:border-indigo-500/20 shadow-xl backdrop-blur-xl relative overflow-hidden text-slate-900 dark:text-slate-100">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
        
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Bot className="h-3.5 w-3.5 animate-pulse text-indigo-500" />
              24/7 AI Recruitment Assistant
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              summary?.autopilotEnabled 
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20" 
                : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
            }`}>
              <span className={`h-2 w-2 rounded-full ${summary?.autopilotEnabled ? "bg-emerald-500 animate-ping" : "bg-amber-500"}`} />
              {summary?.autopilotEnabled ? "Autopilot Active" : "Autopilot Paused"}
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            AI Control Center
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl">
            Real-time monitoring, live execution logs, AI decision transparency, and queue controls for <strong>{user?.name || "Candidate"}</strong>.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={handleToggleAutopilot}
            disabled={isTogglingAutopilot}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all duration-200 ${
              summary?.autopilotEnabled
                ? "bg-amber-500/20 text-amber-800 dark:text-amber-300 hover:bg-amber-500/30 border border-amber-500/30"
                : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/25"
            }`}
          >
            {summary?.autopilotEnabled ? (
              <>
                <Pause className="h-4 w-4" />
                Pause AI
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Resume AI
              </>
            )}
          </button>

          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-md transition-all duration-200"
          >
            <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Export Report
          </button>
        </div>
      </div>

      {/* Real-Time KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hoverEffect className="p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Jobs Found</p>
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">{summary?.totalJobsFound || 0}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{summary?.officialJobsFound || 0} Official</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{summary?.feedJobsFound || 0} Feed Opportunities</span>
          </div>
        </Card>

        <Card hoverEffect className="p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recruiter Feed Scan</p>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Globe className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">{summary?.recruiterPostsScanned || 0}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-purple-600 dark:text-purple-400 font-semibold">{summary?.hiringPostsDetected || 0} Hiring Posts Detected</span>
          </div>
        </Card>

        <Card hoverEffect className="p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Applications Submitted</p>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">{summary?.appliedCount || 0}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{summary?.successRate || 100}% Success Rate</span>
            <span>•</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">{summary?.pendingCount || 0} Pending</span>
          </div>
        </Card>

        <Card hoverEffect className="p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Companies Discovered</p>
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">{summary?.companiesDiscovered || 0}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-cyan-600 dark:text-cyan-400 font-semibold">Worldwide Global Coverage</span>
          </div>
        </Card>
      </div>

      {/* Live Queue Monitor & Real-Time Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Live Event Activity Feed Timeline */}
        <Card className="lg:col-span-2 p-6 flex flex-col min-h-[450px]">
          <CardHeader className="p-0 pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-slate-100">
                <Activity className="h-5 w-5 text-indigo-500 animate-pulse" />
                Live Chronological Event Timeline
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Real-time SSE event stream from background workers</CardDescription>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              LIVE SSE Active
            </span>
          </CardHeader>

          <div className="flex-1 mt-4 space-y-4 overflow-y-auto max-h-[350px] pr-2 scrollbar-thin">
            {timelineEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <Clock className="h-8 w-8 text-slate-400 dark:text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-400">Waiting for live events...</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 max-w-sm">
                  Background tasks, AI matchers, feed scans, and auto-applies will appear here dynamically.
                </p>
              </div>
            ) : (
              timelineEvents.map((evt) => (
                <div key={evt.id} className="flex gap-3 relative group text-left">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    evt.status === "success" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" :
                    evt.status === "pending" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" :
                    "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                  }`}>
                    {evt.type === "match" ? <Zap className="h-4 w-4" /> :
                     evt.type === "apply" ? <CheckCircle2 className="h-4 w-4" /> :
                     evt.type === "ai" ? <Sparkles className="h-4 w-4" /> :
                     <Activity className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-200 leading-snug">{evt.title}</p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{evt.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{evt.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Live Queue Monitor Widget */}
        <div className="space-y-6">
          <Card className="p-6">
            <CardHeader className="p-0 pb-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-slate-100">
                <Layers className="h-5 w-5 text-purple-500" />
                Live Worker Queue Status
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">BullMQ background queue execution monitor</CardDescription>
            </CardHeader>

            <div className="mt-4 space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-200">Social Feed Scanner Queue</p>
                  <p className="text-[10px] text-slate-500">Scans recruiter LinkedIn posts</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  summary?.activeQueues.feedScanner === "active"
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 animate-pulse"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400"
                }`}>
                  {summary?.activeQueues.feedScanner === "active" ? "ACTIVE" : "IDLE"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-200">Application Engine Queue</p>
                  <p className="text-[10px] text-slate-500">Playwright automated form submitter</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  summary?.activeQueues.applicationEngine === "processing"
                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 animate-pulse"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400"
                }`}>
                  {summary?.activeQueues.applicationEngine === "processing" ? "PROCESSING" : "IDLE"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-200">Gemini AI Processor</p>
                  <p className="text-[10px] text-slate-500">Resume scoring & matching engine</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400">
                  READY
                </span>
              </div>
            </div>
          </Card>

          {/* ATS Gauge Chart */}
          <Card className="p-6 flex flex-col items-center justify-center text-center">
            <CardHeader className="w-full text-left p-0 pb-2">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-200">ATS Optimization Performance</CardTitle>
            </CardHeader>

            <div className="relative flex items-center justify-center h-40 w-40 my-2">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r={radius} className="stroke-slate-200 dark:stroke-slate-800 fill-transparent" strokeWidth="8" />
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className={`fill-transparent transition-all duration-1000 ease-out ${getScoreColor(averageAts)}`}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{averageAts}%</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">ATS Score</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* AI Decision & Transparency Inspector */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-slate-100">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              AI Decision & Transparency Inspector
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Explainable breakdown of why AI automatically applied or skipped specific job opportunities.
            </CardDescription>
          </div>
        </CardHeader>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleDecisions.map((dec, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{dec.jobTitle}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{dec.company}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  dec.action === "applied" 
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20" 
                    : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20"
                }`}>
                  {dec.action === "applied" ? "Applied ✓" : "Skipped ✗"}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <p className="font-semibold text-slate-500 dark:text-slate-400">Reasoning Breakdown:</p>
                <ul className="space-y-1 pl-2">
                  {dec.reasons.map((r, rIdx) => (
                    <li key={rIdx} className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                      <span className="text-indigo-500">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setSelectedDecision(dec)}
                className="w-full py-2 rounded-xl text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-colors"
              >
                Inspect Full Decision Details
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Decision Detail Modal */}
      {selectedDecision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative text-slate-900 dark:text-slate-100">
            <button
              onClick={() => setSelectedDecision(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-slate-800/50"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">AI Decision Explanation</h3>
            </div>

            <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <p><strong>Job Title:</strong> {selectedDecision.jobTitle}</p>
              <p><strong>Company:</strong> {selectedDecision.company}</p>
              <p><strong>Match Score:</strong> <span className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedDecision.matchScore}%</span></p>
              <p><strong>Action Taken:</strong> {selectedDecision.action.toUpperCase()}</p>
            </div>

            <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Decision Factors</p>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {selectedDecision.reasons.map((reason, i) => (
                  <li key={i} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setSelectedDecision(null)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Close Transparency Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
