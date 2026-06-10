import { useMemo } from "react";
import { StyleSheet } from "react-native";

import { useAppTheme } from "../ThemeContext";
import type { ThemeColors, ThemeShadow } from "../theme";
import { radii, spacing } from "../theme";

function createChartsStyles(colors: ThemeColors, shadow: ThemeShadow) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
    banner: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      padding: spacing.md,
      marginHorizontal: spacing.md,
      marginTop: spacing.sm,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      ...shadow.card,
    },
    bannerTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
    bannerMeta: { color: colors.muted, fontSize: 13 },
    countPill: {
      minWidth: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.accentSoft,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 10,
    },
    countText: { color: colors.accent, fontWeight: "800", fontSize: 16 },
    error: { color: colors.danger, padding: spacing.md },
    empty: { padding: spacing.xl, gap: spacing.sm },
    emptyList: { flexGrow: 1 },
    listContent: { paddingTop: spacing.sm, paddingBottom: spacing.xl },
    emptyTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
    emptyBody: { color: colors.muted, lineHeight: 22 },
    chevron: { color: colors.muted, fontSize: 28, lineHeight: 28 },
    headerAction: { color: colors.accent, fontWeight: "600", fontSize: 15 },
  });
}

export function useChartsStyles() {
  const { colors, shadow } = useAppTheme();
  return useMemo(() => createChartsStyles(colors, shadow), [colors, shadow]);
}
