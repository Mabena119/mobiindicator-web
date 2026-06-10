import type { ChartPayload } from "./types";

/** Strip internal codes from MT5 payloads before showing in the app. */
export function sanitizeChartPayload(
  payload: ChartPayload,
  indicatorName = "",
): ChartPayload {
  const meta: ChartPayload["meta"] & { indicatorCode?: string } = { ...payload.meta };
  delete meta.indicatorCode;
  const name = indicatorName || meta.indicatorName;
  if (name) meta.indicatorName = name;
  return { ...payload, meta };
}
