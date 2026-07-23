import { TrendingUp, Users, Eye, Target } from "lucide-react";
import { Card } from "../../../shared/components";

export default function AnalyticsPanel() {
  const kpis = [
    { label: "Total Page Views", value: "24,850", change: "+12.4%", icon: Eye, color: "text-blue-500" },
    { label: "Unique Visitors", value: "8,920", change: "+8.2%", icon: Users, color: "text-green-500" },
    { label: "Conversion Rate", value: "3.24%", change: "+0.5%", icon: Target, color: "text-gold" },
    { label: "Avg. Engagement", value: "4m 12s", change: "+15.8%", icon: TrendingUp, color: "text-purple-500" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-bold text-ink">System Analytics</h1>
        <p className="text-sm text-muted">Real-time engagement metrics and conversion mapping indicators.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="bg-surface p-5 border border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">{kpi.label}</span>
                <Icon size={20} className={kpi.color} />
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold tracking-tight text-white">{kpi.value}</span>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                  {kpi.change}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="bg-surface p-6 border border-white/5">
        <h2 className="text-lg font-semibold text-white mb-4">Traffic & Conversion Trends</h2>
        <div className="h-64 w-full flex items-end justify-between gap-2 pt-4">
          {[40, 55, 45, 60, 50, 70, 65, 80, 75, 90, 85, 95].map((val, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div
                className="w-full bg-gold/80 hover:bg-gold rounded-t-sm transition-all duration-500"
                style={{ height: `${val}%` }}
              />
              <span className="text-[10px] text-muted">
                {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][idx]}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
