import Spinner from "./Spinner";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "text";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  type = "button",
  disabled,
  ...props
}: Props) {
  const baseStyle =
    "focus-ring inline-flex items-center justify-center gap-2 rounded-sm font-bold transition disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-gold text-black hover:bg-gold-bright active:bg-gold-deep",
    secondary: "bg-surface border border-border text-ink hover:bg-surface-hover",
    outline: "border border-gold/40 text-gold hover:border-gold-bright hover:text-gold-bright active:border-gold-deep",
    text: "text-muted hover:text-ink"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button
      type={type}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
