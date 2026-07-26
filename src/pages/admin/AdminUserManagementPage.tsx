import type React from "react";
import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { toast } from "sonner";
import { client } from "../../api/client";
import { Search, UserX, UserCheck, Shield, RefreshCw } from "lucide-react";

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  isSuspended: boolean;
  createdAt: string;
}

export const AdminUserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (roleFilter) params.append("role", roleFilter);
      const res = await client.get(`/admin/users?${params.toString()}`);
      setUsers(res.data.data.users);
    } catch {
      toast.error("Failed to load user directory.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (roleFilter) params.append("role", roleFilter);
    client.get(`/admin/users?${params.toString()}`).then((res) => {
      if (active) setUsers(res.data.data.users);
    }).catch(() => {
      if (active) toast.error("Failed to load user directory.");
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, [search, roleFilter]);

  const handleToggleStatus = async (user: UserItem) => {
    try {
      await client.patch(`/admin/users/${user._id}/status`, { isSuspended: !user.isSuspended });
      toast.success(`User ${user.name} ${user.isSuspended ? "activated" : "suspended"}`);
      fetchUsers();
    } catch {
      toast.error("Failed to update user status.");
    }
  };

  const handleToggleRole = async (user: UserItem) => {
    const nextRole = user.role === "admin" ? "user" : "admin";
    try {
      await client.patch(`/admin/users/${user._id}/role`, { role: nextRole });
      toast.success(`User ${user.name} role updated to ${nextRole}`);
      fetchUsers();
    } catch {
      toast.error("Failed to update user role.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">User Management</h1>
          <p className="text-xs text-slate-400">View and manage registered user accounts</p>
        </div>
        <Button onClick={fetchUsers} variant="outline" className="flex items-center gap-2 text-xs font-bold">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </div>

      {/* Users Table */}
      <Card className="bg-slate-900 border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4 animate-pulse">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Verified</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-semibold text-white">
                      <div>{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === "admin" || u.role === "super_admin"
                          ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                          : "bg-slate-800 text-slate-300"
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      {u.isEmailVerified ? (
                        <span className="text-emerald-400 font-bold">Yes ✓</span>
                      ) : (
                        <span className="text-slate-500">Unverified</span>
                      )}
                    </td>
                    <td className="p-4">
                      {u.isSuspended ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          Suspended
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleRole(u)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] font-bold transition inline-flex items-center gap-1"
                        title="Toggle Admin Role"
                      >
                        <Shield className="h-3 w-3" />
                        Role
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition inline-flex items-center gap-1 ${
                          u.isSuspended ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-rose-600 hover:bg-rose-500 text-white"
                        }`}
                      >
                        {u.isSuspended ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                        {u.isSuspended ? "Activate" : "Suspend"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminUserManagementPage;
