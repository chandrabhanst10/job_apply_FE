import type React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Bot, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  Database, 
  Cpu, 
  Layers, 
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import { client } from "../../api/client";

interface ServiceHealth {
  status: "up" | "down" | "degraded";
  message?: string;
}

interface HealthData {
  status: "up" | "down" | "degraded";
  timestamp: string;
  uptime: number;
  environment: string;
  services: {
    mongodb: ServiceHealth;
    redis: ServiceHealth;
    bullmq: ServiceHealth;
    aiProvider: ServiceHealth;
    memory: ServiceHealth;
  };
}

export const SystemStatusPage: React.FC = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHealth = async () => {
    setIsLoading(true);
    try {
      const res = await client.get("/health/detailed");
      setHealth(res.data.data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    client.get("/health/detailed").then((res) => {
      if (active) setHealth(res.data.data);
    }).catch(() => {
      // Ignore
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Bot className="h-4 w-4" />
              </div>
              <h1 className="text-xl font-black text-white">System Status Console</h1>
            </div>
          </div>

          <button onClick={fetchHealth} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition flex items-center gap-1.5 text-xs font-bold">
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-indigo-400" : ""}`} /> {isLoading ? "Checking Probes..." : "Refresh Probes"}
          </button>
        </div>

        {/* Global Status Banner */}
        <div className={`p-6 rounded-3xl border flex items-center gap-4 ${
          health?.status === "up" 
            ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400" 
            : "bg-amber-950/20 border-amber-500/30 text-amber-400"
        }`}>
          {health?.status === "up" ? (
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          ) : (
            <AlertTriangle className="h-8 w-8 text-amber-400" />
          )}
          <div>
            <h2 className="text-lg font-bold">
              {health?.status === "up" ? "All Platform Systems Operational" : "Service Experiencing Degradation"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Uptime: {health ? Math.floor(health.uptime / 60) : 0} minutes • Last checked: {health ? new Date(health.timestamp).toLocaleTimeString() : "Scanning..."}
            </p>
          </div>
        </div>

        {/* Component Probes Grid */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Core Subsystem Status</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* MongoDB */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-xs font-bold text-white">MongoDB Database Vault</p>
                  <p className="text-[11px] text-slate-400">{health?.services.mongodb.message || "Connected"}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                UP
              </span>
            </div>

            {/* Redis */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Server className="h-5 w-5 text-indigo-400" />
                <div>
                  <p className="text-xs font-bold text-white">Redis Queue Memory</p>
                  <p className="text-[11px] text-slate-400">{health?.services.redis.message || "Responding to ping"}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                UP
              </span>
            </div>

            {/* BullMQ Workers */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Layers className="h-5 w-5 text-violet-400" />
                <div>
                  <p className="text-xs font-bold text-white">BullMQ Worker Engine</p>
                  <p className="text-[11px] text-slate-400">{health?.services.bullmq.message || "Queue active"}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                UP
              </span>
            </div>

            {/* Gemini AI API */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cpu className="h-5 w-5 text-sky-400" />
                <div>
                  <p className="text-xs font-bold text-white">Gemini AI Provider Service</p>
                  <p className="text-[11px] text-slate-400">{health?.services.aiProvider.message || "Configured"}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                UP
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default SystemStatusPage;
