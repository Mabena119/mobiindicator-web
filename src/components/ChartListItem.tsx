import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../ThemeContext";
import { radii, spacing } from "../theme";

interface Props {
  title: string;
  subtitle?: string;
  live?: boolean;
  right?: React.ReactNode;
  onPress?: () => void;
}

export function ChartListItem({ title, subtitle, live, right, onPress }: Props) {
  const { colors, shadow } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.md,
          marginHorizontal: spacing.md,
          marginBottom: spacing.sm,
          borderRadius: radii.sm,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          ...shadow.soft,
        },
        rowPressed: {
          backgroundColor: colors.surfaceAlt,
        },
        main: {
          flex: 1,
          paddingRight: spacing.sm,
        },
        titleRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
        },
        title: {
          color: colors.text,
          fontSize: 17,
          fontWeight: "700",
        },
        subtitle: {
          color: colors.muted,
          fontSize: 13,
          marginTop: 4,
        },
        liveBadge: {
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 999,
          backgroundColor: colors.accentSoft,
        },
        liveDot: {
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: colors.accent,
        },
        liveText: {
          color: colors.accent,
          fontSize: 11,
          fontWeight: "600",
        },
      }),
    [colors, shadow],
  );

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.main}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          {live ? (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          ) : null}
        </View>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </Pressable>
  );
}
