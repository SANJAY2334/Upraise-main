import { Card } from "../../../shared/components";

type Props = {
  metrics: Array<{ value: string; label: string }>;
};

export default function MetricsSection({ metrics }: Props) {
  return (
    <section className="border-y border-border bg-surface py-16">
      <div className="container-shell grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="bg-black/35 p-5">
            <p className="font-display text-4xl font-bold text-gold">{metric.value}</p>
            <p className="mt-3 text-sm leading-6 text-muted">{metric.label}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
