"use client";

import { MATURITY_COLORS } from "@/lib/colors";
import type { TechniqueSummary } from "@/lib/types";

interface Props {
  technique: TechniqueSummary;
  tacticColor: string;
  x: number;
  y: number;
  subtechniqueCount?: number;
}

export default function TechniqueTooltip({
  technique,
  tacticColor,
  x,
  y,
  subtechniqueCount,
}: Props) {
  const maturityColor = technique.maturity
    ? MATURITY_COLORS[technique.maturity] || "#6b7280"
    : "#6b7280";

  // Keep tooltip within viewport
  const style: React.CSSProperties = {
    position: "fixed",
    left: x + 16,
    top: y - 8,
    zIndex: 100,
    pointerEvents: "none",
  };

  // If tooltip would go off right edge, flip to left side
  if (x > window.innerWidth - 320) {
    style.left = x - 280;
  }
  // If tooltip would go off bottom edge, flip up
  if (y > window.innerHeight - 160) {
    style.top = y - 120;
  }

  return (
    <div
      style={style}
      className="w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-xl shadow-black/50 p-3"
    >
      <div
        className="h-1 rounded-full mb-2"
        style={{ backgroundColor: tacticColor }}
      />
      <p className="text-xs font-mono text-gray-500 mb-1">{technique.id}</p>
      <p className="text-sm font-semibold text-gray-100 mb-2">
        {technique.name}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        {technique.maturity && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider"
            style={{
              backgroundColor: `${maturityColor}20`,
              color: maturityColor,
            }}
          >
            {technique.maturity}
          </span>
        )}
        {subtechniqueCount !== undefined && subtechniqueCount > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-400">
            {subtechniqueCount} subtechnique{subtechniqueCount !== 1 ? "s" : ""}
          </span>
        )}
        {technique.tactic_ids.length > 1 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">
            {technique.tactic_ids.length} tactics
          </span>
        )}
      </div>
      <p className="text-[10px] text-gray-500 mt-2">Click to view details</p>
    </div>
  );
}
