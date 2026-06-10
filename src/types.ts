export type CodeType = "license";

export interface AppChart {
  feed_key: string;
  symbol: string;
  timeframe: string;
  timeframe_label: string;
  label: string;
  bars: number;
  chart_id?: number | null;
  updated_at?: string | null;
  live: boolean;
}

export interface ConnectResponse {
  ok: boolean;
  type: CodeType;
  name: string;
  indicator_name: string;
  feed_code: string;
  mentor_display_name: string;
  mentor_image: string;
  mentor_phone: string;
  category: string;
  plan: string;
  plan_label: string;
  expires_at: string | null;
  mt5_connected: boolean;
  chart_count: number;
  charts: AppChart[];
}

export interface SavedLicense {
  code: string;
  name: string;
  indicator_name: string;
  feed_code: string;
  mentor_display_name: string;
  mentor_image: string;
  mentor_phone: string;
  category: string;
  plan: string;
  plan_label: string;
  expires_at: string | null;
  mt5_connected: boolean;
  chart_count: number;
  saved_at: string;
  /** True when auto-added from the platform catalog (removed when mentor opts out). */
  from_catalog?: boolean;
  /** Super-admin platform default indicator bundled with the catalog. */
  is_platform_default?: boolean;
}

export interface AppCatalogKey {
  code: string;
  name: string;
  indicator_name: string;
  feed_code: string;
  mentor_display_name: string;
  mentor_image: string;
  mentor_phone: string;
  category: string;
  plan: string;
  plan_label: string;
  expires_at: string | null;
  is_platform_default?: boolean;
}

export interface AppCatalogResponse {
  ok: boolean;
  include_platform_defaults: boolean;
  keys: AppCatalogKey[];
}

export type MemberStatus = "active" | "payment_required" | "not_found";

export interface MemberStartResponse {
  ok: boolean;
  status: MemberStatus;
  email: string;
  paid: boolean;
  used: boolean;
  subscription_token: string;
  payment_url: string;
}

export interface OhlcBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartMeta {
  symbol: string;
  timeframe: string;
  indicatorName?: string;
  indicatorCode?: string;
  digits?: number;
  exportedAt?: string;
  bars?: number;
  chartId?: number;
}

export interface IndicatorPlot {
  name?: string;
  drawType?: number;
  color?: number;
  values?: (number | null)[];
}

export interface ChartWindow {
  index: number;
  indicators?: Array<{
    name?: string;
    shortName?: string;
    plots?: IndicatorPlot[];
  }>;
}

export interface ChartPayload {
  meta: ChartMeta;
  bars: OhlcBar[];
  windows?: ChartWindow[];
  objects?: unknown[];
}

export interface ChartDataResponse {
  ok: boolean;
  feedKey: string;
  data: ChartPayload;
}

export type WsMessage =
  | { type: "init"; code?: string; feedList?: AppChart[]; feeds?: Array<{ feedKey: string; data: ChartPayload }> }
  | { type: "update"; feedKey: string; data: ChartPayload }
  | { type: "feed_list"; feeds: AppChart[] }
  | { type: "feed_removed"; feedKey: string };
