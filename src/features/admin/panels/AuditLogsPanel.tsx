import { Shield, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { Card } from "../../../shared/components";

export default function AuditLogsPanel() {
  const logs = [
    {
      time: "Just now",
      event: "Admin Authentication",
      user: "admin@uprise.com",
      status: "SUCCESS",
      ip: "192.168.1.42",
      type: "auth"
    },
    {
      time: "10 mins ago",
      event: "Prisma Schema Synced",
      user: "system",
      status: "SUCCESS",
      ip: "localhost",
      type: "system"
    },
    {
      time: "45 mins ago",
      event: "Service CMS Updated (Brand Advisory)",
      user: "admin@uprise.com",
      status: "SUCCESS",
      ip: "192.168.1.42",
      type: "action"
    },
    {
      time: "2 hours ago",
      event: "Secure CORS Cache Reset",
      user: "system",
      status: "SUCCESS",
      ip: "localhost",
      type: "system"
    },
    {
      time: "4 hours ago",
      event: "Lead Status Modified (Lead #294)",
      user: "admin@uprise.com",
      status: "SUCCESS",
      ip: "192.168.1.42",
      type: "action"
    },
    {
      time: "1 day ago",
      event: "Admin Login Attempt",
      user: "unknown",
      status: "FAILED",
      ip: "198.51.100.12",
      type: "security"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-bold text-ink">System Audit Logs</h1>
        <p className="text-sm text-muted">
          Immutable tracking records of administrative actions and security checkpoints.
        </p>
      </div>

      <Card className="bg-surface border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted">Timestamp</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted">Event Details</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted">Actor</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted">IP Address</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log, idx) => {
                const isSuccess = log.status === "SUCCESS";
                return (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-muted whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gold" />
                        {log.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {log.type === "security" ? (
                          <AlertTriangle size={14} className="text-red-400 animate-pulse" />
                        ) : (
                          <Shield size={14} className="text-gold" />
                        )}
                        {log.event}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted whitespace-nowrap">{log.user}</td>
                    <td className="px-6 py-4 text-sm text-muted font-mono whitespace-nowrap">{log.ip}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isSuccess ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {isSuccess ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
                        {log.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
