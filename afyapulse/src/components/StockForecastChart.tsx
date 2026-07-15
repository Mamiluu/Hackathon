"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { StockItem } from "@/lib/data/types";
import { cn, formatCompact } from "@/lib/utils";
import { StatusPill } from "./StatusPill";

interface ChartRow {
  date: string;
  actual: number | null;
  projected: number | null;
}

interface ApiResponse {
  history: { date: string; quantityOnHand: number; dailyConsumption: number }[];
  forecast: { date: string; projectedQuantityOnHand: number }[];
  daysToStockout: number | null;
  method: string;
  confidence: "low" | "medium" | "high";
}

function formatDateShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; dataKey: string }[]; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  const actual = payload.find((p) => p.dataKey === "actual")?.value;
  const projected = payload.find((p) => p.dataKey === "projected")?.value;
  const value = actual ?? projected;
  if (value === undefined || value === null) return null;

  return (
    <div className="rounded-lg border border-hairline bg-surface-raised px-3 py-2 text-xs shadow-lg">
      <div className="mb-1 text-ink-muted">{label ? formatDateShort(label) : ""}</div>
      <div className="flex items-center gap-1.5">
        <span className="inline-block h-0.5 w-3 bg-series-1" aria-hidden />
        <span className="font-semibold tabular text-ink-primary">{formatCompact(value)}</span>
        <span className="text-ink-secondary">{actual !== undefined ? "on hand" : "projected"}</span>
      </div>
    </div>
  );
}

export function StockForecastChart({ facilityId, items, defaultItemId }: { facilityId: string; items: StockItem[]; defaultItemId: string }) {
  const [itemId, setItemId] = useState(defaultItemId);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/forecast?facilityId=${facilityId}&itemId=${itemId}`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      })
      .catch(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [facilityId, itemId]);

  const rows: ChartRow[] = useMemo(() => {
    if (!data) return [];
    const recentHistory = data.history.slice(-30);
    const historyRows: ChartRow[] = recentHistory.map((h) => ({
      date: h.date,
      actual: h.quantityOnHand,
      projected: null,
    }));
    const boundary = recentHistory[recentHistory.length - 1];
    const forecastRows: ChartRow[] = data.forecast.map((f) => ({
      date: f.date,
      actual: null,
      projected: f.projectedQuantityOnHand,
    }));
    if (boundary) {
      // Connect the two segments visually at the boundary point.
      forecastRows.unshift({ date: boundary.date, actual: null, projected: boundary.quantityOnHand });
    }
    return [...historyRows, ...forecastRows];
  }, [data]);

  const todayDate = data?.history[data.history.length - 1]?.date;
  const activeItem = items.find((i) => i.id === itemId);

  const stockoutSeverity =
    data?.daysToStockout === null ? "good" : data && data.daysToStockout! < 3 ? "critical" : data && data.daysToStockout! < 7 ? "warning" : "good";

  return (
    <div className="rounded-xl border border-hairline bg-surface p-4">
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setItemId(item.id)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              item.id === itemId
                ? "bg-series-1 text-white"
                : "bg-surface-raised text-ink-secondary hover:text-ink-primary"
            )}
          >
            {item.name}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-ink-primary">{activeItem?.name} — stock trajectory</div>
          <div className="text-xs text-ink-muted">
            Solid = recorded stock on hand. Lighter continuation = AI-projected trajectory.
          </div>
        </div>
        {data && (
          <div className="flex items-center gap-2">
            {data.daysToStockout !== null ? (
              <StatusPill severity={stockoutSeverity} text={`${data.daysToStockout} days to stockout`} />
            ) : (
              <StatusPill severity="good" text="No stockout projected in 21 days" />
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-sm text-ink-muted">Loading forecast…</div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={rows} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="0" stroke="var(--gridline)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDateShort}
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                axisLine={{ stroke: "var(--baseline)" }}
                tickLine={false}
                minTickGap={32}
              />
              <YAxis
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatCompact(v)}
                width={40}
              />
              {todayDate && (
                <ReferenceLine
                  x={todayDate}
                  stroke="var(--baseline)"
                  strokeWidth={1}
                  label={{ value: "Today", position: "insideTopRight", fill: "var(--text-muted)", fontSize: 11 }}
                />
              )}
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="var(--series-1)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: "var(--surface)", strokeWidth: 2 }}
                connectNulls={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="projected"
                stroke="var(--series-1)"
                strokeOpacity={0.45}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: "var(--surface)", strokeWidth: 2 }}
                connectNulls
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {data && (
        <div className="mt-2 text-xs text-ink-muted">
          Forecast method: Holt&apos;s linear trend exponential smoothing · {data.confidence} confidence
        </div>
      )}
    </div>
  );
}
