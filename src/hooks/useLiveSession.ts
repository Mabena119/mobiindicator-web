import { useCallback, useEffect, useRef, useState } from "react";

import { refreshCharts } from "../api";
import { filterChartsForKey } from "../chartFilter";
import { WS_BASE } from "../config";
import { chartFromPayload, mergeChartLists, normalizeChart } from "../normalize";
import { sanitizeChartPayload } from "../sanitize";
import type { AppChart, ChartPayload, WsMessage } from "../types";

interface LiveSessionState {
  charts: AppChart[];
  payloads: Record<string, ChartPayload>;
  feedCatalog: AppChart[];
  connected: boolean;
  error: string | null;
}

const EMPTY_STATE: LiveSessionState = {
  charts: [],
  payloads: {},
  feedCatalog: [],
  connected: false,
  error: null,
};

const FEED_POLL_MS = 8000;

function deriveCharts(
  feedCatalog: AppChart[],
  payloads: Record<string, ChartPayload>,
  filter: (charts: AppChart[]) => AppChart[],
): AppChart[] {
  const fromPayloads = Object.entries(payloads).map(([feedKey, data]) =>
    chartFromPayload(feedKey, data),
  );
  return filter(mergeChartLists(feedCatalog, fromPayloads));
}

export function useLiveSession(
  code: string | null,
  indicatorName = "",
  feedCode: string | null = null,
) {
  const [state, setState] = useState<LiveSessionState>(EMPTY_STATE);
  const wsRef = useRef<WebSocket | null>(null);

  const filterCharts = useCallback(
    (charts: AppChart[]) => (code ? filterChartsForKey(charts, code, feedCode) : charts),
    [code, feedCode],
  );

  const payloadAllowed = useCallback(
    (feedKey: string, data: ChartPayload) => {
      if (!code) return true;
      return chartBelongsToPayload(feedKey, data, code, feedCode);
    },
    [code, feedCode],
  );

  const applyMessage = useCallback(
    (msg: WsMessage) => {
      const clean = (data: ChartPayload) => sanitizeChartPayload(data, indicatorName);
      setState((prev) => {
        if (msg.type === "init") {
          const payloads = { ...prev.payloads };
          for (const item of msg.feeds ?? []) {
            if (payloadAllowed(item.feedKey, item.data)) {
              payloads[item.feedKey] = clean(item.data);
            }
          }
          const feedCatalog = (msg.feedList ?? []).map((c) =>
            normalizeChart(c as unknown as Record<string, unknown>),
          );
          return {
            feedCatalog,
            charts: deriveCharts(feedCatalog, payloads, filterCharts),
            payloads,
            connected: true,
            error: null,
          };
        }
        if (msg.type === "feed_list") {
          const feedCatalog = msg.feeds.map((c) =>
            normalizeChart(c as unknown as Record<string, unknown>),
          );
          return {
            ...prev,
            feedCatalog,
            charts: deriveCharts(feedCatalog, prev.payloads, filterCharts),
            connected: true,
            error: null,
          };
        }
        if (msg.type === "update") {
          if (!payloadAllowed(msg.feedKey, msg.data)) {
            const nextPayloads = { ...prev.payloads };
            delete nextPayloads[msg.feedKey];
            const feedCatalog = prev.feedCatalog.filter((c) => c.feed_key !== msg.feedKey);
            return {
              ...prev,
              feedCatalog,
              charts: deriveCharts(feedCatalog, nextPayloads, filterCharts),
              payloads: nextPayloads,
              connected: true,
              error: null,
            };
          }
          const payloads = { ...prev.payloads, [msg.feedKey]: clean(msg.data) };
          return {
            ...prev,
            payloads,
            charts: deriveCharts(prev.feedCatalog, payloads, filterCharts),
            connected: true,
            error: null,
          };
        }
        if (msg.type === "feed_removed") {
          const nextPayloads = { ...prev.payloads };
          delete nextPayloads[msg.feedKey];
          const feedCatalog = prev.feedCatalog.filter((c) => c.feed_key !== msg.feedKey);
          return {
            ...prev,
            feedCatalog,
            charts: deriveCharts(feedCatalog, nextPayloads, filterCharts),
            payloads: nextPayloads,
          };
        }
        return prev;
      });
    },
    [filterCharts, indicatorName, payloadAllowed],
  );

  const syncFeedCatalog = useCallback(
    (rawCharts: AppChart[]) => {
      setState((prev) => {
        const feedCatalog = filterCharts(rawCharts);
        const allowedKeys = new Set(feedCatalog.map((c) => c.feed_key));
        const payloads = Object.fromEntries(
          Object.entries(prev.payloads).filter(([key]) => allowedKeys.has(key)),
        );
        return {
          ...prev,
          feedCatalog,
          payloads,
          charts: deriveCharts(feedCatalog, payloads, filterCharts),
          connected: prev.connected,
        };
      });
    },
    [filterCharts],
  );

  useEffect(() => {
    setState(EMPTY_STATE);
    if (!code) return;

    const url = `${WS_BASE}?code=${encodeURIComponent(code)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setState((prev) => ({ ...prev, connected: true, error: null }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(String(event.data)) as WsMessage;
        applyMessage(msg);
      } catch {
        /* ignore malformed */
      }
    };

    ws.onerror = () => {
      setState((prev) => ({ ...prev, connected: false, error: "Live connection error" }));
    };

    ws.onclose = () => {
      setState((prev) => ({ ...prev, connected: false }));
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [code, feedCode, applyMessage]);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await refreshCharts(code);
        if (cancelled) return;
        syncFeedCatalog(res.charts);
      } catch {
        /* keep websocket state on poll failure */
      }
    };

    void poll();
    const id = setInterval(() => void poll(), FEED_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [code, syncFeedCatalog]);

  return state;
}

function chartBelongsToPayload(
  feedKey: string,
  data: ChartPayload,
  mkCode: string,
  feedCode?: string | null,
): boolean {
  const allowed = new Set<string>();
  const mk = mkCode.trim().toUpperCase();
  if (mk) allowed.add(mk);
  const mi = feedCode?.trim().toUpperCase();
  if (mi) allowed.add(mi);
  if (allowed.size === 0) return true;

  const metaCode = (data.meta?.indicatorCode ?? "").trim().toUpperCase();
  if (metaCode && allowed.has(metaCode)) return true;

  const prefix = feedKey.split(":")[0]?.toUpperCase();
  return prefix ? allowed.has(prefix) : false;
}
