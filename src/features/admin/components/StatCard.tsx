import { Card, Skeleton } from "../../../shared/components";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: React.ElementType;
  loading?: boolean;
};

export default function StatCard({ label, value, icon: Icon, loading }: StatCardProps) {
  return (
    <Card className="bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        <Icon className="text-gold" size={19} aria-hidden="true" />
      </div>
      {loading ? (
        <Skeleton className="mt-4 h-9 w-20" />
      ) : (
        <p className="mt-4 font-display text-4xl font-semibold text-ink">{value}</p>
      )}
    </Card>
  );
}
