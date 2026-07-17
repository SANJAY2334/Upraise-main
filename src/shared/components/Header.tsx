import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { navItems } from "../constants";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  const navHref = (href: string) => (isHome ? href : `/${href}`);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-obsidian/82 backdrop-blur-xl">
      <div className="container-shell flex h-20 items-center justify-between">
        <Link to="/" className="focus-ring flex items-center gap-3 rounded-sm" aria-label="UPRISE home">
          <img src="/uprise-logo.svg" alt="UPRISE" className="h-11 w-auto" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
          {navItems.map((item: { label: string; href: string }) => (
            <a
              key={item.label}
              href={navHref(item.href)}
              className="focus-ring text-sm font-medium text-muted transition hover:text-white"
            >
              {item.label}
            </a>
          ))}
          <Link
            to="/admin"
            className="focus-ring rounded-sm border border-gold/40 px-4 py-2 text-sm font-semibold text-gold transition hover:border-gold-bright hover:text-gold-bright"
          >
            Admin
          </Link>
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-4 md:hidden">
          <ThemeToggle />
          <button
            className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-sm border border-white/15 text-white"
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-surface md:hidden">
          <nav className="container-shell flex flex-col gap-1 py-5">
            {navItems.map((item: { label: string; href: string }) => (
              <a
                key={item.label}
                href={navHref(item.href)}
                className="focus-ring rounded-sm px-3 py-3 text-base font-medium text-muted hover:bg-white/5 hover:text-white"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <Link
              to="/admin"
              className="focus-ring rounded-sm px-3 py-3 text-base font-medium text-gold"
              onClick={() => setOpen(false)}
            >
              Admin
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
