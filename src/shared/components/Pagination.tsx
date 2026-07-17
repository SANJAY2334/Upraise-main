import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  total: number;
  limit: number;
  onPage: (page: number) => void;
};

export default function Pagination({ page, total, limit, onPage }: Props) {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;
  return (
    <div className="flex items-center gap-2 pt-4">
      <button
        id="pagination-prev"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="focus-ring rounded-sm border border-white/10 p-2 text-muted transition hover:text-white disabled:opacity-30"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-xs text-muted">
        Page {page} of {pages} &nbsp;·&nbsp; {total} records
      </span>
      <button
        id="pagination-next"
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
        className="focus-ring rounded-sm border border-white/10 p-2 text-muted transition hover:text-white disabled:opacity-30"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
