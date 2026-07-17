type Props = React.HTMLAttributes<HTMLDivElement> & {
  premium?: boolean;
};

export default function Card({ children, premium = true, className = "", ...props }: Props) {
  const baseStyle = premium
    ? "premium-border bg-surface p-6 shadow-md"
    : "rounded-sm border border-white/5 bg-surface/50 p-6";

  return (
    <div className={`${baseStyle} ${className}`} {...props}>
      {children}
    </div>
  );
}
