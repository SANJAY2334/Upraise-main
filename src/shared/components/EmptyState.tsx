type Props = {
  icon: React.ElementType;
  title?: string;
  message: string;
  children?: React.ReactNode;
};

export default function EmptyState({ icon: Icon, title = "No records found", message, children }: Props) {
  return (
    <div className="grid place-items-center border border-dashed border-border py-14 text-center rounded-sm">
      <Icon className="text-muted" size={32} aria-hidden="true" />
      <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-muted max-w-sm px-4">{message}</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
