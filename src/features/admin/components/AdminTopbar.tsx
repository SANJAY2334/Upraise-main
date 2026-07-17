import { ThemeToggle } from "../../../shared/components";

type Props = {
  activeModule: string;
};

export default function AdminTopbar({ activeModule }: Props) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">{activeModule}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-white">
          {activeModule === "Dashboard" ? "Platform overview" : `Manage ${activeModule}`}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring rounded-sm border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:border-gold/40"
        >
          Preview Site ↗
        </a>
      </div>
    </div>
  );
}
