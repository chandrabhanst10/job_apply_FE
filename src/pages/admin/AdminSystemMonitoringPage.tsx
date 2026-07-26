import type React from "react";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { toast } from "sonner";
import { client } from "../../api/client";
import { Server, Play, Pause, RotateCcw, RefreshCw } from "lucide-react";

interface QueueStatusData {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

export const AdminSystemMonitoringPage: React.FC = () => {
  const [queue, setQueue] = useState<QueueStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQueueStatus = async () => {
    setIsLoading(true);
    try {
      const res = await client.get("/admin/queues");
      setQueue(res.data.data);
    } catch {
      toast.error("Failed to fetch queue status.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    client.get("/admin/queues").then((res) => {
      if (active) setQueue(res.data.data);
    }).catch(() => {
      if (active) toast.error("Failed to fetch queue status.");
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, []);

  const handleAction = async (action: "pause" | "resume" | "retry") => {
    try {
      const res = await client.post("/admin/queues/action", { action });
      toast.success(res.data.message);
      fetchQueueStatus();
    } catch {
      toast.error(`Failed to execute ${action} on queue.`);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">System & Queue Monitoring</h1>
          <p className="text-xs text-slate-400">BullMQ worker queue inspect and pause/resume control center</p>
        </div>
        <Button onClick={fetchQueueStatus} variant="outline" className="flex items-center gap-2 text-xs font-bold">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card className="p-6 bg-slate-900 border-slate-800 space-y-6">
        <CardHeader className="p-0 pb-4 border-b border-slate-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Server className="h-5 w-5 text-indigo-400" />
              Queue: {queue?.name || "job-applications"}
            </CardTitle>
            <CardDescription className="text-slate-400">Background Playwright application worker queue</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => handleAction("pause")} variant="outline" className="flex items-center gap-1 text-xs">
              <Pause className="h-3.5 w-3.5" /> Pause
            </Button>
            <Button onClick={() => handleAction("resume")} variant="outline" className="flex items-center gap-1 text-xs">
              <Play className="h-3.5 w-3.5 text-emerald-400" /> Resume
            </Button>
            <Button onClick={() => handleAction("retry")} className="flex items-center gap-1 text-xs bg-indigo-600">
              <RotateCcw className="h-3.5 w-3.5" /> Retry Failed
            </Button>
          </div>
        </CardHeader>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <p className="text-xs font-bold text-slate-400">Waiting</p>
            <p className="text-3xl font-black text-amber-400">{queue?.waiting || 0}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <p className="text-xs font-bold text-slate-400">Active</p>
            <p className="text-3xl font-black text-indigo-400">{queue?.active || 0}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <p className="text-xs font-bold text-slate-400">Completed</p>
            <p className="text-3xl font-black text-emerald-400">{queue?.completed || 0}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <p className="text-xs font-bold text-slate-400">Failed</p>
            <p className="text-3xl font-black text-rose-400">{queue?.failed || 0}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <p className="text-xs font-bold text-slate-400">Delayed</p>
            <p className="text-3xl font-black text-slate-400">{queue?.delayed || 0}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminSystemMonitoringPage;
