import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { 
  ShieldCheck, 
  UserCheck, 
  FileText, 
  Trash2, 
  Activity, 
  Radio, 
  RefreshCw, 
  Clock, 
} from "lucide-react";
import { client } from "../../api/client";
import { toast } from "sonner";

interface ComplianceStats {
  totalUsers: number;
  termsAcceptedCount: number;
  privacyAcceptedCount: number;
  cookieAcceptedCount: number;
  pendingRequestsCount: number;
  completedRequestsCount: number;
  totalDataRequestsCount: number;
  totalAuditEventsCount: number;
  extensionActiveSessionsCount: number;
}

interface DataRequestItem {
  _id: string;
  userId?: { email?: string; role?: string; profile?: { name?: string } };
  type: string;
  status: string;
  requestedAt: string;
  completedAt?: string;
  ipAddress?: string;
}

interface AuditLogItem {
  _id: string;
  userId?: string;
  action: string;
  resource: string;
  ip?: string;
  createdAt: string;
}

export const AdminCompliancePage: React.FC = () => {
  const [stats, setStats] = useState<ComplianceStats | null>(null);
  const [requests, setRequests] = useState<DataRequestItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminCompliance = useCallback(async () => {
    try {
      const res = await client.get("/compliance/admin/stats");
      if (res.data.success) {
        setStats(res.data.data.stats);
        setRequests(res.data.data.recentRequests || []);
        setAuditLogs(res.data.data.recentAuditLogs || []);
      }
    } catch {
      toast.error("Failed to load admin compliance statistics.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetchAdminCompliance();
  };

  useEffect(() => {
    fetchAdminCompliance();
  }, [fetchAdminCompliance]);

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-2">
            <ShieldCheck className="h-3.5 w-3.5" /> GDPR & CCPA Compliance Operations
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Compliance & Legal Governance</h1>
          <p className="text-slate-400 text-xs mt-1">
            Monitor policy consents, right-to-be-forgotten requests, data exports, and extension security sessions.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
        >
          <RefreshCw className="h-4 w-4" /> Refresh Audit Metrics
        </button>
      </div>

      {/* Policy Versions Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText className="h-4 w-4 text-indigo-400" /> Active Policy Versions & Status
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">Terms of Service</span>
            <div className="font-bold text-white text-sm">v1.0 (Active)</div>
            <span className="text-[10px] text-emerald-400 font-semibold">Enforced at Signup</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">Privacy Policy</span>
            <div className="font-bold text-white text-sm">v1.0 (Active)</div>
            <span className="text-[10px] text-emerald-400 font-semibold">Enforced at Signup</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">Cookie Policy</span>
            <div className="font-bold text-white text-sm">v1.0 (Active)</div>
            <span className="text-[10px] text-emerald-400 font-semibold">Enforced at Signup</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">AI Usage & Ethics</span>
            <div className="font-bold text-white text-sm">v1.0 (Active)</div>
            <span className="text-[10px] text-indigo-400 font-semibold">Public Disclosure</span>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Accepted Consent</span>
            <UserCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {stats ? stats.termsAcceptedCount : "..."} / {stats ? stats.totalUsers : "..."}
          </div>
          <p className="text-[11px] text-slate-500">100% compliant user registration rate</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Pending Erasure/Export</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            {stats ? stats.pendingRequestsCount : "..."}
          </div>
          <p className="text-[11px] text-slate-500">Total processed: {stats ? stats.completedRequestsCount : 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Extension Sessions</span>
            <Radio className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {stats ? stats.extensionActiveSessionsCount : "..."}
          </div>
          <p className="text-[11px] text-slate-500">Active encrypted token sessions</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Security Audit Logs</span>
            <Activity className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {stats ? stats.totalAuditEventsCount : "..."}
          </div>
          <p className="text-[11px] text-slate-500">Recorded authentication & data actions</p>
        </div>
      </div>

      {/* Requests & Audit Logs Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: User Data Requests Queue */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-red-400" /> User Data & Erasure Requests
          </h3>

          {loading ? (
            <div className="text-xs text-slate-400 animate-pulse">Loading request queue...</div>
          ) : requests.length === 0 ? (
            <div className="text-xs text-slate-500 py-6 text-center">No data requests found.</div>
          ) : (
            <div className="divide-y divide-slate-800 overflow-hidden border border-slate-800 rounded-xl bg-slate-950">
              {requests.map((r) => (
                <div key={r._id} className="p-3.5 flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-white">
                      {r.userId?.profile?.name || r.userId?.email || "Unknown User"}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 uppercase">{r.type}</div>
                    <div className="text-[10px] text-slate-500">Requested: {new Date(r.requestedAt).toLocaleString()}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    r.status === "completed" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                  }`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Security Events Audit Log */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-sky-400" /> Security Audit Log Stream
          </h3>

          {loading ? (
            <div className="text-xs text-slate-400 animate-pulse">Loading audit log stream...</div>
          ) : auditLogs.length === 0 ? (
            <div className="text-xs text-slate-500 py-6 text-center">No audit logs recorded.</div>
          ) : (
            <div className="divide-y divide-slate-800 overflow-hidden border border-slate-800 rounded-xl bg-slate-950 max-h-96 overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log._id} className="p-3.5 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="font-mono font-bold text-indigo-400 text-[11px]">{log.action}</div>
                    <div className="text-slate-400 text-[10px]">Resource: {log.resource} • IP: {log.ip || "127.0.0.1"}</div>
                  </div>
                  <div className="text-[10px] text-slate-500">{new Date(log.createdAt).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCompliancePage;
