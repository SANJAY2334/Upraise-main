type Props = {
  children: React.ReactNode;
  variant?: "gold" | "green" | "red" | "gray" | "blue";
};

export default function Badge({ children, variant = "gray" }: Props) {
  const styles = {
    gold: "border-gold/30 bg-gold/10 text-gold",
    green: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    red: "border-rose-500/30 bg-rose-500/10 text-rose-400",
    gray: "border-white/10 bg-white/5 text-muted",
    blue: "border-sky-500/30 bg-sky-500/10 text-sky-400"
  };

  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
