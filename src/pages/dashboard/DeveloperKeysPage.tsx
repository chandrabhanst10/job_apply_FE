import type React from "react";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { toast } from "sonner";
import { client } from "../../api/client";
import { Key, Plus, Trash2, Copy, Check, Shield, Code } from "lucide-react";

interface ApiKeyItem {
  _id: string;
  name: string;
  prefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export const DeveloperKeysPage: React.FC = () => {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [newCreatedKey, setNewCreatedKey] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const fetchKeys = async () => {
    try {
      const res = await client.get("/developer/api-keys");
      setKeys(res.data.data);
    } catch {
      toast.error("Failed to load developer API keys.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    client.get("/developer/api-keys").then((res) => {
      if (active) setKeys(res.data.data);
    }).catch(() => {
      if (active) toast.error("Failed to load developer API keys.");
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    setIsGenerating(true);
    try {
      const res = await client.post("/developer/api-keys", { name: newKeyName });
      setNewCreatedKey(res.data.data.key);
      setNewKeyName("");
      toast.success("New Developer API Key generated!");
      fetchKeys();
    } catch {
      toast.error("Failed to generate API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    try {
      await client.delete(`/developer/api-keys/${id}`);
      toast.success("API Key revoked successfully.");
      fetchKeys();
    } catch {
      toast.error("Failed to revoke API key.");
    }
  };

  const handleCopyNewKey = () => {
    if (!newCreatedKey) return;
    navigator.clipboard.writeText(newCreatedKey);
    setIsCopied(true);
    toast.success("API key copied to clipboard!");
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 rounded-3xl border border-slate-800 space-y-1">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
            <Code className="h-3.5 w-3.5" /> Developer Platform
          </span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Developer API Keys</h1>
        <p className="text-xs text-slate-400 max-w-xl">
          Generate secure REST API keys to programmatically manage applications, query feed scanner opportunities, and extract analytics.
        </p>
      </div>

      {/* Secret Key Alert (Shown when new key generated) */}
      {newCreatedKey && (
        <Card className="p-6 bg-indigo-950/30 border-2 border-indigo-500/50 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
              <Key className="h-4 w-4 text-indigo-400" /> Save Your New Secret API Key
            </h3>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              Only Shown Once!
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Copy and store this secret key in a secure location. You will not be able to view it again.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="text"
              readOnly
              value={newCreatedKey}
              className="flex-1 px-3 py-2 bg-slate-950 border border-indigo-500/40 rounded-xl text-xs font-mono text-indigo-300 focus:outline-none"
            />
            <Button onClick={handleCopyNewKey} className="flex items-center gap-2 text-xs font-bold py-2">
              {isCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              {isCopied ? "Copied" : "Copy Key"}
            </Button>
          </div>
        </Card>
      )}

      {/* Generate Key Form */}
      <Card className="p-6 bg-slate-900 border-slate-800 space-y-4">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <Plus className="h-4 w-4 text-indigo-400" /> Generate New API Key
          </CardTitle>
          <CardDescription className="text-slate-400">Create a key with scoped permissions for programmatic access</CardDescription>
        </CardHeader>

        <form onSubmit={handleCreateKey} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Key Name (e.g. Production Webhook Key)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <Button type="submit" isLoading={isGenerating} className="font-bold text-xs">
            Generate Key
          </Button>
        </form>
      </Card>

      {/* API Keys Table */}
      <Card className="p-6 bg-slate-900 border-slate-800 space-y-4">
        <CardHeader className="p-0 pb-4 border-b border-slate-800">
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" /> Active API Keys
          </CardTitle>
          <CardDescription className="text-slate-400">Manage your active developer credentials</CardDescription>
        </CardHeader>

        {isLoading ? (
          <div className="p-4 space-y-3 animate-pulse">
            <Skeleton className="h-8 w-full rounded-xl" />
            <Skeleton className="h-8 w-full rounded-xl" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Prefix</th>
                  <th className="p-3">Scopes</th>
                  <th className="p-3">Created</th>
                  <th className="p-3 text-right">Revoke</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {keys.map((k) => (
                  <tr key={k._id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-semibold text-white">{k.name}</td>
                    <td className="p-3 font-mono text-slate-400">{k.prefix}...</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {k.scopes.join(", ")}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{new Date(k.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleRevokeKey(k._id)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition"
                        title="Revoke Key"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {keys.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      No active API keys found. Generate a key above to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DeveloperKeysPage;
