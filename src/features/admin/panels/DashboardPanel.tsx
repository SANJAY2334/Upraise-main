import { useQuery } from "@tanstack/react-query";
import { BarChart3, Briefcase, Image as ImageIcon, Layers, MessageSquare, Users, AlertCircle } from "lucide-react";

import { EmptyState, Button } from "../../../shared/components";
import { api } from "../../../shared/services";
import StatCard from "../components/StatCard";

export default function DashboardPanel() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: api.dashboard
  });

  const stats = [
    { label: "Total Leads", value: data?.leads ?? 0, icon: Users },
    { label: "Projects", value: data?.projects ?? 0, icon: Layers },
    { label: "Services", value: data?.services ?? 0, icon: Briefcase },
    { label: "Media Assets", value: data?.mediaAssets ?? 0, icon: ImageIcon },
    { label: "Contact Messages", value: data?.messages ?? 0, icon: MessageSquare },
    { label: "Blog Posts", value: data?.blogs ?? 0, icon: BarChart3 }
  ];

  if (isError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load dashboard metrics"
        message="An error occurred while communicating with the admin service."
      >
        <Button onClick={() => void refetch()} variant="primary">
          Retry Metrics
        </Button>
      </EmptyState>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} loading={isLoading} />
      ))}
    </div>
  );
}
