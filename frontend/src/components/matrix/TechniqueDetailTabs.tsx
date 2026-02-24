"use client";

import { useState } from "react";
import { MATURITY_COLORS } from "@/lib/colors";
import type { TechniqueDetail, MitigationRef, CaseStudySummary, TechniqueSummary } from "@/lib/types";
import OsintPanel from "./OsintPanel";

interface Props {
  technique: TechniqueDetail;
}

type TabKey = "subtechniques" | "mitigations" | "case_studies" | "osint";

interface TabDef {
  key: TabKey;
  label: string;
  count: number | null; // null = always show (OSINT fetches on demand)
}

export default function TechniqueDetailTabs({ technique }: Props) {
  const allTabs: TabDef[] = [
    {
      key: "subtechniques" as const,
      label: "Subtechniques",
      count: technique.subtechniques.length,
    },
    {
      key: "mitigations" as const,
      label: "Mitigations",
      count: technique.mitigations.length,
    },
    {
      key: "case_studies" as const,
      label: "Case Studies",
      count: technique.case_studies.length,
    },
    {
      key: "osint" as const,
      label: "OSINT",
      count: null, // always show - fetches on demand
    },
  ];
  // Show tabs that have content OR are always-show (count === null)
  const tabs = allTabs.filter((tab) => tab.count === null || tab.count > 0);

  const [activeTab, setActiveTab] = useState<TabKey>(
    tabs.length > 0 ? tabs[0].key : "osint"
  );

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-900/50 border border-gray-800 rounded-lg p-1 mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-gray-700 text-gray-100"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
            }`}
          >
            {tab.label}
            {tab.count !== null && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? "bg-gray-600 text-gray-200"
                    : "bg-gray-800 text-gray-500"
                }`}
              >
                {tab.count}
              </span>
            )}
            {tab.key === "osint" && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? "bg-indigo-500/20 text-indigo-300"
                    : "bg-indigo-500/10 text-indigo-400"
                }`}
              >
                live
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-2">
        {activeTab === "subtechniques" && (
          <SubtechniquesPanel subtechniques={technique.subtechniques} />
        )}
        {activeTab === "mitigations" && (
          <MitigationsPanel mitigations={technique.mitigations} />
        )}
        {activeTab === "case_studies" && (
          <CaseStudiesPanel caseStudies={technique.case_studies} />
        )}
        {activeTab === "osint" && (
          <OsintPanel techniqueId={technique.id} />
        )}
      </div>
    </div>
  );
}

function SubtechniquesPanel({
  subtechniques,
}: {
  subtechniques: TechniqueSummary[];
}) {
  return (
    <div className="grid gap-2">
      {subtechniques.map((sub) => {
        const maturityColor = sub.maturity
          ? MATURITY_COLORS[sub.maturity] || "#6b7280"
          : null;
        return (
          <a
            key={sub.id}
            href={`/technique/${sub.id}`}
            className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 hover:border-gray-600 hover:bg-gray-800/80 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded bg-gray-800 group-hover:bg-gray-700">
                <svg
                  className="w-3.5 h-3.5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
              <span className="text-xs font-mono text-gray-500 group-hover:text-gray-400">
                {sub.id}
              </span>
              <span className="text-sm text-gray-300 group-hover:text-gray-100">
                {sub.name}
              </span>
            </div>
            {sub.maturity && maturityColor && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${maturityColor}20`,
                  color: maturityColor,
                }}
              >
                {sub.maturity}
              </span>
            )}
          </a>
        );
      })}
    </div>
  );
}

function MitigationsPanel({
  mitigations,
}: {
  mitigations: MitigationRef[];
}) {
  return (
    <div className="grid gap-2">
      {mitigations.map((mit) => (
        <div
          key={mit.id}
          className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 hover:border-gray-700 transition-colors"
        >
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs font-mono text-gray-500">{mit.id}</span>
            {mit.category && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {mit.category}
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-200">{mit.name}</p>
          {mit.usage && (
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              {mit.usage}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function CaseStudiesPanel({
  caseStudies,
}: {
  caseStudies: CaseStudySummary[];
}) {
  return (
    <div className="grid gap-2">
      {caseStudies.map((cs) => (
        <a
          key={cs.id}
          href={`/case-study/${cs.id}`}
          className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 hover:border-gray-600 hover:bg-gray-800/80 transition-colors group"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-mono text-gray-500 group-hover:text-gray-400">
                {cs.id}
              </span>
              {cs.case_study_type && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  {cs.case_study_type}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-300 group-hover:text-gray-100">
              {cs.name}
            </p>
          </div>
          <div className="text-right shrink-0 ml-4">
            {cs.target && (
              <p className="text-xs text-gray-500">Target: {cs.target}</p>
            )}
            {cs.incident_date && (
              <p className="text-xs text-gray-600">{cs.incident_date}</p>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}
