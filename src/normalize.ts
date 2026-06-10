import type { AppChart } from "./types";

/** Server live-feed uses camelCase; platform API uses snake_case. */
export function normalizeChart(raw: Record<string, unknown>): AppChart {
  const tf = String(raw.timeframe ?? "?");
  const tfLabel = String(
    raw.timeframe_label ?? raw.timeframeLabel ?? (tf.startsWith("PERIOD_") ? tf.slice(7) : tf),
  );
  const symbol = String(raw.symbol ?? "?");
  return {
    feed_key: String(raw.feed_key ?? raw.feedKey ?? ""),
    symbol,
    timeframe: tf,
    timeframe_label: tfLabel,
    label: String(raw.label ?? `${symbol} · ${tfLabel}`),
    bars: Number(raw.bars ?? 0),
    chart_id: (raw.chart_id ?? raw.chartId ?? null) as number | null,
    updated_at: (raw.updated_at ?? raw.updatedAt ?? null) as string | null,
    live: raw.live !== false,
  };
}

/** Build a list row from a live chart payload (used when feed_list lags behind updates). */
export function chartFromPayload(feedKey: string, data: { meta?: Record<string, unknown>; bars?: unknown[] }): AppChart {
  const meta = data.meta ?? {};
  const tf = String(meta.timeframe ?? "?");
  const symbol = String(meta.symbol ?? "?");
  const tfLabel = tf.startsWith("PERIOD_") ? tf.slice(7) : tf;
  return normalizeChart({
    feedKey,
    symbol,
    timeframe: tf,
    timeframe_label: tfLabel,
    label: `${symbol} · ${tfLabel}`,
    bars: Number(meta.bars ?? data.bars?.length ?? 0),
    chartId: meta.chartId,
    updatedAt: meta.exportedAt,
    live: true,
  });
}

export function mergeChartLists(...lists: AppChart[][]): AppChart[] {
  const map = new Map<string, AppChart>();
  for (const list of lists) {
    for (const chart of list) {
      if (!chart.feed_key) continue;
      map.set(chart.feed_key, chart);
    }
  }
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
}
