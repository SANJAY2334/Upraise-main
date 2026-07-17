import { Search, X } from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSearch: (v: string) => void;
};

export default function SearchBar({ value, onChange, onSearch }: Props) {
  return (
    <div className="relative max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSearch(value);
        }}
        className="focus-ring w-full rounded-sm border border-white/10 bg-surface py-2 pl-9 pr-4 text-sm text-white placeholder:text-muted"
        placeholder="Search…"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            onSearch("");
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
