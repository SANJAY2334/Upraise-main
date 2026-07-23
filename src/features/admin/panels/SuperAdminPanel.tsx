import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Shield,
  ShieldAlert,
  Users,
  Plus,
  Copy,
  Check,
  RefreshCw,
  Search,
  Database,
  HardDrive,
  Mail,
  Server,
  Activity,
  Lock,
  UserX,
  UserCheck,
  Trash2,
  KeyRound
} from "lucide-react";
import { useState } from "react";
import { Card, Button, Input, Select, useToast, ConfirmDialog } from "../../../shared/components";
import { authFetch } from "../../../shared/services";

export default function SuperAdminPanel() {
  const [activeSubTab, setActiveSubTab] = useState<"dashboard" | "admins" | "security" | "system">("dashboard");
  const toast = useToast();

  // Queries
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats
  } = useQuery({
    queryKey: ["super-admin", "stats"],
    queryFn: async () => {
      const res = await authFetch("/api/super-admin/dashboard/stats");
      if (!res.ok) throw new Error("Failed to fetch dashboard stats.");
      const json = await res.json();
      return json.data;
    }
  });

  const {
    data: admins,
    isLoading: adminsLoading,
    refetch: refetchAdmins
  } = useQuery({
    queryKey: ["super-admin", "admins"],
    queryFn: async () => {
      const res = await authFetch("/api/super-admin/admins");
      if (!res.ok) throw new Error("Failed to fetch administrators.");
      const json = await res.json();
      return json.data;
    }
  });

  const {
    data: loginHistory,
    isLoading: historyLoading,
    refetch: refetchHistory
  } = useQuery({
    queryKey: ["super-admin", "login-history"],
    queryFn: async () => {
      const res = await authFetch("/api/super-admin/security/login-history");
      if (!res.ok) throw new Error("Failed to fetch login history.");
      const json = await res.json();
      return json.data;
    }
  });

  const {
    data: auditLogs,
    isLoading: auditsLoading,
    refetch: refetchAudits
  } = useQuery({
    queryKey: ["super-admin", "audit-logs"],
    queryFn: async () => {
      const res = await authFetch("/api/super-admin/security/audit-logs");
      if (!res.ok) throw new Error("Failed to fetch audit logs.");
      const json = await res.json();
      return json.data;
    }
  });

  const {
    data: systemHealth,
    isLoading: healthLoading,
    refetch: refetchHealth
  } = useQuery({
    queryKey: ["super-admin", "health"],
    queryFn: async () => {
      const res = await authFetch("/api/super-admin/system/health");
      if (!res.ok) throw new Error("Failed to fetch system health.");
      const json = await res.json();
      return json.data;
    }
  });

  // State for Admin Creation / Actions
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdAdmin, setCreatedAdmin] = useState<{ email: string; tempPass: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const [confirmAction, setConfirmAction] = useState<{
    type: "suspend" | "activate" | "delete" | "reset-password";
    adminId: string;
    adminName: string;
    adminEmail: string;
    newRole?: string;
  } | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Mutations
  const createAdminMutation = useMutation({
    mutationFn: async (payload: { name: string; email: string; role: string }) => {
      const res = await authFetch("/api/super-admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Failed to create admin.");
      }
      const json = await res.json();
      return json.data;
    },
    onSuccess: (data) => {
      setCreatedAdmin({ email: data.email, tempPass: data.temporaryPassword });
      refetchAdmins();
      refetchStats();
      toast("success", `Administrator account created for ${data.email}.`);
    },
    onError: (err: Error) => {
      toast("error", err.message);
    }
  });

  const updateAdminMutation = useMutation({
    mutationFn: async (payload: { id: string; status?: string; role?: string }) => {
      const res = await authFetch(`/api/super-admin/admins/${payload.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Failed to update admin.");
      }
      return res.json();
    },
    onSuccess: () => {
      refetchAdmins();
      refetchStats();
      toast("success", "Administrator settings updated successfully.");
      setConfirmAction(null);
    },
    onError: (err: Error) => {
      toast("error", err.message);
      setConfirmAction(null);
    }
  });

  const deleteAdminMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch(`/api/super-admin/admins/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Failed to delete admin.");
      }
      return res.json();
    },
    onSuccess: () => {
      refetchAdmins();
      refetchStats();
      toast("success", "Administrator account deleted successfully.");
      setConfirmAction(null);
    },
    onError: (err: Error) => {
      toast("error", err.message);
      setConfirmAction(null);
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch(`/api/super-admin/admins/${id}/reset-password`, {
        method: "POST"
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Failed to reset password.");
      }
      const json = await res.json();
      return json.data;
    },
    onSuccess: (data) => {
      setCreatedAdmin({ email: data.email, tempPass: data.temporaryPassword });
      refetchAdmins();
      toast("success", `Password reset successfully for ${data.email}.`);
      setConfirmAction(null);
    },
    onError: (err: Error) => {
      toast("error", err.message);
      setConfirmAction(null);
    }
  });

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "");
    const email = String(fd.get("email") || "");
    const role = String(fd.get("role") || "ADMIN");

    if (!name || !email) {
      toast("error", "All fields are required.");
      return;
    }
    createAdminMutation.mutate({ name, email, role });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast("success", "Temporary password copied to clipboard.");
    setTimeout(() => setCopied(false), 2000);
  };

  // Filtered Admins
  const filteredAdmins = (admins || []).filter((a: any) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" || a.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Shield className="text-gold h-8 w-8 animate-pulse" />
            Super Admin Control Center
          </h1>
          <p className="mt-1 text-sm text-muted">
            Configure system configurations, manage administrative roles, and inspect security audit streams.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              refetchStats();
              refetchAdmins();
              refetchHistory();
              refetchAudits();
              refetchHealth();
              toast("success", "Control center dashboard refreshed.");
            }}
            variant="secondary"
            className="flex items-center gap-2 px-4 py-2"
          >
            <RefreshCw size={14} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto">
        {(["dashboard", "admins", "security", "system"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all capitalize whitespace-nowrap ${
              activeSubTab === tab
                ? "border-gold text-gold bg-white/5"
                : "border-transparent text-muted hover:text-white hover:bg-white/5"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 1. Dashboard Tab */}
      {activeSubTab === "dashboard" && (
        <div className="space-y-6">
          {statsLoading ? (
            <div className="grid h-40 place-items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-surface p-5 border border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted">Total Admins</span>
                    <Users className="text-gold" size={20} />
                  </div>
                  <div className="mt-4 text-3xl font-extrabold text-white">{stats?.totalAdmins ?? 0}</div>
                </Card>

                <Card className="bg-surface p-5 border border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted">Active Admins</span>
                    <UserCheck className="text-emerald-400" size={20} />
                  </div>
                  <div className="mt-4 text-3xl font-extrabold text-white">{stats?.activeAdmins ?? 0}</div>
                </Card>

                <Card className="bg-surface p-5 border border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted">Suspended Admins</span>
                    <UserX className="text-red-400" size={20} />
                  </div>
                  <div className="mt-4 text-3xl font-extrabold text-white">{stats?.suspendedAdmins ?? 0}</div>
                </Card>

                <Card className="bg-surface p-5 border border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted">Active Sessions</span>
                    <Activity className="text-blue-400 animate-pulse" size={20} />
                  </div>
                  <div className="mt-4 text-3xl font-extrabold text-white">{stats?.activeSessions ?? 0}</div>
                </Card>
              </div>

              {/* Login Alerts Summary */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Logins */}
                <Card className="bg-surface p-6 border border-white/5">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <UserCheck className="text-emerald-400" size={18} />
                    Successful Logins
                  </h2>
                  <div className="divide-y divide-white/5">
                    {stats?.recentLogins?.length ? (
                      stats.recentLogins.map((l: any) => (
                        <div
                          key={l.id}
                          className="py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm gap-1"
                        >
                          <div>
                            <p className="font-semibold text-white">{l.email}</p>
                            <p className="text-xs text-muted">{l.userAgent}</p>
                          </div>
                          <div className="text-right whitespace-nowrap">
                            <span className="text-xs font-mono text-muted bg-white/5 px-2 py-0.5 rounded mr-2">
                              {l.ip}
                            </span>
                            <span className="text-xs text-muted">{new Date(l.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted py-4 text-center">No successful logins recorded.</p>
                    )}
                  </div>
                </Card>

                {/* Failed Logins */}
                <Card className="bg-surface p-6 border border-white/5">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <ShieldAlert className="text-red-400" size={18} />
                    Failed Login Attempts
                  </h2>
                  <div className="divide-y divide-white/5">
                    {stats?.failedLogins?.length ? (
                      stats.failedLogins.map((l: any) => (
                        <div
                          key={l.id}
                          className="py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm gap-1 bg-red-500/5 px-2 rounded border border-red-500/10 mb-1"
                        >
                          <div>
                            <p className="font-semibold text-red-300">{l.email}</p>
                            <p className="text-xs text-red-400">{l.reason}</p>
                          </div>
                          <div className="text-right whitespace-nowrap">
                            <span className="text-xs font-mono text-red-300 bg-red-500/10 px-2 py-0.5 rounded mr-2">
                              {l.ip}
                            </span>
                            <span className="text-xs text-muted">{new Date(l.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted py-4 text-center">No failed attempts logged.</p>
                    )}
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      )}

      {/* 2. Administrators Tab */}
      {activeSubTab === "admins" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col sm:flex-row gap-2">
              <div className="relative max-w-xs flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  placeholder="Search name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="w-40">
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  options={[
                    { label: "All Roles", value: "ALL" },
                    { label: "Super Admin", value: "SUPER_ADMIN" },
                    { label: "Admin", value: "ADMIN" },
                    { label: "Editor", value: "EDITOR" }
                  ]}
                />
              </div>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
              <Plus size={16} />
              Create Admin
            </Button>
          </div>

          {adminsLoading ? (
            <div className="grid h-40 place-items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            </div>
          ) : (
            <Card className="bg-surface border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted">
                        Administrator
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted">Role</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted">Created</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredAdmins.length ? (
                      filteredAdmins.map((admin: any) => {
                        const isSuper = admin.role === "SUPER_ADMIN";
                        const isInvited = admin.status === "INVITED";
                        const isSuspended = admin.status === "SUSPENDED";
                        return (
                          <tr key={admin.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-semibold text-white">{admin.name}</div>
                              <div className="text-sm text-muted">{admin.email}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  isSuper ? "bg-amber-500/10 text-amber-400" : "bg-white/10 text-white"
                                }`}
                              >
                                {isSuper && <Shield size={10} />}
                                {admin.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  isInvited
                                    ? "bg-blue-500/10 text-blue-400"
                                    : isSuspended
                                      ? "bg-red-500/10 text-red-400"
                                      : "bg-emerald-500/10 text-emerald-400"
                                }`}
                              >
                                {admin.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-muted">
                              {new Date(admin.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {isSuspended ? (
                                  <button
                                    onClick={() =>
                                      setConfirmAction({
                                        type: "activate",
                                        adminId: admin.id,
                                        adminName: admin.name,
                                        adminEmail: admin.email
                                      })
                                    }
                                    className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded transition"
                                    title="Unsuspend Admin"
                                  >
                                    <UserCheck size={16} />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      setConfirmAction({
                                        type: "suspend",
                                        adminId: admin.id,
                                        adminName: admin.name,
                                        adminEmail: admin.email
                                      })
                                    }
                                    className="p-1.5 text-amber-400 hover:bg-amber-500/10 rounded transition"
                                    title="Suspend Admin"
                                  >
                                    <UserX size={16} />
                                  </button>
                                )}
                                <button
                                  onClick={() =>
                                    setConfirmAction({
                                      type: "reset-password",
                                      adminId: admin.id,
                                      adminName: admin.name,
                                      adminEmail: admin.email
                                    })
                                  }
                                  className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded transition"
                                  title="Reset Password"
                                >
                                  <KeyRound size={16} />
                                </button>
                                <button
                                  onClick={() =>
                                    setConfirmAction({
                                      type: "delete",
                                      adminId: admin.id,
                                      adminName: admin.name,
                                      adminEmail: admin.email
                                    })
                                  }
                                  className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition"
                                  title="Delete Admin"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-sm text-muted">
                          No administrators match the search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* 3. Security Tab */}
      {activeSubTab === "security" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Append-only Audit Logs */}
          <Card className="bg-surface p-6 border border-white/5 flex flex-col h-[600px] overflow-hidden">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Shield className="text-gold" size={18} />
              System Audit Stream
            </h2>
            <p className="text-xs text-muted mb-4">
              Append-only security log files. These records cannot be modified or cleared.
            </p>
            <div className="flex-1 overflow-y-auto divide-y divide-white/5 pr-2">
              {auditsLoading ? (
                <div className="grid h-full place-items-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
                </div>
              ) : auditLogs?.length ? (
                auditLogs.map((log: any) => (
                  <div key={log.id} className="py-3 text-xs leading-relaxed">
                    <div className="flex justify-between text-[10px] text-muted">
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                      <span>{log.user ? `${log.user.name} (${log.user.role})` : "System"}</span>
                    </div>
                    <p className="mt-1 font-semibold text-white">{log.action}</p>
                    <p className="text-muted">
                      Entity: {log.entity} (ID: {log.entityId || "N/A"})
                    </p>
                    {log.metadata && (
                      <pre className="mt-1 bg-black/30 p-2 rounded text-[10px] text-gold overflow-x-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted py-8 text-center">No system audit logs found.</p>
              )}
            </div>
          </Card>

          {/* Login History */}
          <Card className="bg-surface p-6 border border-white/5 flex flex-col h-[600px] overflow-hidden">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Lock className="text-blue-400" size={18} />
              Login Activity History
            </h2>
            <p className="text-xs text-muted mb-4">Global tracking log of administrative login checkpoints.</p>
            <div className="flex-1 overflow-y-auto divide-y divide-white/5 pr-2">
              {historyLoading ? (
                <div className="grid h-full place-items-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
                </div>
              ) : loginHistory?.length ? (
                loginHistory.map((history: any) => {
                  const isSuccess = history.status === "SUCCESS";
                  return (
                    <div key={history.id} className="py-3 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-white">{history.email}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            isSuccess ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {history.status}
                        </span>
                      </div>
                      <div className="mt-1 flex justify-between text-muted">
                        <span>IP: {history.ip}</span>
                        <span>{new Date(history.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-muted mt-0.5 truncate">{history.userAgent}</p>
                      {history.reason && <p className="text-red-400 mt-0.5">Reason: {history.reason}</p>}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted py-8 text-center">No login history recorded.</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* 4. System Tab */}
      {activeSubTab === "system" && (
        <div className="space-y-6">
          {healthLoading ? (
            <div className="grid h-40 place-items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Database Card */}
              <Card className="bg-surface p-6 border border-white/5 flex items-start gap-4">
                <Database className="text-gold h-10 w-10 mt-1" />
                <div>
                  <h3 className="font-bold text-white text-lg">Database Service</h3>
                  <p className="text-xs text-muted mt-1">Primary PostgreSQL Database connection.</p>
                  <div className="mt-4 flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        systemHealth?.databaseStatus === "HEALTHY" ? "bg-emerald-400" : "bg-red-400 animate-pulse"
                      }`}
                    />
                    <span className="text-sm font-semibold text-white capitalize">
                      {systemHealth?.databaseStatus?.toLowerCase()}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Server Host */}
              <Card className="bg-surface p-6 border border-white/5 flex items-start gap-4">
                <Server className="text-blue-400 h-10 w-10 mt-1" />
                <div>
                  <h3 className="font-bold text-white text-lg">Express Runtime</h3>
                  <p className="text-xs text-muted mt-1">Application server diagnostics.</p>
                  <p className="text-xs text-white mt-2">
                    Environment:{" "}
                    <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded text-gold">
                      {systemHealth?.environment}
                    </span>
                  </p>
                  <p className="text-xs text-white mt-1">
                    Uptime: <span className="font-semibold">{Math.floor(systemHealth?.uptime / 60)} minutes</span>
                  </p>
                </div>
              </Card>

              {/* Storage Provider */}
              <Card className="bg-surface p-6 border border-white/5 flex items-start gap-4">
                <HardDrive className="text-purple-400 h-10 w-10 mt-1" />
                <div>
                  <h3 className="font-bold text-white text-lg">Storage Assets</h3>
                  <p className="text-xs text-muted mt-1">Cloud file storage provider integration.</p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span className="text-sm font-semibold text-white">{systemHealth?.storageProvider}</span>
                  </div>
                </div>
              </Card>

              {/* Email Gateway */}
              <Card className="bg-surface p-6 border border-white/5 flex items-start gap-4">
                <Mail className="text-cyan-400 h-10 w-10 mt-1" />
                <div>
                  <h3 className="font-bold text-white text-lg">Email Gateway</h3>
                  <p className="text-xs text-muted mt-1">Transactional mail & invitations desk.</p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span className="text-sm font-semibold text-white">READY (AUTO)</span>
                  </div>
                </div>
              </Card>

              {/* System Backups */}
              <Card className="bg-surface p-6 border border-white/5 flex items-start gap-4">
                <Shield className="text-emerald-400 h-10 w-10 mt-1" />
                <div>
                  <h3 className="font-bold text-white text-lg">Disaster Recovery</h3>
                  <p className="text-xs text-muted mt-1">Database dumps & replication status.</p>
                  <p className="text-xs text-white mt-3">
                    Scheduled: <span className="font-semibold text-gold">Weekly Automated</span>
                  </p>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Admin Creation Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <Card className="bg-surface p-6 max-w-md w-full border border-white/10 shadow-2xl relative">
            <h2 className="text-xl font-bold text-white mb-4">Create Administrator Account</h2>

            {createdAdmin ? (
              <div className="space-y-4">
                <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded">
                  Administrator account created successfully! Save the temporary password below now. It will only be
                  shown once.
                </p>
                <div className="bg-black/30 p-4 rounded text-center border border-white/10 relative overflow-hidden group">
                  <p className="text-xs text-muted uppercase tracking-wider">Temporary Password</p>
                  <p className="text-2xl font-mono font-bold text-gold mt-2 select-all tracking-wider">
                    {createdAdmin.tempPass}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => copyToClipboard(createdAdmin.tempPass)}
                    className="flex-1 flex items-center justify-center gap-2 py-3"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? "Copied!" : "Copy to Clipboard"}
                  </Button>
                  <Button
                    onClick={() => {
                      setCreatedAdmin(null);
                      setShowCreateModal(false);
                    }}
                    variant="secondary"
                    className="px-4 py-3"
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="create-admin-name"
                    className="text-xs font-semibold text-muted uppercase tracking-wider"
                  >
                    Full Name
                  </label>
                  <Input
                    id="create-admin-name"
                    name="name"
                    placeholder="UPRISE Administrator"
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <label
                    htmlFor="create-admin-email"
                    className="text-xs font-semibold text-muted uppercase tracking-wider"
                  >
                    Email Address
                  </label>
                  <Input
                    id="create-admin-email"
                    name="email"
                    type="email"
                    placeholder="admin@uprise.com"
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <label
                    htmlFor="create-admin-role"
                    className="text-xs font-semibold text-muted uppercase tracking-wider"
                  >
                    System Role
                  </label>
                  <Select
                    id="create-admin-role"
                    name="role"
                    defaultValue="ADMIN"
                    className="mt-2"
                    options={[
                      { label: "Admin (Full platform access)", value: "ADMIN" },
                      { label: "Super Admin (System Control Center)", value: "SUPER_ADMIN" },
                      { label: "Editor (Content & Leads only)", value: "EDITOR" }
                    ]}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" onClick={() => setShowCreateModal(false)} variant="secondary">
                    Cancel
                  </Button>
                  <Button type="submit" loading={createAdminMutation.isPending}>
                    Generate Account
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}

      {/* Confirmation Dialogs for destructive actions */}
      {confirmAction && (
        <ConfirmDialog
          open={true}
          title={
            confirmAction.type === "suspend"
              ? "Suspend Administrator Account?"
              : confirmAction.type === "activate"
                ? "Activate Administrator Account?"
                : confirmAction.type === "delete"
                  ? "Delete Administrator Account?"
                  : "Reset Administrator Password?"
          }
          description={
            confirmAction.type === "suspend"
              ? `Are you sure you want to suspend access for ${confirmAction.adminName} (${confirmAction.adminEmail})? They will be locked out immediately.`
              : confirmAction.type === "activate"
                ? `Are you sure you want to activate access for ${confirmAction.adminName} (${confirmAction.adminEmail})?`
                : confirmAction.type === "delete"
                  ? `WARNING: This action is permanent. Are you sure you want to completely delete the administrator account for ${confirmAction.adminName} (${confirmAction.adminEmail})?`
                  : `Are you sure you want to force reset the password for ${confirmAction.adminName} (${confirmAction.adminEmail})? All their current active sessions will be terminated.`
          }
          onConfirm={() => {
            if (confirmAction.type === "suspend") {
              updateAdminMutation.mutate({ id: confirmAction.adminId, status: "SUSPENDED" });
            } else if (confirmAction.type === "activate") {
              updateAdminMutation.mutate({ id: confirmAction.adminId, status: "ACTIVE" });
            } else if (confirmAction.type === "delete") {
              deleteAdminMutation.mutate(confirmAction.adminId);
            } else if (confirmAction.type === "reset-password") {
              resetPasswordMutation.mutate(confirmAction.adminId);
            }
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
