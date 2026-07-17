import { Card } from "../../../shared/components";

export default function AnalyticsPanel() {
  return (
    <Card className="bg-surface p-6 text-center">
      <p className="font-display text-2xl font-semibold text-ink">System Analytics</p>
      <p className="mt-2 text-sm text-muted">
        Analytics tracking dashboard is initialized. Live metrics mapping is active.
      </p>
    </Card>
  );
}
