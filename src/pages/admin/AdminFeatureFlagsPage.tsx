import type React from "react";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Skeleton } from "../../components/ui/Skeleton";
import { toast } from "sonner";
import { client } from "../../api/client";
import { Flag, ShieldAlert } from "lucide-react";

interface FeatureFlags {
  autoApplyEnabled: boolean;
  feedScannerEnabled: boolean;
  aiPromptOverridesEnabled: boolean;
  maintenanceMode: boolean;
}

export const AdminFeatureFlagsPage: React.FC = () => {
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    client.get("/admin/feature-flags").then((res) => {
      if (active) setFlags(res.data.data);
    }).catch(() => {
      if (active) toast.error("Failed to load feature flags.");
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, []);

  const handleToggle = async (flagKey: keyof FeatureFlags, enabled: boolean) => {
    try {
      const res = await client.post("/admin/feature-flags/toggle", { flagKey, enabled });
      setFlags(res.data.data);
      toast.success(`Feature ${flagKey} set to ${enabled ? "ENABLED" : "DISABLED"}`);
    } catch {
      toast.error(`Failed to update feature flag ${flagKey}`);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">System Feature Flags</h1>
        <p className="text-xs text-slate-400">Dynamic runtime switches to control SaaS capabilities instantly</p>
      </div>

      <Card className="p-6 bg-slate-900 border-slate-800 space-y-6">
        <CardHeader className="p-0 pb-4 border-b border-slate-800">
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <Flag className="h-5 w-5 text-indigo-400" />
            Runtime Feature Flags
          </CardTitle>
          <CardDescription className="text-slate-400">Changes take effect immediately without requiring deployment</CardDescription>
        </CardHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <p className="text-sm font-bold text-white">Auto Apply Submissions</p>
              <p className="text-xs text-slate-400">Allow users to enqueue automated job applications</p>
            </div>
            <button
              onClick={() => handleToggle("autoApplyEnabled", !flags?.autoApplyEnabled)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                flags?.autoApplyEnabled
                  ? "bg-emerald-600 text-white hover:bg-emerald-500"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {flags?.autoApplyEnabled ? "ENABLED ✓" : "DISABLED ✗"}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <p className="text-sm font-bold text-white">Social Feed Scanner</p>
              <p className="text-xs text-slate-400">Scan LinkedIn/Naukri feed posts for hiring opportunities</p>
            </div>
            <button
              onClick={() => handleToggle("feedScannerEnabled", !flags?.feedScannerEnabled)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                flags?.feedScannerEnabled
                  ? "bg-emerald-600 text-white hover:bg-emerald-500"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {flags?.feedScannerEnabled ? "ENABLED ✓" : "DISABLED ✗"}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <p className="text-sm font-bold text-white">AI Prompt Custom Overrides</p>
              <p className="text-xs text-slate-400">Enable candidate custom prompt template overrides</p>
            </div>
            <button
              onClick={() => handleToggle("aiPromptOverridesEnabled", !flags?.aiPromptOverridesEnabled)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                flags?.aiPromptOverridesEnabled
                  ? "bg-emerald-600 text-white hover:bg-emerald-500"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {flags?.aiPromptOverridesEnabled ? "ENABLED ✓" : "DISABLED ✗"}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-rose-950/20 border border-rose-500/30">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-6 w-6 text-rose-400" />
              <div>
                <p className="text-sm font-bold text-white">Maintenance Mode</p>
                <p className="text-xs text-slate-400">Temporarily restrict platform access for system maintenance</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle("maintenanceMode", !flags?.maintenanceMode)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                flags?.maintenanceMode
                  ? "bg-rose-600 text-white hover:bg-rose-500"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {flags?.maintenanceMode ? "ACTIVE 🚨" : "INACTIVE"}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminFeatureFlagsPage;
