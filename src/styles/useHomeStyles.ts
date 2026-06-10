import { useMemo } from "react";
import { Platform, StyleSheet } from "react-native";

import { useAppTheme } from "../ThemeContext";
import type { ThemeColors, ThemeShadow } from "../theme";
import { radii, spacing } from "../theme";

function createHomeStyles(colors: ThemeColors, shadow: ThemeShadow, isDark: boolean) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    headerTop: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.sm,
      flex: 1,
    },
    logo: {
      width: 52,
      height: 52,
      borderRadius: radii.sm,
      backgroundColor: "#fff",
      ...shadow.soft,
    },
    title: { color: colors.text, fontSize: 24, fontWeight: "800", letterSpacing: -0.3 },
    lead: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 4 },
    emptyList: { flexGrow: 1 },
    listContent: { paddingBottom: spacing.xl },
    empty: { flex: 1, padding: spacing.xl, justifyContent: "center", gap: spacing.sm },
    emptyTitle: { color: colors.text, fontSize: 20, fontWeight: "700" },
    emptyBody: { color: colors.muted, lineHeight: 22 },
    card: {
      marginHorizontal: spacing.lg,
      marginTop: spacing.md,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      overflow: "hidden",
      ...shadow.card,
    },
    cardMain: { padding: spacing.md, gap: 4 },
    cardPressed: { backgroundColor: colors.surfaceAlt },
    cardTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    cardTitle: { color: colors.text, fontSize: 18, fontWeight: "700", flex: 1 },
    cardMeta: { color: colors.muted, fontSize: 13 },
    badgeLive: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: colors.accentSoft,
    },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
    badgeLiveText: { color: colors.accent, fontSize: 11, fontWeight: "700" },
    badgeExpired: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: "rgba(239,68,68,0.15)",
    },
    badgeExpiredText: { color: colors.danger, fontSize: 11, fontWeight: "700" },
    badgeOffline: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: colors.surfaceAlt,
    },
    badgeOfflineText: { color: colors.muted, fontSize: 11, fontWeight: "700" },
    cardActions: {
      flexDirection: "row",
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    actionBtn: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    actionPrimary: { color: colors.accent, fontWeight: "700", fontSize: 14 },
    actionDanger: { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: colors.border },
    actionDangerText: { color: colors.danger, fontWeight: "600", fontSize: 14 },
    actionPressed: { opacity: 0.75 },
    footer: { padding: spacing.lg, paddingTop: spacing.sm },
    addBtn: {
      backgroundColor: colors.accent,
      borderRadius: radii.sm,
      paddingVertical: 16,
      alignItems: "center",
      ...shadow.soft,
    },
    addBtnPressed: { opacity: 0.88 },
    addBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    modalBackdrop: {
      flex: 1,
      backgroundColor: isDark ? "rgba(0,0,0,0.55)" : "rgba(15, 23, 42, 0.35)",
      justifyContent: "flex-end",
    },
    modal: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: radii.lg,
      borderTopRightRadius: radii.lg,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    modalTitle: { color: colors.text, fontSize: 20, fontWeight: "800" },
    modalHint: { color: colors.muted, lineHeight: 20, fontSize: 14 },
    input: {
      backgroundColor: colors.bg,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: spacing.md,
      paddingVertical: 14,
      color: colors.text,
      fontSize: 16,
      fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }),
    },
    error: { color: colors.danger, fontSize: 14 },
    modalActions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
    modalBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
      backgroundColor: colors.surfaceAlt,
    },
    modalCancel: { color: colors.text, fontWeight: "600" },
    modalConnect: { backgroundColor: colors.accent },
    modalConnectText: { color: "#fff", fontWeight: "700" },
  });
}

export function useHomeStyles() {
  const { colors, shadow, isDark } = useAppTheme();
  return useMemo(() => createHomeStyles(colors, shadow, isDark), [colors, shadow, isDark]);
}
