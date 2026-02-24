"use client";

import { MATURITY_COLORS } from "@/lib/colors";

interface Props {
  version: string;
  tacticCount: number;
  techniqueCount: number;
  activeMaturity: string | null;
  onMaturityFilter: (maturity: string | null) => void;
}

const MATURITY_LEVELS = [
  { key: "feasible", label: "Feasible" },
  { key: "demonstrated", label: "Demonstrated" },
  { key: "realized", label: "Realized" },
];

export default function MatrixLegend({
  version,
  tacticCount,
  techniqueCount,
  activeMaturity,
  onMaturityFilter,
}: Props) {
  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
      <div>
        <h2 className="text-2xl font-bold">ATLAS Matrix</h2>
        <p className="text-gray-400 text-sm mt-1">
          MITRE ATLAS v{version} &mdash; {tacticCount} tactics, {techniqueCount}{" "}
          techniques
        </p>
      </div>
      <div className="flex items-center gap-1 bg-gray-900/50 border border-gray-800 rounded-lg p-1">
        <button
          onClick={() => onMaturityFilter(null)}
          className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
            activeMaturity === null
              ? "bg-gray-700 text-gray-100"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          All
        </button>
        {MATURITY_LEVELS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() =>
              onMaturityFilter(activeMaturity === key ? null : key)
            }
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-colors ${
              activeMaturity === key
                ? "bg-gray-700 text-gray-100"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: MATURITY_COLORS[key] }}
            />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
