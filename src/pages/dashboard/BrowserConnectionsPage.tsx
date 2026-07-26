import type React from "react";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { toast } from "sonner";
import { client } from "../../api/client";
import { 
  Chrome, 
  Linkedin, 
  Briefcase, 
  RefreshCw, 
  Key, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Zap
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";

interface ExtensionStatusData {
  pairing: {
    isPaired: boolean;
    extensionVersion: string | null;
    browserName: string | null;
    pairedAt: string | null;
    lastHeartbeatAt: string | null;
  };
  platforms: {
    linkedin: { isConnected: boolean; username: string | null; lastSyncAt: string | null };
    naukri: { isConnected: boolean; username: string | null; lastSyncAt: string | null };
  };
  lastSyncAt: string | null;
}

export const BrowserConnectionsPage: React.FC = () => {
  const { accessToken } = useAuthStore();
  const [statusData, setStatusData] = useState<ExtensionStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [pairingPin, setPairingPin] = useState<string | null>(null);
  const [isGeneratingPin, setIsGeneratingPin] = useState(false);
  const [pinCopied, setPinCopied] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await client.get("/extension/status");
      setStatusData(res.data.data);
    } catch {
      toast.error("Failed to load extension connection status.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    client.get("/extension/status").then((res) => {
      if (active) setStatusData(res.data.data);
    }).catch(() => {
      if (active) toast.error("Failed to load extension connection status.");
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, []);

  const handleGeneratePin = async () => {
    setIsGeneratingPin(true);
    try {
      const res = await client.post("/extension/pairing-pin");
      setPairingPin(res.data.data.pin);
      toast.success("6-digit pairing PIN generated!");
    } catch {
      toast.error("Failed to generate pairing PIN.");
    } finally {
      setIsGeneratingPin(false);
    }
  };

  const handleCopyPin = () => {
    if (!pairingPin) return;
    navigator.clipboard.writeText(pairingPin);
    setPinCopied(true);
    toast.success("Pairing PIN copied to clipboard!");
    setTimeout(() => setPinCopied(false), 3000);
  };

  const handleCopyToken = () => {
    if (!accessToken) return;
    navigator.clipboard.writeText(accessToken);
    setIsCopied(true);
    toast.success("Access Token copied to clipboard!");
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await client.post("/extension/disconnect");
      toast.success("Extension disconnected successfully.");
      fetchStatus();
    } catch {
      toast.error("Failed to disconnect extension.");
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <Skeleton className="h-10 w-72 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  const isPaired = statusData?.pairing?.isPaired ?? false;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-950 p-6 rounded-3xl border border-indigo-500/20 shadow-xl text-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Chrome className="h-3.5 w-3.5 text-indigo-400" />
              Manifest V3 Extension Integration
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Browser & Platform Connections
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Manage your official Chrome Extension connection, platform session cookie vaults, and automated pairing status.
          </p>
        </div>

        <Button
          onClick={fetchStatus}
          variant="outline"
          className="flex items-center gap-2 font-bold text-xs"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Status
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Extension Pairing Card */}
        <Card className="lg:col-span-1 p-6 space-y-6 flex flex-col justify-between bg-slate-900 border-slate-800">
          <div>
            <CardHeader className="p-0 pb-4 border-b border-slate-800">
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Chrome className="h-5 w-5 text-indigo-400" />
                Chrome Extension Status
              </CardTitle>
              <CardDescription className="text-slate-400">Official Chrome Web Store companion app</CardDescription>
            </CardHeader>

            <div className="mt-4 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Pairing State</p>
                  <p className="text-[11px] text-slate-400">SaaS account authorization</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isPaired 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}>
                  {isPaired ? "Paired ✓" : "Disconnected ✗"}
                </span>
              </div>

              {isPaired && statusData?.pairing && (
                <div className="space-y-2 text-xs text-slate-300 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <p><strong>Extension Version:</strong> v{statusData.pairing.extensionVersion || "1.0.0"}</p>
                  <p><strong>Browser Target:</strong> {statusData.pairing.browserName || "Chrome"}</p>
                  <p><strong>Last Sync/Heartbeat:</strong> {statusData.pairing.lastHeartbeatAt ? new Date(statusData.pairing.lastHeartbeatAt).toLocaleTimeString() : "Never"}</p>
                </div>
              )}

              {/* 6-Digit Pairing PIN Box */}
              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                    <Zap className="h-4 w-4 text-indigo-400" />
                    <span>Quick Pairing PIN</span>
                  </div>
                  <Button
                    onClick={handleGeneratePin}
                    isLoading={isGeneratingPin}
                    className="text-[11px] font-bold py-1 px-3"
                  >
                    Generate PIN
                  </Button>
                </div>

                {pairingPin ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-indigo-500/40">
                    <span className="text-xl font-black font-mono tracking-widest text-indigo-400">{pairingPin}</span>
                    <button
                      onClick={handleCopyPin}
                      className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 hover:text-white transition flex items-center gap-1 text-xs font-bold"
                    >
                      {pinCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      {pinCopied ? "Copied" : "Copy"}
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Click Generate PIN to get a 6-digit numeric pairing code valid for 10 minutes.
                  </p>
                )}
              </div>

              {/* Pair Token Copy Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <Key className="h-4 w-4 text-slate-400" />
                  <span>Manual JWT Access Token</span>
                </div>
                <Button
                  onClick={handleCopyToken}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 font-bold text-xs py-2"
                >
                  {isCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  {isCopied ? "Token Copied!" : "Copy JWT Access Token"}
                </Button>
              </div>
            </div>
          </div>

          {isPaired && (
            <div className="pt-4 border-t border-slate-800">
              <Button
                onClick={handleDisconnect}
                isLoading={isDisconnecting}
                variant="danger"
                className="w-full font-bold text-xs py-2"
              >
                Disconnect Chrome Extension
              </Button>
            </div>
          )}
        </Card>

        {/* Right: Connected Platform Cookie Vaults */}
        <Card className="lg:col-span-2 p-6 space-y-6 bg-slate-900 border-slate-800">
          <CardHeader className="p-0 pb-4 border-b border-slate-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                Encrypted Session Cookie Vaults
              </CardTitle>
              <CardDescription className="text-slate-400">AES-256 encrypted platform authentication credentials</CardDescription>
            </div>
          </CardHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* LinkedIn */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Linkedin className="h-5 w-5" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white">LinkedIn</h4>
                    <p className="text-[11px] text-slate-400">Recruiter Feed & Auto Apply</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  statusData?.platforms?.linkedin?.isConnected
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-slate-800 text-slate-400"
                }`}>
                  {statusData?.platforms?.linkedin?.isConnected ? "Connected ✓" : "Not Synced"}
                </span>
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                <p><strong>Account:</strong> {statusData?.platforms?.linkedin?.username || "Not connected"}</p>
                <p><strong>Last Vault Sync:</strong> {statusData?.platforms?.linkedin?.lastSyncAt ? new Date(statusData.platforms.linkedin.lastSyncAt).toLocaleString() : "Never"}</p>
              </div>

              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:underline pt-2"
              >
                Open LinkedIn <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Naukri */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-9 w-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <Briefcase className="h-5 w-5" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white">Naukri</h4>
                    <p className="text-[11px] text-slate-400">Automated Job Board Submitter</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  statusData?.platforms?.naukri?.isConnected
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-slate-800 text-slate-400"
                }`}>
                  {statusData?.platforms?.naukri?.isConnected ? "Connected ✓" : "Not Synced"}
                </span>
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                <p><strong>Account:</strong> {statusData?.platforms?.naukri?.username || "Not connected"}</p>
                <p><strong>Last Vault Sync:</strong> {statusData?.platforms?.naukri?.lastSyncAt ? new Date(statusData.platforms.naukri.lastSyncAt).toLocaleString() : "Never"}</p>
              </div>

              <a
                href="https://www.naukri.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:underline pt-2"
              >
                Open Naukri <ExternalLink className="h-3 w-3" />
              </a>
            </div>

          </div>
        </Card>

      </div>
    </div>
  );
};

export default BrowserConnectionsPage;
