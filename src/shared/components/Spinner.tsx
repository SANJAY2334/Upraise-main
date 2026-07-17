type Props = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

export default function Spinner({ size = "md", className = "" }: Props) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-5 w-5 border-2",
    lg: "h-8 w-8 border-3"
  };

  return (
    <div
      className={`animate-spin rounded-full border-t-transparent border-current ${sizes[size]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
