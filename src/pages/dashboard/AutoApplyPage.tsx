import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { toast } from "sonner";
import { client } from "../../api/client";
import { 
  Play, 
  Pause, 
  Settings, 
  ExternalLink, 
  CheckCircle2, 
  Loader2, 
  Linkedin, 
  Briefcase,
  Compass,
  AlertCircle,
  TrendingUp,
  Search,
  Globe
} from "lucide-react";

interface ConnectionStatus {
  linkedin: { isConnected: boolean; username: string | null; lastSyncAt: string | null };
  naukri: { isConnected: boolean; username: string | null; lastSyncAt: string | null };
}

interface AutopilotSettings {
  enabled: boolean;
  jobTitles: string[];
  locations: string[];
  lastRunAt: string | null;
}

interface ApplicationLog {
  _id: string;
  platform: "linkedin" | "naukri";
  jobUrl: string;
  status: "pending" | "applying" | "applied" | "failed" | "scanned" | "queued" | "discovered" | "matched";
  error?: string;
  createdAt: string;
  appliedAt?: string;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "applied":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/30">
          <CheckCircle2 className="h-3 w-3" /> Applied
        </span>
      );
    case "applying":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/30">
          <Loader2 className="h-3 w-3 animate-spin" /> Applying...
        </span>
      );
    case "queued":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/30">
          Queued ⏳
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/30">
          Failed ✗
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          Scanned 🔍
        </span>
      );
  }
};

export const AutoApplyPage: React.FC = () => {
  const { platform: routePlatform } = useParams<{ platform: string }>();
  const navigate = useNavigate();

  const platform = routePlatform as "linkedin" | "naukri";

  const [connections, setConnections] = useState<ConnectionStatus | null>(null);
  const [autopilot, setAutopilot] = useState<AutopilotSettings | null>(null);
  const [history, setHistory] = useState<ApplicationLog[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [, setIsCrawling] = useState(false);

  // Form and Filtering states
  const [enabled, setEnabled] = useState(false);
  const [titlesInput, setTitlesInput] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [activeStatusTab, setActiveStatusTab] = useState<"all" | "scanned" | "queued" | "applied">("all");
  const [skillFilter, setSkillFilter] = useState<string>("");

  const fetchData = useCallback(async () => {
    if (routePlatform !== "linkedin" && routePlatform !== "naukri") return;
    try {
      const [connRes, autoRes, histRes] = await Promise.all([
        client.get("/connections/status"),
        client.get(`/users/autopilot/${platform}`),
        client.get("/automations/history")
      ]);

      setConnections(connRes.data.data);
      
      const autoData = autoRes.data.data as AutopilotSettings;
      setAutopilot(autoData);
      setEnabled(autoData.enabled);
      setTitlesInput(autoData.jobTitles.join(", "));
      setSelectedLocations(autoData.locations || []);

      const historyData = Array.isArray(histRes.data.data)
        ? histRes.data.data
        : (histRes.data.data?.data || []);
      setHistory(historyData);
    } catch {
      toast.error(`Failed to load ${platform === "linkedin" ? "LinkedIn" : "Naukri"} Auto-Pilot settings.`);
    } finally {
      setIsLoading(false);
    }
  }, [platform, routePlatform]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (routePlatform !== "linkedin" && routePlatform !== "naukri") {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [routePlatform, fetchData]);

  // Setup SSE listener for real-time application log updates
  useEffect(() => {
    const handleStatusUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{
        applicationId: string;
        platform: "linkedin" | "naukri";
        status: "pending" | "applying" | "applied" | "failed";
        jobUrl: string;
        error?: string;
      }>;

      if (customEvent.detail) {
        const newApp = customEvent.detail;
        setHistory((prevHistory) => {
          const exists = prevHistory.some((item) => item._id === newApp.applicationId);
          if (exists) {
            return prevHistory.map((item) =>
              item._id === newApp.applicationId
                ? {
                    ...item,
                    status: newApp.status,
                    error: newApp.error,
                    appliedAt: newApp.status === "applied" ? new Date().toISOString() : item.appliedAt
                  }
                : item
            );
          } else {
            const logEntry: ApplicationLog = {
              _id: newApp.applicationId,
              platform: newApp.platform,
              jobUrl: newApp.jobUrl,
              status: newApp.status,
              error: newApp.error,
              createdAt: new Date().toISOString(),
              appliedAt: newApp.status === "applied" ? new Date().toISOString() : undefined
            };
            return [logEntry, ...prevHistory];
          }
        });
      } else {
        fetchData();
      }
    };

    window.addEventListener("job_application_update", handleStatusUpdate);
    return () => {
      window.removeEventListener("job_application_update", handleStatusUpdate);
    };
  }, [fetchData]);

  // Setup SSE listener for crawler status updates to show scanning spinner live
  useEffect(() => {
    const handleCrawlerUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ platform: "linkedin" | "naukri"; status: string }>;
      if (customEvent.detail && customEvent.detail.platform === platform) {
        setIsCrawling(customEvent.detail.status === "started");
        fetchData();
      }
    };

    window.addEventListener("job_crawler_update", handleCrawlerUpdate);
    return () => {
      window.removeEventListener("job_crawler_update", handleCrawlerUpdate);
    };
  }, [platform, fetchData]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const jobTitles = titlesInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const locations = selectedLocations.length > 0 ? selectedLocations : ["worldwide"];

    try {
      await client.patch(`/users/autopilot/${platform}`, {
        enabled,
        jobTitles,
        locations
      });
      toast.success(`${platform === "linkedin" ? "LinkedIn" : "Naukri"} Auto-Pilot settings saved!`);
      fetchData();
    } catch {
      toast.error("Failed to update settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAutopilot = async () => {
    const nextState = !enabled;
    setEnabled(nextState);
    
    try {
      await client.patch(`/users/autopilot/${platform}`, { enabled: nextState });
      toast.success(`${platform === "linkedin" ? "LinkedIn" : "Naukri"} Auto-Pilot is now ${nextState ? "Active" : "Paused"}`);
      fetchData();
    } catch {
      setEnabled(enabled); // Rollback state
      toast.error("Failed to toggle Auto-Pilot.");
    }
  };



  if (routePlatform !== "linkedin" && routePlatform !== "naukri") {
    return <p className="p-8 text-rose-500">Invalid platform requested.</p>;
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-96" />
          <Skeleton className="h-96 lg:col-span-2" />
        </div>
      </div>
    );
  }

  // Filter history logs by platform, active status tab, and skill match filter
  const historyList = Array.isArray(history) ? history : [];
  let filteredHistory = historyList.filter((h) => h.platform === platform);

  // Status Tabs Filter
  if (activeStatusTab === "scanned") {
    filteredHistory = filteredHistory.filter((h) => h.status === "pending" || h.status === "scanned" || h.status === "discovered" || h.status === "matched");
  } else if (activeStatusTab === "queued") {
    filteredHistory = filteredHistory.filter((h) => h.status === "queued" || h.status === "applying");
  } else if (activeStatusTab === "applied") {
    filteredHistory = filteredHistory.filter((h) => h.status === "applied");
  }

  // Key Skills Match Filter
  if (skillFilter.trim() !== "") {
    const query = skillFilter.toLowerCase().trim();
    filteredHistory = filteredHistory.filter((h) => {
      const matchableText = `${h.jobUrl} ${h.platform} ${h.error || ""}`.toLowerCase();
      return matchableText.includes(query) || (titlesInput && titlesInput.toLowerCase().includes(query));
    });
  }

  const successCount = historyList.filter((h) => h.platform === platform && h.status === "applied").length;
  const totalCount = historyList.filter((h) => h.platform === platform).length;
  const rate = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 100;

  const isPlatformConnected = connections?.[platform]?.isConnected ?? false;

  if (!isPlatformConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8 bg-white/80 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-3xl max-w-2xl mx-auto shadow-xl">
        <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner mb-6 animate-pulse">
          {platform === "linkedin" ? (
            <Linkedin className="h-8 w-8" />
          ) : (
            <Briefcase className="h-8 w-8" />
          )}
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Connect {platform === "linkedin" ? "LinkedIn" : "Naukri"} Account
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md">
          To activate {platform === "linkedin" ? "LinkedIn" : "Naukri"} Auto-Pilot and track your automated background applications, you need to connect your session cookies first.
        </p>
        <div className="mt-8">
          <Button 
            onClick={() => navigate(`/settings#${platform}`)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/15 flex items-center gap-2 px-8 py-3 rounded-xl transition-all font-bold"
          >
            <Settings className="h-4 w-4" />
            Connect {platform === "linkedin" ? "LinkedIn" : "Naukri"} Account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2.5 text-slate-900 dark:text-slate-100">
            {platform === "linkedin" ? (
              <span className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 shadow-inner">
                <Linkedin className="h-5 w-5" />
              </span>
            ) : (
              <span className="h-9 w-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0 shadow-inner">
                <Briefcase className="h-5 w-5" />
              </span>
            )}
            {platform === "linkedin" ? "LinkedIn" : "Naukri"} Auto-Pilot Control Center
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Configure automated background scanning and apply tracking for {platform === "linkedin" ? "LinkedIn" : "Naukri"}.
          </p>
        </div>

        {/* Platform-Specific Autopilot Toggle */}
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleToggleAutopilot} 
            disabled={!isPlatformConnected}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl shadow-lg transition-all ${
              enabled 
                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/10" 
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10"
            }`}
          >
            {enabled ? (
              <>
                <Pause className="h-4 w-4 fill-white" />
                Pause Auto-Pilot
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-white" />
                Activate Auto-Pilot
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hoverEffect={true} className="flex items-center gap-4 p-6">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Scraped & Applied</p>
            <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100">{totalCount}</p>
          </div>
        </Card>

        <Card hoverEffect={true} className="flex items-center gap-4 p-6">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Success Submissions</p>
            <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{successCount}</p>
          </div>
        </Card>

        <Card hoverEffect={true} className="flex items-center gap-4 p-6">
          <div className="h-12 w-12 rounded-xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center text-violet-600 dark:text-violet-400 shadow-inner">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Application Rate</p>
            <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100">{rate}%</p>
          </div>
        </Card>
      </div>

      {/* Configuration + Run History log table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Autopilot Settings Form */}
        <Card className="lg:col-span-1 p-8 flex flex-col justify-between">
          <div>
            <CardHeader className="px-0 pt-0 pb-4 mb-4 flex flex-row items-center gap-2">
              <Settings className="h-5 w-5 text-indigo-500 shrink-0" />
              <div>
                <CardTitle>Autopilot Criteria</CardTitle>
                <CardDescription>Configure target search settings and locations</CardDescription>
              </div>
            </CardHeader>

            {!isPlatformConnected && (
              <div className="border border-rose-200/50 bg-rose-50/50 dark:bg-rose-950/10 dark:border-rose-900/30 rounded-2xl p-4 flex gap-3 mb-6 items-start">
                <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-rose-700 dark:text-rose-400">Account Not Connected</p>
                  <p className="text-slate-500 mt-1">Please connect your {platform === "linkedin" ? "LinkedIn" : "Naukri"} session cookies in the Settings panel before enabling Autopilot.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-5">

              <Input
                label="Job Titles (Comma Separated)"
                type="text"
                placeholder={platform === "linkedin" ? "Frontend Architect, React Lead" : "Naukri Developer, Node Engineer"}
                value={titlesInput}
                onChange={(e) => setTitlesInput(e.target.value)}
                disabled={!isPlatformConnected}
              />

              {/* Global Location Coverage Banner */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                  <Globe className="h-4 w-4 text-indigo-500" />
                  <span>Global Location Coverage (Worldwide Default)</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Applications are automatically matched and submitted for positions <strong>globally worldwide</strong> without city or country restrictions. Location data is retained purely as informational metadata.
                </p>
              </div>

              <div className="text-[10px] text-slate-500 leading-relaxed font-medium bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-slate-700 dark:text-slate-300">Background Crawl Activity:</p>
                <p className="mt-1">Last Crawl Scanned: {autopilot?.lastRunAt ? new Date(autopilot.lastRunAt).toLocaleString() : "Never"}</p>
                <p className="mt-0.5">Frequency Rate: Scheduled once every 12 hours.</p>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 font-bold"
                  isLoading={isSaving}
                  disabled={!isPlatformConnected || !titlesInput.trim()}
                >
                  Save Configuration
                </Button>
              </div>
            </form>
          </div>
        </Card>

        {/* Right Side: Running Logs Table */}
        <Card className="lg:col-span-2 p-8 flex flex-col min-h-[350px]">
          <CardHeader className="px-0 pt-0 pb-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>{platform === "linkedin" ? "LinkedIn" : "Naukri"} Automation History</CardTitle>
              <CardDescription>Real-time execution log of background auto-applied postings</CardDescription>
            </div>

            {/* Key Skills Filter */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by key skills..."
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </CardHeader>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 mb-4 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 self-start">
            <button
              onClick={() => setActiveStatusTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeStatusTab === "all"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              All ({historyList.filter(h => h.platform === platform).length})
            </button>
            <button
              onClick={() => setActiveStatusTab("scanned")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeStatusTab === "scanned"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Scanned ({historyList.filter(h => h.platform === platform && (h.status === "pending" || h.status === "scanned" || h.status === "discovered" || h.status === "matched")).length})
            </button>
            <button
              onClick={() => setActiveStatusTab("queued")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeStatusTab === "queued"
                  ? "bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Queued ({historyList.filter(h => h.platform === platform && (h.status === "queued" || h.status === "applying")).length})
            </button>
            <button
              onClick={() => setActiveStatusTab("applied")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeStatusTab === "applied"
                  ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Applied ({historyList.filter(h => h.platform === platform && h.status === "applied").length})
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            {filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-400">
                {platform === "linkedin" ? (
                  <Linkedin className="h-10 w-10 mb-2 stroke-1 text-slate-300 animate-pulse" />
                ) : (
                  <Briefcase className="h-10 w-10 mb-2 stroke-1 text-slate-300 animate-pulse" />
                )}
                <p className="text-sm">Auto-pilot hasn't submitted any {platform} jobs matching this criteria yet.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/60 text-slate-400 uppercase font-semibold tracking-wider">
                    <th className="pb-3 pr-2">Platform</th>
                    <th className="pb-3 px-2">Job URL</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 pl-2 text-right">Applied Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/40">
                  {filteredHistory.map((run) => (
                    <tr key={run._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="py-4 pr-2 font-medium capitalize flex items-center gap-1.5">
                        {run.platform === "linkedin" ? (
                          <span className="h-6 w-6 rounded bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0"><Linkedin className="h-3.5 w-3.5" /></span>
                        ) : (
                          <span className="h-6 w-6 rounded bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0"><Briefcase className="h-3.5 w-3.5" /></span>
                        )}
                        {run.platform}
                      </td>
                      <td className="py-4 px-2 max-w-[200px] truncate text-indigo-600 dark:text-indigo-400 font-medium">
                        <a href={run.jobUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                          Job Link <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                      <td className="py-4 px-2">
                        {getStatusBadge(run.status)}
                        {run.status === "failed" && run.error && (
                          <p className="text-[10px] text-rose-500 mt-1 max-w-[220px] leading-snug line-clamp-2" title={run.error}>
                            Error: {run.error}
                          </p>
                        )}
                      </td>
                      <td className="py-4 pl-2 text-right text-slate-500">
                        {run.appliedAt ? new Date(run.appliedAt).toLocaleString() : new Date(run.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>

      </div>
    </div>
  );
};

export default AutoApplyPage;
