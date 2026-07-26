import type React from "react";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Skeleton } from "../../components/ui/Skeleton";
import { Button } from "../../components/ui/Button";
import { toast } from "sonner";
import { client } from "../../api/client";
import { 
  Users, 
  Briefcase, 
  FileText, 
  Server, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Layers,
  Database
} from "lucide-react";

interface AdminOverviewData {
  stats: {
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    verifiedUsers: number;
    totalApplications: number;
    appliedApplications: number;
    pendingApplications: number;
    failedApplications: number;
    totalFeedOpportunities: number;
    totalResumes: number;
  };
  queueMetrics: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  };
  featureFlags: {
    autoApplyEnabled: boolean;
    feedScannerEnabled: boolean;
    aiPromptOverridesEnabled: boolean;
    maintenanceMode: boolean;
  };
  timestamp: string;
}

export const AdminOverviewPage: React.FC = () => {
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      const res = await client.get("/admin/overview");
      setData(res.data.data);
    } catch {
      toast.error("Failed to load admin overview metrics.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    client.get("/admin/overview").then((res) => {
      if (active) setData(res.data.data);
    }).catch(() => {
      if (active) toast.error("Failed to load admin overview metrics.");
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    );
  }

  const stats = data?.stats;
  const queue = data?.queueMetrics;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Platform Overview</h1>
          <p className="text-xs text-slate-400">Real-time enterprise metrics & queue activity</p>
        </div>
        <Button onClick={fetchOverview} variant="outline" className="flex items-center gap-2 text-xs font-bold">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-5 bg-slate-900 border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
            <Users className="h-5 w-5 text-indigo-400" />
          </div>
          <p className="text-3xl font-black text-white">{stats?.totalUsers || 0}</p>
          <p className="text-[11px] text-emerald-400 font-semibold">{stats?.activeUsers || 0} active • {stats?.suspendedUsers || 0} suspended</p>
        </Card>

        <Card className="p-5 bg-slate-900 border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Applications</span>
            <Briefcase className="h-5 w-5 text-violet-400" />
          </div>
          <p className="text-3xl font-black text-white">{stats?.totalApplications || 0}</p>
          <p className="text-[11px] text-emerald-400 font-semibold">{stats?.appliedApplications || 0} applied • {stats?.failedApplications || 0} failed</p>
        </Card>

        <Card className="p-5 bg-slate-900 border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Feed Opportunities</span>
            <Layers className="h-5 w-5 text-sky-400" />
          </div>
          <p className="text-3xl font-black text-white">{stats?.totalFeedOpportunities || 0}</p>
          <p className="text-[11px] text-slate-400 font-semibold">Social hiring posts extracted</p>
        </Card>

        <Card className="p-5 bg-slate-900 border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Resumes Stored</span>
            <FileText className="h-5 w-5 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-white">{stats?.totalResumes || 0}</p>
          <p className="text-[11px] text-slate-400 font-semibold">Active candidate profiles</p>
        </Card>
      </div>

      {/* Queue & System Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Queue Metrics */}
        <Card className="p-6 bg-slate-900 border-slate-800 space-y-6">
          <CardHeader className="p-0 pb-4 border-b border-slate-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Server className="h-5 w-5 text-indigo-400" />
                BullMQ Queue Health
              </CardTitle>
              <CardDescription className="text-slate-400">`job-applications` queue worker state</CardDescription>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Operational
            </span>
          </CardHeader>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <p className="text-xs text-slate-400 font-bold">Waiting</p>
              <p className="text-2xl font-black text-amber-400">{queue?.waiting || 0}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <p className="text-xs text-slate-400 font-bold">Active</p>
              <p className="text-2xl font-black text-indigo-400">{queue?.active || 0}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <p className="text-xs text-slate-400 font-bold">Completed</p>
              <p className="text-2xl font-black text-emerald-400">{queue?.completed || 0}</p>
            </div>
          </div>
        </Card>

        {/* Feature Flags Overview */}
        <Card className="p-6 bg-slate-900 border-slate-800 space-y-6">
          <CardHeader className="p-0 pb-4 border-b border-slate-800">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-400" />
              Runtime Feature Flags
            </CardTitle>
            <CardDescription className="text-slate-400">System module toggle statuses</CardDescription>
          </CardHeader>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="font-semibold text-slate-300">Auto Apply Engine</span>
              <span className={`px-2 py-0.5 rounded font-bold ${data?.featureFlags.autoApplyEnabled ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                {data?.featureFlags.autoApplyEnabled ? "ENABLED" : "DISABLED"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="font-semibold text-slate-300">Social Feed Scanner</span>
              <span className={`px-2 py-0.5 rounded font-bold ${data?.featureFlags.feedScannerEnabled ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                {data?.featureFlags.feedScannerEnabled ? "ENABLED" : "DISABLED"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="font-semibold text-slate-300">AI Prompt Overrides</span>
              <span className={`px-2 py-0.5 rounded font-bold ${data?.featureFlags.aiPromptOverridesEnabled ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                {data?.featureFlags.aiPromptOverridesEnabled ? "ENABLED" : "DISABLED"}
              </span>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default AdminOverviewPage;
