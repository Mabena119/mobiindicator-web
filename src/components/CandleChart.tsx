import Svg, { Line, Rect } from "react-native-svg";
import React from "react";

import type { ChartPayload, OhlcBar } from "../types";
import { colors } from "../theme";

const PLOT_COLORS = ["#06b6d4", "#eab308", "#a855f7", "#f97316", "#ec4899"];

function mt5Color(value?: number): string {
  if (value == null) return PLOT_COLORS[0];
  const r = value & 0xff;
  const g = (value >> 8) & 0xff;
  const b = (value >> 16) & 0xff;
  return `rgb(${r}, ${g}, ${b})`;
}

interface Props {
  width: number;
  height: number;
  payload: ChartPayload;
  maxBars?: number;
}

function visibleBars(bars: OhlcBar[], maxBars: number): OhlcBar[] {
  if (bars.length <= maxBars) return bars;
  return bars.slice(bars.length - maxBars);
}

export function CandleChart({ width, height, payload, maxBars = 120 }: Props) {
  const bars = visibleBars(payload.bars ?? [], maxBars);
  if (bars.length === 0 || width <= 0 || height <= 0) return null;

  const pad = { top: 12, right: 8, bottom: 24, left: 8 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  let min = Infinity;
  let max = -Infinity;
  for (const bar of bars) {
    min = Math.min(min, bar.low);
    max = Math.max(max, bar.high);
  }

  const mainWindow = payload.windows?.[0];
  const overlayPlots =
    mainWindow?.indicators?.flatMap((ind) => ind.plots ?? []).slice(0, 4) ?? [];

  for (const plot of overlayPlots) {
    for (const value of plot.values ?? []) {
      if (value == null || Number.isNaN(value)) continue;
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
  }

  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  const span = max - min || 1;
  const barW = chartW / bars.length;
  const bodyW = Math.max(2, barW * 0.65);

  const yFor = (price: number) => pad.top + chartH - ((price - min) / span) * chartH;
  const xFor = (index: number) => pad.left + index * barW + barW / 2;

  const plotLines = overlayPlots.map((plot, plotIdx) => {
    const values = plot.values ?? [];
    const start = Math.max(0, values.length - bars.length);
    const slice = values.slice(start);
    const points: Array<{ x: number; y: number }> = [];
    slice.forEach((value, i) => {
      if (value == null || Number.isNaN(value)) return;
      points.push({ x: xFor(i), y: yFor(value) });
    });
    if (points.length < 2) return null;
    const color = mt5Color(plot.color) || PLOT_COLORS[plotIdx % PLOT_COLORS.length];
    return points.slice(1).map((pt, i) => (
      <Line
        key={`plot-${plotIdx}-${i}`}
        x1={points[i].x}
        y1={points[i].y}
        x2={pt.x}
        y2={pt.y}
        stroke={color}
        strokeWidth={1.5}
      />
    ));
  });

  const candles = bars.map((bar, i) => {
    const up = bar.close >= bar.open;
    const color = up ? colors.up : colors.down;
    const openY = yFor(bar.open);
    const closeY = yFor(bar.close);
    const highY = yFor(bar.high);
    const lowY = yFor(bar.low);
    const top = Math.min(openY, closeY);
    const bodyH = Math.max(1, Math.abs(closeY - openY));
    const cx = xFor(i);

    return (
      <React.Fragment key={`bar-${bar.time}-${i}`}>
        <Line x1={cx} y1={highY} x2={cx} y2={lowY} stroke={color} strokeWidth={1} />
        <Rect
          x={cx - bodyW / 2}
          y={top}
          width={bodyW}
          height={bodyH}
          fill={color}
        />
      </React.Fragment>
    );
  });

  return (
    <Svg width={width} height={height}>
      {candles}
      {plotLines}
    </Svg>
  );
}
