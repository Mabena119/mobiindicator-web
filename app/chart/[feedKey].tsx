import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect, useMemo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChartWebView } from "../../src/components/ChartWebView";
import { useAppTheme } from "../../src/ThemeContext";
import { radii, spacing } from "../../src/theme";

export default function ChartDetailScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.bg,
        },
        screen: {
          flex: 1,
          backgroundColor: colors.bg,
        },
        center: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: spacing.lg,
        },
        topBar: {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.md,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
          backgroundColor: colors.surface,
        },
        topBarText: {
          flex: 1,
          gap: 2,
        },
        indicatorName: {
          color: colors.text,
          fontSize: 15,
          fontWeight: "700",
        },
        hint: {
          color: colors.muted,
          fontSize: 12,
          lineHeight: 16,
        },
        livePill: {
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor: colors.accentSoft,
        },
        liveDot: {
          width: 7,
          height: 7,
          borderRadius: 4,
          backgroundColor: colors.accent,
        },
        liveText: {
          color: colors.accent,
          fontSize: 12,
          fontWeight: "700",
        },
        chartFrame: {
          flex: 1,
          minHeight: 0,
          margin: spacing.sm,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
          backgroundColor: "#000",
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.35,
              shadowRadius: 16,
            },
            android: {
              elevation: 6,
            },
            default: {},
          }),
        },
        error: {
          color: colors.danger,
          textAlign: "center",
        },
      }),
    [colors],
  );

  const params = useLocalSearchParams<{
    feedKey?: string;
    code?: string;
    label?: string;
    indicatorName?: string;
    feedCode?: string;
  }>();
  const feedKey = (params.feedKey ?? "").toString();
  const code = (params.code ?? "").toString().toUpperCase();
  const label = (params.label ?? feedKey).toString();
  const indicatorName = (params.indicatorName ?? "").toString();
  const streamCode = (params.feedCode ?? "").toString();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ title: label });
  }, [navigation, label]);

  if (!code || !feedKey) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Missing chart connection</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={{ flex: 1, paddingBottom: Math.max(insets.bottom, spacing.sm) }}>
      <View style={styles.topBar}>
        <View style={styles.topBarText}>
          {indicatorName ? (
            <Text style={styles.indicatorName} numberOfLines={1}>
              {indicatorName}
            </Text>
          ) : null}
          <Text style={styles.hint}>Scroll smoothly through price and indicator panes</Text>
        </View>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live</Text>
        </View>
      </View>
      <View style={styles.chartFrame}>
        <ChartWebView code={code} feedKey={feedKey} streamCode={streamCode} fill />
      </View>
      </View>
    </View>
  );
}
