import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

import { refreshCharts } from "../src/api";
import { filterChartsForKey } from "../src/chartFilter";
import { ChartListItem } from "../src/components/ChartListItem";
import { MentorBadge } from "../src/components/MentorBadge";
import { useAppTheme } from "../src/ThemeContext";
import { useLiveSession } from "../src/hooks/useLiveSession";
import { removeLicenseIfInvalid } from "../src/licenseCleanup";
import { getSavedLicenses, updateLicense } from "../src/storage";
import { useChartsStyles } from "../src/styles/useChartsStyles";
import type { AppChart, ConnectResponse } from "../src/types";

function formatExpiry(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ChartsScreen() {
  const { colors } = useAppTheme();
  const styles = useChartsStyles();
  const params = useLocalSearchParams<{ code?: string }>();
  const code = (params.code ?? "").toString().toUpperCase();
  const navigation = useNavigation();

  const [session, setSession] = useState<ConnectResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const live = useLiveSession(code || null, session?.indicator_name ?? "", session?.feed_code ?? null);

  const load = useCallback(async () => {
    if (!code) return;
    setError(null);
    try {
      const res = await refreshCharts(code);
      setSession(res);
      await updateLicense(code, res);
    } catch (ex) {
      if (await removeLicenseIfInvalid(code, ex)) {
        router.replace("/home");
        return;
      }
      setError(ex instanceof Error ? ex.message : "Failed to load charts");
    }
  }, [code]);

  useEffect(() => {
    if (!code) {
      router.replace("/home");
      return;
    }
    setSession(null);
    setError(null);
    getSavedLicenses().then((licenses) => {
      if (!licenses.some((l) => l.code === code)) {
        router.replace("/home");
      }
    });
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [code, load]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => router.replace("/home")}>
          <Text style={styles.headerAction}>Mentor indicators</Text>
        </Pressable>
      ),
    });
  }, [navigation, styles.headerAction]);

  const charts = useMemo(() => {
    if (live.connected) {
      return live.charts;
    }
    return filterChartsForKey(session?.charts ?? [], code, session?.feed_code ?? null);
  }, [live.connected, live.charts, session?.charts, session?.feed_code, code]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (loading && !session) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.bannerTitle}>
            {session?.indicator_name || session?.name || "Connected"}
          </Text>
          <Text style={styles.bannerMeta}>
            {session?.plan_label ?? "—"} plan
            {session?.expires_at ? ` · Expires ${formatExpiry(session.expires_at)}` : ""}
            {" · "}
            {session?.mt5_connected ? "MT5 connected" : "Waiting for MT5"}
            {" · "}
            {live.connected ? "Live" : "Connecting…"}
          </Text>
          <MentorBadge
            layout="card"
            size={72}
            displayName={session?.mentor_display_name}
            imagePath={session?.mentor_image}
            phone={session?.mentor_phone}
            cacheKey={session?.mentor_image || code}
          />
        </View>
        <View style={styles.countPill}>
          <Text style={styles.countText}>{charts.length}</Text>
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={charts}
        keyExtractor={(item) => item.feed_key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={charts.length === 0 ? styles.emptyList : styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No live charts yet</Text>
            <Text style={styles.emptyBody}>
              Stream charts from MetaTrader with your license key. Charts appear here
              within a few seconds once the feed is active.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ChartListItem
            title={item.label}
            subtitle={`${item.bars} bars · ${item.timeframe_label}`}
            live={item.live}
            onPress={() =>
              router.push({
                pathname: "/chart/[feedKey]",
                params: {
                  feedKey: item.feed_key,
                  code,
                  label: item.label,
                  indicatorName: session?.indicator_name ?? "",
                  feedCode: session?.feed_code ?? "",
                },
              })
            }
            right={<Text style={styles.chevron}>›</Text>}
          />
        )}
      />
    </View>
  );
}

