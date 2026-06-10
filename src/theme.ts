export type ThemeMode = "light" | "dark";

export type ThemeColors = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  muted: string;
  brandBlue: string;
  brandCyan: string;
  brandGreen: string;
  accent: string;
  accentSoft: string;
  danger: string;
  up: string;
  down: string;
};

export type ThemeShadow = {
  card: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  soft: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radii = {
  sm: 12,
  md: 16,
  lg: 20,
};

export const lightColors: ThemeColors = {
  bg: "#eef2f7",
  surface: "#ffffff",
  surfaceAlt: "#f8fafc",
  border: "rgba(15, 23, 42, 0.08)",
  text: "#0f172a",
  muted: "#64748b",
  brandBlue: "#2563eb",
  brandCyan: "#06b6d4",
  brandGreen: "#22c55e",
  accent: "#0891b2",
  accentSoft: "rgba(8, 145, 178, 0.12)",
  danger: "#ef4444",
  up: "#22c55e",
  down: "#ef4444",
};

export const darkColors: ThemeColors = {
  bg: "#050508",
  surface: "#0f0f14",
  surfaceAlt: "#16161d",
  border: "rgba(255, 255, 255, 0.08)",
  text: "#f4f4f5",
  muted: "#a1a1aa",
  brandBlue: "#2563eb",
  brandCyan: "#06b6d4",
  brandGreen: "#22c55e",
  accent: "#22c55e",
  accentSoft: "rgba(34, 197, 94, 0.12)",
  danger: "#f87171",
  up: "#4ade80",
  down: "#f87171",
};

export function shadowFor(mode: ThemeMode): ThemeShadow {
  if (mode === "dark") {
    return {
      card: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
        elevation: 4,
      },
      soft: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 2,
      },
    };
  }
  return {
    card: {
      shadowColor: "#2563eb",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.07,
      shadowRadius: 20,
      elevation: 3,
    },
    soft: {
      shadowColor: "#0f172a",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 2,
    },
  };
}

/** @deprecated use useAppTheme().colors */
export const colors = lightColors;

/** @deprecated use useAppTheme().shadow */
export const shadow = shadowFor("light");
