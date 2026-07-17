import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "../providers";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-sm border border-border bg-surface p-1">
      <button
        onClick={() => setTheme("light")}
        className={`focus-ring rounded-sm p-1.5 transition ${
          theme === "light" ? "bg-gold text-black" : "text-muted hover:text-ink"
        }`}
        title="Light theme"
        aria-label="Switch to light theme"
        type="button"
      >
        <Sun size={15} />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`focus-ring rounded-sm p-1.5 transition ${
          theme === "dark" ? "bg-gold text-black" : "text-muted hover:text-ink"
        }`}
        title="Dark theme"
        aria-label="Switch to dark theme"
        type="button"
      >
        <Moon size={15} />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`focus-ring rounded-sm p-1.5 transition ${
          theme === "system" ? "bg-gold text-black" : "text-muted hover:text-ink"
        }`}
        title="System preference"
        aria-label="Use system theme preference"
        type="button"
      >
        <Laptop size={15} />
      </button>
    </div>
  );
}
