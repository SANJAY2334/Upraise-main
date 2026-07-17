type Props = {
  className?: string;
};

export default function Skeleton({ className = "" }: Props) {
  return (
    <div
      className={`animate-pulse rounded-sm bg-muted/10 ${className}`}
      role="progressbar"
      aria-busy="true"
      aria-label="Loading placeholder"
    />
  );
}
