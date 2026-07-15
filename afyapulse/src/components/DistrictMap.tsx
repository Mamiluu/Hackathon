"use client";

import { useState } from "react";
import { t, type Lang } from "@/lib/i18n/translations";

export interface MapFacility {
  id: string;
  name: string;
  lat: number;
  lng: number;
  healthScore: number;
}

export interface MapRoute {
  sourceId: string;
  destId: string;
  urgency: "critical" | "warning" | "info";
  quantity: number;
  itemName: string;
  unit: string;
}

const WIDTH = 480;
const HEIGHT = 320;
const PADDING = 44;

function bandFill(score: number): string {
  if (score >= 80) return "fill-status-good";
  if (score >= 60) return "fill-status-warning";
  if (score >= 40) return "fill-status-serious";
  return "fill-status-critical";
}

function bandStroke(score: number): string {
  if (score >= 80) return "stroke-status-good";
  if (score >= 60) return "stroke-status-warning";
  if (score >= 40) return "stroke-status-serious";
  return "stroke-status-critical";
}

const URGENCY_STROKE: Record<MapRoute["urgency"], string> = {
  critical: "stroke-status-critical",
  warning: "stroke-status-warning",
  info: "stroke-series-1",
};

function project(lat: number, lng: number, bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) {
  const latRange = bounds.maxLat - bounds.minLat || 1;
  const lngRange = bounds.maxLng - bounds.minLng || 1;
  const x = PADDING + ((lng - bounds.minLng) / lngRange) * (WIDTH - 2 * PADDING);
  const y = PADDING + ((bounds.maxLat - lat) / latRange) * (HEIGHT - 2 * PADDING);
  return { x, y };
}

export function DistrictMap({ facilities, routes = [], lang = "en" }: { facilities: MapFacility[]; routes?: MapRoute[]; lang?: Lang }) {
  const [hovered, setHovered] = useState<string | null>(null);

  const bounds = {
    minLat: Math.min(...facilities.map((f) => f.lat)),
    maxLat: Math.max(...facilities.map((f) => f.lat)),
    minLng: Math.min(...facilities.map((f) => f.lng)),
    maxLng: Math.max(...facilities.map((f) => f.lng)),
  };

  const points = new Map(facilities.map((f) => [f.id, { ...project(f.lat, f.lng, bounds), facility: f }]));
  const hoveredFacility = hovered ? points.get(hovered)?.facility : null;

  return (
    <div className="relative rounded-xl border border-hairline bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-ink-primary">{t("districtMap", lang)}</div>
        <div className="flex items-center gap-3 text-[10px] text-ink-secondary">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-status-good" aria-hidden /> 80+
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-status-warning" aria-hidden /> 60+
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-status-serious" aria-hidden /> 40+
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-status-critical" aria-hidden /> &lt;40
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Map of Kilifi County health facilities">
        <defs>
          {(["critical", "warning", "info"] as const).map((u) => (
            <marker key={u} id={`arrow-${u}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className={URGENCY_STROKE[u].replace("stroke-", "fill-")} />
            </marker>
          ))}
        </defs>

        {routes.map((route, i) => {
          const from = points.get(route.sourceId);
          const to = points.get(route.destId);
          if (!from || !to) return null;
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;
          return (
            <g key={i}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                strokeWidth={2}
                strokeDasharray="0"
                className={URGENCY_STROKE[route.urgency]}
                markerEnd={`url(#arrow-${route.urgency})`}
                opacity={0.75}
              />
              <rect x={midX - 20} y={midY - 9} width={40} height={14} rx={4} className="fill-surface-raised" opacity={0.9} />
              <text x={midX} y={midY + 1.5} textAnchor="middle" className="fill-ink-secondary" style={{ fontSize: 9 }}>
                {route.quantity}
              </text>
            </g>
          );
        })}

        {facilities.map((f) => {
          const p = points.get(f.id)!;
          const isHovered = hovered === f.id;
          return (
            <g
              key={f.id}
              onMouseEnter={() => setHovered(f.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              <circle cx={p.x} cy={p.y} r={24} fill="transparent" />
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 8 : 6.5}
                className={`${bandFill(f.healthScore)} ${bandStroke(f.healthScore)}`}
                stroke="var(--surface)"
                strokeWidth={2}
                style={{ transition: "r 120ms ease" }}
              />
              <text
                x={p.x}
                y={p.y - 12}
                textAnchor="middle"
                className={isHovered ? "fill-ink-primary" : "fill-ink-muted"}
                style={{ fontSize: 9, fontWeight: isHovered ? 600 : 400 }}
              >
                {f.name.split(" ")[0]}
              </text>
            </g>
          );
        })}
      </svg>

      {hoveredFacility && (
        <div className="pointer-events-none absolute left-4 top-12 rounded-lg border border-hairline bg-surface-raised px-3 py-2 text-xs shadow-lg">
          <div className="font-semibold text-ink-primary">{hoveredFacility.name}</div>
          <div className="text-ink-secondary">
            {t("statHealthScore", lang)}: <span className="tabular font-medium text-ink-primary">{hoveredFacility.healthScore}</span>
          </div>
        </div>
      )}
    </div>
  );
}
