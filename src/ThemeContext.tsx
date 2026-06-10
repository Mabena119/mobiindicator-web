import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  darkColors,
  lightColors,
  radii,
  shadowFor,
  spacing,
  type ThemeColors,
  type ThemeMode,
  type ThemeShadow,
} from "./theme";
import { loadThemeMode, saveThemeMode } from "./themeStorage";

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ThemeColors;
  shadow: ThemeShadow;
  radii: typeof radii;
  spacing: typeof spacing;
  toggleTheme: () => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    loadThemeMode().then(setMode);
  }, []);

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const next: ThemeMode = prev === "dark" ? "light" : "dark";
      void saveThemeMode(next);
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const colors = mode === "dark" ? darkColors : lightColors;
    return {
      mode,
      colors,
      shadow: shadowFor(mode),
      radii,
      spacing,
      toggleTheme,
      isDark: mode === "dark",
    };
  }, [mode, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useAppTheme must be used within ThemeProvider");
  return ctx;
}
