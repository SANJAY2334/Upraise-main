import { ChevronRight, LogOut, Lock } from "lucide-react";

type ModuleType = {
  key: string;
  icon: React.ElementType;
};

type Props = {
  activeModule: string;
  setActiveModule: (m: string) => void;
  adminModules: ModuleType[];
  email?: string | undefined;
  onLogout: () => void;
};

export default function AdminSidebar({ activeModule, setActiveModule, adminModules, email, onLogout }: Props) {
  return (
    <aside className="border-r border-border bg-surface px-4 py-6">
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <div className="grid h-10 w-10 place-items-center rounded-sm bg-gold text-black">
          <Lock size={18} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-ink">UPRISE Admin</p>
          {email && <p className="truncate text-xs text-muted">{email}</p>}
        </div>
      </div>
      <nav className="mt-5 grid gap-1" aria-label="Admin navigation">
        {adminModules.map(({ key, icon: Icon }) => (
          <button
            key={key}
            type="button"
            className={`focus-ring flex items-center justify-between rounded-sm px-3 py-3 text-left text-sm transition ${
              activeModule === key ? "bg-gold text-black" : "text-muted hover:bg-surface-hover hover:text-ink"
            }`}
            onClick={() => setActiveModule(key)}
          >
            <span className="flex items-center gap-2">
              <Icon size={16} aria-hidden="true" />
              {key}
            </span>
            <ChevronRight size={15} aria-hidden="true" />
          </button>
        ))}
      </nav>
      <div className="mt-6 border-t border-border pt-5">
        <button
          type="button"
          onClick={onLogout}
          className="focus-ring flex w-full items-center gap-2 rounded-sm px-3 py-3 text-left text-sm text-muted transition hover:bg-surface-hover hover:text-red-400"
        >
          <LogOut size={16} aria-hidden="true" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
