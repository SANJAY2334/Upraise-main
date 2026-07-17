type Props = {
  headers: string[];
  children: React.ReactNode;
};

export default function Table({ headers, children }: Props) {
  return (
    <div className="w-full overflow-x-auto rounded-sm border border-border bg-black/5 dark:bg-black/15">
      <table className="w-full border-collapse text-left text-sm text-ink">
        <thead>
          <tr className="border-b border-border bg-surface-hover font-semibold text-muted">
            {headers.map((h, i) => (
              <th key={i} className="px-6 py-4 font-display uppercase tracking-widest text-xs select-none">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">{children}</tbody>
      </table>
    </div>
  );
}
