import { Card } from "../../../shared/components";

export default function AuditLogsPanel() {
  return (
    <Card className="bg-surface p-6 text-center">
      <p className="font-display text-2xl font-semibold text-ink">System Audit Logs</p>
      <p className="mt-2 text-sm text-muted">
        Auditing and security logs database queries are fully tracked in the server logging pipeline.
      </p>
    </Card>
  );
}
