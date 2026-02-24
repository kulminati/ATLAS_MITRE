"use client";

import { useMemo, useState } from "react";
import type { KillchainSummary } from "@/lib/types";

interface Props {
  killchains: KillchainSummary[];
  categories: string[];
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export default function KillchainGallery({ killchains, categories }: Props) {
  const [activeSeverity, setActiveSeverity] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...killchains];
    if (activeSeverity) {
      result = result.filter((k) => k.severity === activeSeverity);
    }
    if (activeCategory) {
      result = result.filter((k) => k.attack_category === activeCategory);
    }
    // Sort: severity (critical first), then step_count (most first)
    result.sort((a, b) => {
      const sa = SEVERITY_ORDER[a.severity || ""] ?? 99;
      const sb = SEVERITY_ORDER[b.severity || ""] ?? 99;
      if (sa !== sb) return sa - sb;
      return b.step_count - a.step_count;
    });
    return result;
  }, [killchains, activeSeverity, activeCategory]);

  const severities = ["critical", "high", "medium", "low"];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-50 mb-2">
          Attack Killchains
        </h1>
        <p className="text-gray-400 text-sm">
          Visualize end-to-end attack sequences mapped to ATLAS tactics and
          techniques.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
        {/* Severity filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
            Severity
          </span>
          {severities.map((sev) => {
            const color = SEVERITY_COLORS[sev];
            const isActive = activeSeverity === sev;
            return (
              <button
                key={sev}
                onClick={() =>
                  setActiveSeverity(isActive ? null : sev)
                }
                className="text-xs px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer"
                style={{
                  backgroundColor: isActive ? `${color}25` : "transparent",
                  color: isActive ? color : "#6b7280",
                  border: `1px solid ${isActive ? `${color}50` : "#374151"}`,
                }}
              >
                {sev}
              </button>
            );
          })}
        </div>

        {/* Category dropdown */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
              Category
            </span>
            <select
              value={activeCategory || ""}
              onChange={(e) =>
                setActiveCategory(e.target.value || null)
              }
              className="text-xs bg-gray-800 border border-gray-700 rounded-md px-2.5 py-1 text-gray-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Count */}
        <span className="text-xs text-gray-500 ml-auto">
          {filtered.length} killchain{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No killchains match the current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((kc) => {
            const sevColor = SEVERITY_COLORS[kc.severity || ""] || "#6b7280";
            return (
              <a
                key={kc.id}
                href={`/killchain/${kc.id}`}
                className="group block bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-gray-700 hover:bg-gray-900/80 transition-all"
              >
                {/* Top row: name */}
                <h3 className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors mb-3 line-clamp-2">
                  {kc.name}
                </h3>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {kc.severity && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: `${sevColor}20`,
                        color: sevColor,
                      }}
                    >
                      {kc.severity}
                    </span>
                  )}
                  {kc.attack_category && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 font-medium">
                      {kc.attack_category}
                    </span>
                  )}
                  {kc.year && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                      {kc.year}
                    </span>
                  )}
                </div>

                {/* Bottom row: metadata */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {kc.step_count} step{kc.step_count !== 1 ? "s" : ""}
                  </span>
                  {kc.source_case_study_id && (
                    <span className="font-mono">{kc.source_case_study_id}</span>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
