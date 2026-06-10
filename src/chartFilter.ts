import type { AppChart } from "./types";

export function allowedFeedCodes(mkCode: string, feedCode?: string | null): Set<string> {
  const codes = new Set<string>();
  const mk = mkCode.trim().toUpperCase();
  if (mk) codes.add(mk);
  const mi = feedCode?.trim().toUpperCase();
  if (mi) codes.add(mi);
  return codes;
}

export function chartBelongsToKey(
  chart: AppChart,
  mkCode: string,
  feedCode?: string | null,
): boolean {
  const allowed = allowedFeedCodes(mkCode, feedCode);
  if (allowed.size === 0) return true;
  const prefix = chart.feed_key.split(":")[0]?.toUpperCase();
  return prefix ? allowed.has(prefix) : false;
}

export function filterChartsForKey(
  charts: AppChart[],
  mkCode: string,
  feedCode?: string | null,
): AppChart[] {
  return charts.filter((chart) => chartBelongsToKey(chart, mkCode, feedCode));
}
