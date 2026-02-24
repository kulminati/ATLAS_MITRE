"use client";

import { getTacticColor } from "@/lib/colors";
import { stripHtml } from "@/lib/utils";
import type { KillchainStepSummary } from "@/lib/types";

interface Props {
  steps: KillchainStepSummary[];
}

export default function KillchainStepList({ steps }: Props) {
  const sorted = [...steps].sort((a, b) => a.step_order - b.step_order);

  return (
    <div className="relative">
      {sorted.map((step, i) => {
        const color = step.tactic_id
          ? getTacticColor(step.tactic_id)
          : "#6b7280";
        const isLast = i === sorted.length - 1;

        return (
          <div key={step.step_order} className="flex gap-4 relative">
            {/* Timeline connector */}
            <div className="flex flex-col items-center shrink-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ backgroundColor: color }}
              >
                {step.step_order}
              </div>
              {!isLast && (
                <div
                  className="w-0.5 flex-1 min-h-[24px]"
                  style={{ backgroundColor: `${color}40` }}
                />
              )}
            </div>

            {/* Step content */}
            <div className={`pb-6 flex-1 ${isLast ? "" : ""}`}>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                {step.tactic_name && (
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-md inline-block mb-2"
                    style={{
                      backgroundColor: `${color}15`,
                      color,
                      border: `1px solid ${color}30`,
                    }}
                  >
                    {step.tactic_name}
                  </span>
                )}
                {step.technique_name && step.technique_id && (
                  <div className="mb-1">
                    <a
                      href={`/technique/${step.technique_id}`}
                      className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      {step.technique_name}
                    </a>
                    <span className="text-xs text-gray-500 ml-2 font-mono">
                      {step.technique_id}
                    </span>
                  </div>
                )}
                {step.description && (
                  <p className="text-sm text-gray-400 leading-relaxed mt-1">
                    {stripHtml(step.description)}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
