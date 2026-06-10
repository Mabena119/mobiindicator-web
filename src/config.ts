import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra as
  | { apiBase?: string; wsBase?: string; chartBase?: string }
  | undefined;

/** Production API. Override with EXPO_PUBLIC_API_BASE for local dev. */
export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ?? extra?.apiBase ?? "https://mobiindicator.com/live-api";

export const WS_BASE =
  process.env.EXPO_PUBLIC_WS_BASE ??
  extra?.wsBase ??
  API_BASE.replace(/^http/, "ws").replace(/\/$/, "") + "/ws";

export const CHART_BASE =
  process.env.EXPO_PUBLIC_CHART_BASE ??
  extra?.chartBase ??
  API_BASE.replace(/\/live-api\/?$/, "") + "/chart";

export const PLATFORM_BASE = `${API_BASE}/platform/app`;
