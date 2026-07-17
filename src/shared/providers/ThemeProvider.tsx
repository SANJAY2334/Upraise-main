import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "light" | "dark" | "system";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem("uprise-theme") as Theme) || "system";
  });

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem("uprise-theme", newTheme);
    setThemeState(newTheme);
  };

  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = () => {
      let activeTheme: "light" | "dark" = "dark";

      if (theme === "system") {
        activeTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      } else {
        activeTheme = theme;
      }

      root.classList.remove("light", "dark");
      root.classList.add(activeTheme);

      // Update inline color scheme for browser elements
      root.style.colorScheme = activeTheme;
    };

    applyTheme();

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = () => applyTheme();
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
