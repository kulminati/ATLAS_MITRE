"use client";

import { useState } from "react";
import {
  NVIDIA_STAGES,
  ATLAS_TACTIC_NAMES,
  ATLAS_TACTIC_DESCRIPTIONS,
  type NvidiaStage,
} from "@/lib/nvidia-killchain";
import { TACTIC_COLORS } from "@/lib/colors";

// Ordered ATLAS tactic IDs matching the kill chain order
const ATLAS_TACTIC_ORDER = [
  "AML.TA0002",
  "AML.TA0003",
  "AML.TA0004",
  "AML.TA0000",
  "AML.TA0005",
  "AML.TA0006",
  "AML.TA0012",
  "AML.TA0007",
  "AML.TA0013",
  "AML.TA0008",
  "AML.TA0015",
  "AML.TA0009",
  "AML.TA0001",
  "AML.TA0014",
  "AML.TA0010",
  "AML.TA0011",
];

function StageCard({
  stage,
  isSelected,
  onSelect,
}: {
  stage: NvidiaStage;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
        isSelected
          ? "border-opacity-60 bg-gray-800/80 shadow-lg"
          : "border-gray-800 bg-gray-900/50 hover:bg-gray-800/40 hover:border-gray-700"
      }`}
      style={{
        borderColor: isSelected ? stage.color : undefined,
        boxShadow: isSelected ? `0 0 20px ${stage.color}20` : undefined,
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ backgroundColor: stage.color }}
        >
          {stage.order}
        </div>
        <h3 className="font-semibold text-white text-base">{stage.name}</h3>
      </div>
      <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
        {stage.description}
      </p>
      {isSelected && (
        <div className="mt-3 pt-3 border-t border-gray-700/50">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Key Activities
          </p>
          <ul className="space-y-1">
            {stage.activities.map((activity, i) => (
              <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                <span className="text-gray-600 mt-0.5">-</span>
                {activity}
              </li>
            ))}
          </ul>
        </div>
      )}
    </button>
  );
}

function TacticCard({
  tacticId,
  isHighlighted,
  connectedStage,
}: {
  tacticId: string;
  isHighlighted: boolean;
  connectedStage: NvidiaStage | null;
}) {
  const color = TACTIC_COLORS[tacticId] || "#6b7280";
  const name = ATLAS_TACTIC_NAMES[tacticId] || tacticId;
  const description = ATLAS_TACTIC_DESCRIPTIONS[tacticId] || "";

  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-200 ${
        isHighlighted
          ? "border-opacity-60 bg-gray-800/80 shadow-lg scale-[1.02]"
          : "border-gray-800 bg-gray-900/50 opacity-40"
      }`}
      style={{
        borderColor: isHighlighted ? color : undefined,
        boxShadow: isHighlighted ? `0 0 20px ${color}20` : undefined,
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="font-semibold text-white text-sm truncate">{name}</h3>
          <span className="text-xs text-gray-500 font-mono shrink-0">
            {tacticId}
          </span>
        </div>
      </div>
      <p className="text-gray-400 text-xs leading-relaxed">{description}</p>
      {isHighlighted && connectedStage && (
        <div className="mt-2 flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${connectedStage.color}20`,
              color: connectedStage.color,
            }}
          >
            {connectedStage.name}
          </span>
        </div>
      )}
    </div>
  );
}

function ConnectionLines({
  selectedStage,
}: {
  selectedStage: NvidiaStage | null;
}) {
  if (!selectedStage) return null;

  return (
    <div className="flex flex-col items-center justify-center gap-1 py-4">
      {selectedStage.atlasTacticIds.map((tacticId, i) => (
        <div
          key={tacticId}
          className="flex items-center gap-2 animate-fade-in"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div
            className="w-16 h-0.5 rounded-full"
            style={{ backgroundColor: selectedStage.color }}
          />
          <svg className="w-3 h-3" style={{ color: selectedStage.color }} viewBox="0 0 12 12">
            <path d="M2 6h8M7 3l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div
            className="w-16 h-0.5 rounded-full"
            style={{ backgroundColor: TACTIC_COLORS[tacticId] || "#6b7280" }}
          />
        </div>
      ))}
    </div>
  );
}

function MappingMatrix() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left p-2 text-gray-500 font-medium border-b border-gray-800 sticky left-0 bg-gray-950 z-10">
              ATLAS Tactic
            </th>
            {NVIDIA_STAGES.map((stage) => (
              <th
                key={stage.id}
                className="p-2 text-center font-medium border-b border-gray-800 min-w-[80px]"
                style={{ color: stage.color }}
              >
                {stage.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ATLAS_TACTIC_ORDER.map((tacticId) => {
            const tacticColor = TACTIC_COLORS[tacticId] || "#6b7280";
            return (
              <tr key={tacticId} className="border-b border-gray-800/50">
                <td className="p-2 sticky left-0 bg-gray-950 z-10">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: tacticColor }}
                    />
                    <span className="text-gray-300 whitespace-nowrap">
                      {ATLAS_TACTIC_NAMES[tacticId]}
                    </span>
                  </div>
                </td>
                {NVIDIA_STAGES.map((stage) => {
                  const isMapped = stage.atlasTacticIds.includes(tacticId);
                  return (
                    <td key={stage.id} className="p-2 text-center">
                      {isMapped ? (
                        <div
                          className="w-5 h-5 rounded-md mx-auto flex items-center justify-center"
                          style={{ backgroundColor: `${stage.color}30` }}
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-sm"
                            style={{ backgroundColor: stage.color }}
                          />
                        </div>
                      ) : (
                        <div className="w-5 h-5 mx-auto" />
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ComparePage() {
  const [selectedStageId, setSelectedStageId] = useState<string | null>(
    "recon"
  );
  const [view, setView] = useState<"interactive" | "matrix">("interactive");

  const selectedStage =
    NVIDIA_STAGES.find((s) => s.id === selectedStageId) || null;

  const highlightedTacticIds = new Set(
    selectedStage?.atlasTacticIds || []
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Framework Comparison
        </h1>
        <p className="text-gray-400 max-w-3xl">
          Compare the{" "}
          <span className="text-indigo-400 font-medium">
            NVIDIA AI Kill Chain
          </span>{" "}
          framework against{" "}
          <span className="text-purple-400 font-medium">MITRE ATLAS</span>{" "}
          tactics. The AI Kill Chain models attack progression through five
          stages plus an iterate/pivot loop, while ATLAS defines 16 adversarial
          tactics specific to AI/ML systems.
        </p>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setView("interactive")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === "interactive"
              ? "bg-gray-800 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-800/50"
          }`}
        >
          Interactive View
        </button>
        <button
          onClick={() => setView("matrix")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === "matrix"
              ? "bg-gray-800 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-800/50"
          }`}
        >
          Mapping Matrix
        </button>
      </div>

      {view === "interactive" ? (
        /* Interactive side-by-side view */
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
          {/* NVIDIA Kill Chain (left) */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-700 rounded-md" />
              <h2 className="text-lg font-semibold text-white">
                NVIDIA AI Kill Chain
              </h2>
            </div>
            <div className="space-y-3">
              {NVIDIA_STAGES.map((stage) => (
                <StageCard
                  key={stage.id}
                  stage={stage}
                  isSelected={selectedStageId === stage.id}
                  onSelect={() =>
                    setSelectedStageId(
                      selectedStageId === stage.id ? null : stage.id
                    )
                  }
                />
              ))}
            </div>
          </div>

          {/* Connection indicator (center) */}
          <div className="flex flex-col items-center pt-12 min-w-[120px]">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-4 font-medium">
              Maps to
            </div>
            <ConnectionLines selectedStage={selectedStage} />
            {selectedStage && (
              <p className="text-xs text-gray-500 mt-4 text-center max-w-[120px]">
                {selectedStage.atlasTacticIds.length} ATLAS tactic
                {selectedStage.atlasTacticIds.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* ATLAS Tactics (right) */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md" />
              <h2 className="text-lg font-semibold text-white">
                MITRE ATLAS Tactics
              </h2>
            </div>
            <div className="space-y-3">
              {ATLAS_TACTIC_ORDER.map((tacticId) => {
                const isHighlighted =
                  selectedStage === null || highlightedTacticIds.has(tacticId);
                const connectedStage = selectedStage?.atlasTacticIds.includes(tacticId)
                  ? selectedStage
                  : null;

                return (
                  <TacticCard
                    key={tacticId}
                    tacticId={tacticId}
                    isHighlighted={isHighlighted}
                    connectedStage={connectedStage}
                  />
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Mapping matrix view */
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Mapping Matrix
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Each filled cell indicates that the NVIDIA AI Kill Chain stage maps
            to the corresponding MITRE ATLAS tactic.
          </p>
          <MappingMatrix />
        </div>
      )}

      {/* Framework comparison summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-700 rounded-md" />
            <h3 className="font-semibold text-white">
              NVIDIA AI Kill Chain
            </h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">-</span>
              Five sequential stages plus an iterate/pivot loop
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">-</span>
              Focused on AI-native attack patterns (prompt injection, data
              poisoning)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">-</span>
              Designed for agentic AI and LLM-powered applications
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">-</span>
              Models the attack as a linear progression with feedback loops
            </li>
          </ul>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md" />
            <h3 className="font-semibold text-white">MITRE ATLAS</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-1">-</span>
              16 tactics covering the full adversarial ML lifecycle
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-1">-</span>
              Inherits 13 tactics from MITRE ATT&CK with AI-specific additions
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-1">-</span>
              Comprehensive technique taxonomy with maturity levels
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 mt-1">-</span>
              Includes real-world case studies and mitigation strategies
            </li>
          </ul>
        </div>
      </div>

      {/* Attribution */}
      <div className="text-center text-xs text-gray-600 pb-4">
        NVIDIA AI Kill Chain framework reference:{" "}
        <a
          href="https://developer.nvidia.com/blog/modeling-attacks-on-ai-powered-apps-with-the-ai-kill-chain-framework/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-gray-400 underline"
        >
          NVIDIA Developer Blog
        </a>
        {" | "}
        MITRE ATLAS:{" "}
        <a
          href="https://atlas.mitre.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-gray-400 underline"
        >
          atlas.mitre.org
        </a>
      </div>
    </div>
  );
}
