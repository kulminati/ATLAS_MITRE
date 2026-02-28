"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { TechniqueSummary, TacticDetail } from "@/lib/types";
import {
  AI_SYSTEM_TYPES,
  DEPLOYMENT_MODELS,
  ACCESS_LEVELS,
  DEPLOYMENT_RISKS,
  getApplicableTechniqueIds,
  computeRiskLevel,
} from "@/lib/threat-model-data";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Maturity badge colors ───────────────────────────────────────────

const MATURITY_CLASSES: Record<string, string> = {
  realized: "bg-red-500/20 text-red-400 border border-red-500/30",
  demonstrated: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  feasible: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
};

const RISK_COLORS: Record<string, string> = {
  low: "text-green-400 bg-green-500/10 border-green-500/30",
  medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  high: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  critical: "text-red-400 bg-red-500/10 border-red-500/30",
};

const RISK_BAR_COLORS: Record<string, string> = {
  low: "bg-green-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  critical: "bg-red-500",
};

// ── Step indicator ──────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const isActive = step === current;
        const isDone = step < current;
        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                transition-all duration-300
                ${
                  isActive
                    ? "bg-indigo-600 text-white ring-2 ring-indigo-400/50 ring-offset-2 ring-offset-gray-950"
                    : isDone
                      ? "bg-indigo-600/30 text-indigo-400"
                      : "bg-gray-800 text-gray-500"
                }
              `}
            >
              {isDone ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step
              )}
            </div>
            {step < total && (
              <div
                className={`w-12 h-0.5 transition-colors duration-300 ${
                  isDone ? "bg-indigo-600/50" : "bg-gray-800"
                }`}
              />
            )}
          </div>
        );
      })}
      <span className="ml-4 text-sm text-gray-500">
        Step {current} of {total}
      </span>
    </div>
  );
}

// ── Wizard page component ───────────────────────────────────────────

export default function ThreatModelPage() {
  const [step, setStep] = useState(1);
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  const [selectedDeployment, setSelectedDeployment] = useState<string | null>(null);
  const [selectedAccess, setSelectedAccess] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("left");

  // API data
  const [techniques, setTechniques] = useState<TechniqueSummary[]>([]);
  const [tactics, setTactics] = useState<TacticDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/techniques`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`${API_URL}/api/tactics`, { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([techs, tacs]) => {
        setTechniques(techs);
        setTactics(tacs);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  const goTo = useCallback(
    (target: number) => {
      if (animating) return;
      setSlideDirection(target > step ? "left" : "right");
      setAnimating(true);
      setTimeout(() => {
        setStep(target);
        setTimeout(() => setAnimating(false), 50);
      }, 200);
    },
    [step, animating]
  );

  const canProceed =
    (step === 1 && selectedSystems.length > 0) ||
    (step === 2 && selectedDeployment !== null) ||
    (step === 3 && selectedAccess !== null) ||
    step === 4;

  // Toggle system type selection (multi-select)
  const toggleSystem = (id: string) => {
    setSelectedSystems((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // ── Results computation ─────────────────────────────────────────

  const applicableTechniqueIds = useMemo(() => {
    if (!selectedAccess) return [];
    return getApplicableTechniqueIds(selectedSystems, selectedAccess);
  }, [selectedSystems, selectedAccess]);

  const filteredTechniques = useMemo(() => {
    const idSet = new Set(applicableTechniqueIds);
    return techniques.filter((t) => idSet.has(t.id));
  }, [techniques, applicableTechniqueIds]);

  // Group techniques by tactic
  const techniquesByTactic = useMemo(() => {
    const tacticMap = new Map<string, { name: string; order: number }>();
    for (const t of tactics) {
      tacticMap.set(t.id, { name: t.name, order: t.matrix_order });
    }

    const grouped: Record<
      string,
      { tacticName: string; order: number; techniques: TechniqueSummary[] }
    > = {};

    for (const tech of filteredTechniques) {
      for (const tacId of tech.tactic_ids) {
        if (!grouped[tacId]) {
          const info = tacticMap.get(tacId);
          grouped[tacId] = {
            tacticName: info?.name ?? tacId,
            order: info?.order ?? 99,
            techniques: [],
          };
        }
        grouped[tacId].techniques.push(tech);
      }
    }

    return Object.entries(grouped)
      .sort(([, a], [, b]) => a.order - b.order)
      .map(([tacticId, data]) => ({
        tacticId,
        ...data,
      }));
  }, [filteredTechniques, tactics]);

  const riskInfo = useMemo(() => {
    if (!selectedDeployment || !selectedAccess) return null;
    return computeRiskLevel(selectedDeployment, selectedAccess);
  }, [selectedDeployment, selectedAccess]);

  // Export as JSON
  const handleExport = useCallback(() => {
    const selectedSystemNames = AI_SYSTEM_TYPES.filter((s) =>
      selectedSystems.includes(s.id)
    ).map((s) => s.name);
    const deploymentName =
      DEPLOYMENT_MODELS.find((d) => d.id === selectedDeployment)?.name ?? "";
    const accessName =
      ACCESS_LEVELS.find((a) => a.id === selectedAccess)?.name ?? "";

    const exportData = {
      generated_at: new Date().toISOString(),
      profile: {
        ai_systems: selectedSystemNames,
        deployment: deploymentName,
        access_level: accessName,
        risk_level: riskInfo?.level ?? "unknown",
        risk_score: riskInfo?.score ?? 0,
        deployment_risk_explanation:
          DEPLOYMENT_RISKS[selectedDeployment ?? ""]?.explanation ?? "",
      },
      applicable_techniques: techniquesByTactic.map((group) => ({
        tactic: group.tacticName,
        tactic_id: group.tacticId,
        techniques: group.techniques.map((t) => ({
          id: t.id,
          name: t.name,
          maturity: t.maturity,
          is_subtechnique: t.is_subtechnique,
        })),
      })),
      summary: {
        total_tactics: techniquesByTactic.length,
        total_techniques: filteredTechniques.length,
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `threat-model-${selectedSystems.join("-")}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [
    selectedSystems,
    selectedDeployment,
    selectedAccess,
    riskInfo,
    techniquesByTactic,
    filteredTechniques,
  ]);

  // ── Loading & Error states ──────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading technique data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-300">Backend Not Available</h2>
        <p className="text-gray-500 text-center max-w-md">
          Could not load technique data. Make sure the FastAPI backend is running on{" "}
          <code className="text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded text-sm">localhost:8000</code>
        </p>
        <p className="text-red-400/70 text-sm mt-2">{error}</p>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-50 mb-2">AI Threat Model Wizard</h1>
        <p className="text-gray-400 text-sm">
          Select your AI system profile to discover which ATLAS techniques pose the greatest risk
        </p>
      </div>

      {/* Step indicator */}
      <StepIndicator current={step} total={4} />

      {/* Step content with animation */}
      <div
        className={`transition-all duration-200 ${
          animating
            ? slideDirection === "left"
              ? "opacity-0 -translate-x-4"
              : "opacity-0 translate-x-4"
            : "opacity-100 translate-x-0"
        }`}
      >
        {/* ── Step 1: AI System Type ────────────────────── */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">
              What type of AI system are you securing?
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Select one or more. Different system types face different attack surfaces.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {AI_SYSTEM_TYPES.map((sys) => {
                const selected = selectedSystems.includes(sys.id);
                return (
                  <button
                    key={sys.id}
                    onClick={() => toggleSystem(sys.id)}
                    className={`text-left p-5 rounded-xl border transition-all duration-200 ${
                      selected
                        ? "bg-indigo-600/10 border-indigo-500/50 ring-1 ring-indigo-500/30"
                        : "bg-gray-900/50 border-gray-800 hover:border-gray-700 hover:bg-gray-900"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          selected ? "bg-indigo-600/20" : "bg-gray-800"
                        }`}
                      >
                        <svg
                          className={`w-5 h-5 ${selected ? "text-indigo-400" : "text-gray-400"}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d={sys.icon} />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3
                            className={`font-medium text-sm ${
                              selected ? "text-indigo-300" : "text-gray-200"
                            }`}
                          >
                            {sys.name}
                          </h3>
                          {selected && (
                            <svg
                              className="w-4 h-4 text-indigo-400 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {sys.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Step 2: Deployment Model ──────────────────── */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">How is your model deployed?</h2>
            <p className="text-sm text-gray-500 mb-6">
              Deployment model affects attack surface and risk profile.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DEPLOYMENT_MODELS.map((dep) => {
                const selected = selectedDeployment === dep.id;
                const risk = DEPLOYMENT_RISKS[dep.id];
                return (
                  <button
                    key={dep.id}
                    onClick={() => setSelectedDeployment(dep.id)}
                    className={`text-left p-5 rounded-xl border transition-all duration-200 ${
                      selected
                        ? "bg-indigo-600/10 border-indigo-500/50 ring-1 ring-indigo-500/30"
                        : "bg-gray-900/50 border-gray-800 hover:border-gray-700 hover:bg-gray-900"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3
                        className={`font-medium ${selected ? "text-indigo-300" : "text-gray-200"}`}
                      >
                        {dep.name}
                      </h3>
                      {selected && (
                        <svg
                          className="w-5 h-5 text-indigo-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-3 leading-relaxed">{dep.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">Risk factor:</span>
                      <div className="flex-1 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            risk.risk_factor >= 1.4
                              ? "bg-red-500"
                              : risk.risk_factor >= 1.1
                                ? "bg-orange-500"
                                : risk.risk_factor >= 0.9
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                          }`}
                          style={{ width: `${(risk.risk_factor / 1.5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 tabular-nums w-8 text-right">
                        {risk.risk_factor.toFixed(1)}x
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Step 3: Access Level ──────────────────────── */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">
              What access level do attackers have?
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Higher access levels unlock more sophisticated attack techniques.
            </p>
            <div className="grid grid-cols-1 gap-4">
              {ACCESS_LEVELS.map((al) => {
                const selected = selectedAccess === al.id;
                const threatLevel =
                  al.id === "white_box"
                    ? "critical"
                    : al.id === "gray_box"
                      ? "high"
                      : "medium";
                return (
                  <button
                    key={al.id}
                    onClick={() => setSelectedAccess(al.id)}
                    className={`text-left p-5 rounded-xl border transition-all duration-200 ${
                      selected
                        ? "bg-indigo-600/10 border-indigo-500/50 ring-1 ring-indigo-500/30"
                        : "bg-gray-900/50 border-gray-800 hover:border-gray-700 hover:bg-gray-900"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h3
                          className={`font-medium ${
                            selected ? "text-indigo-300" : "text-gray-200"
                          }`}
                        >
                          {al.name}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded border ${
                            RISK_COLORS[threatLevel]
                          }`}
                        >
                          {threatLevel} threat
                        </span>
                      </div>
                      {selected && (
                        <svg
                          className="w-5 h-5 text-indigo-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{al.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Step 4: Results ───────────────────────────── */}
        {step === 4 && (
          <div className="space-y-8">
            {/* Profile summary */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Threat Profile Summary</h2>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Export Threat Model
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                {/* AI Systems */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">
                    AI Systems
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {AI_SYSTEM_TYPES.filter((s) => selectedSystems.includes(s.id)).map(
                      (s) => (
                        <span
                          key={s.id}
                          className="text-xs px-2 py-1 bg-indigo-600/20 text-indigo-300 rounded border border-indigo-500/30"
                        >
                          {s.name}
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Deployment */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">
                    Deployment
                  </p>
                  <p className="text-sm text-gray-200">
                    {DEPLOYMENT_MODELS.find((d) => d.id === selectedDeployment)?.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {DEPLOYMENT_RISKS[selectedDeployment ?? ""]?.explanation}
                  </p>
                </div>

                {/* Risk Level */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">
                    Risk Level
                  </p>
                  {riskInfo && (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-sm font-semibold px-2.5 py-1 rounded border uppercase tracking-wide ${
                            RISK_COLORS[riskInfo.level]
                          }`}
                        >
                          {riskInfo.level}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            RISK_BAR_COLORS[riskInfo.level]
                          }`}
                          style={{
                            width: `${Math.min((riskInfo.score / 2.25) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Score: {riskInfo.score.toFixed(2)} / 2.25
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className="flex gap-6 text-sm">
                <span className="text-gray-400">
                  <span className="text-white font-semibold">{techniquesByTactic.length}</span>{" "}
                  tactics affected
                </span>
                <span className="text-gray-400">
                  <span className="text-white font-semibold">{filteredTechniques.length}</span>{" "}
                  applicable techniques
                </span>
                <span className="text-gray-400">
                  <span className="text-white font-semibold">
                    {ACCESS_LEVELS.find((a) => a.id === selectedAccess)?.name}
                  </span>{" "}
                  access
                </span>
              </div>
            </div>

            {/* Techniques grouped by tactic */}
            {techniquesByTactic.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No matching techniques found. Try adjusting your selections.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white">
                  Applicable Techniques by Tactic
                </h2>
                {techniquesByTactic.map((group) => (
                  <div
                    key={group.tacticId}
                    className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden"
                  >
                    <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
                      <h3 className="font-medium text-gray-200">{group.tacticName}</h3>
                      <span className="text-xs text-gray-500">
                        {group.techniques.length} technique
                        {group.techniques.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="divide-y divide-gray-800/50">
                      {group.techniques.map((tech) => (
                        <a
                          key={`${group.tacticId}-${tech.id}`}
                          href={`/technique/${tech.id}`}
                          className="flex items-center gap-4 px-5 py-3 hover:bg-gray-800/30 transition-colors group"
                        >
                          <span className="text-xs font-mono text-gray-500 w-28 flex-shrink-0">
                            {tech.id}
                          </span>
                          <span className="flex-1 text-sm text-gray-300 group-hover:text-indigo-300 transition-colors">
                            {tech.name}
                            {tech.is_subtechnique && (
                              <span className="ml-2 text-xs text-gray-600">(sub)</span>
                            )}
                          </span>
                          {tech.maturity && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                MATURITY_CLASSES[tech.maturity] ??
                                "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                              }`}
                            >
                              {tech.maturity}
                            </span>
                          )}
                          <svg
                            className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-800">
        {step > 1 ? (
          <button
            onClick={() => goTo(step - 1)}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 4 && (
          <button
            onClick={() => canProceed && goTo(step + 1)}
            disabled={!canProceed}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              canProceed
                ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            {step === 3 ? "View Results" : "Continue"}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}

        {step === 4 && (
          <button
            onClick={() => {
              setStep(1);
              setSelectedSystems([]);
              setSelectedDeployment(null);
              setSelectedAccess(null);
            }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Start Over
          </button>
        )}
      </div>
    </div>
  );
}
