"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ExecutiveReport } from "@/lib/types";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/20 text-green-400 border-green-500/30",
  unknown: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const MATURITY_COLORS: Record<string, string> = {
  realized: "bg-red-500/20 text-red-400 border border-red-500/30",
  demonstrated: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  feasible: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  unknown: "bg-gray-500/20 text-gray-400 border border-gray-500/30",
};

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function MaturityBadge({ maturity }: { maturity: string | null }) {
  const key = maturity || "unknown";
  const colorClass = MATURITY_COLORS[key] || MATURITY_COLORS.unknown;
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}
    >
      {key}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const colorClass = SEVERITY_COLORS[severity] || SEVERITY_COLORS.unknown;
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded text-xs font-medium border ${colorClass}`}
    >
      {severity}
    </span>
  );
}

export default function ReportsPage() {
  const [report, setReport] = useState<ExecutiveReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getExecutiveReport()
      .then(setReport)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load report")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Generating report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-300">
          Report Unavailable
        </h2>
        <p className="text-gray-500 text-center max-w-md">
          Could not generate the executive report. Make sure the FastAPI backend
          is running on{" "}
          <code className="text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded text-sm">
            localhost:8000
          </code>
        </p>
        {error && <p className="text-red-400/70 text-sm mt-2">{error}</p>}
      </div>
    );
  }

  const s = report.executive_summary;
  const severityOrder = ["critical", "high", "medium", "low"];
  const totalKillchains = Object.values(
    report.killchain_severity_distribution
  ).reduce((a, b) => a + b, 0);

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: #111 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          header, nav, .no-print {
            display: none !important;
          }
          main {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-container {
            padding: 24px !important;
          }
          .stat-card-print {
            background: #f9fafb !important;
            border: 1px solid #e5e7eb !important;
            color: #111 !important;
          }
          .stat-card-print p:first-child {
            color: #6b7280 !important;
          }
          .stat-card-print p:nth-child(2) {
            color: #111 !important;
          }
          .stat-card-print p:nth-child(3) {
            color: #9ca3af !important;
          }
          .section-print {
            background: white !important;
            border: 1px solid #e5e7eb !important;
            color: #111 !important;
          }
          .section-print h2 {
            color: #111 !important;
          }
          .section-print p {
            color: #374151 !important;
          }
          table {
            border-collapse: collapse !important;
          }
          th {
            background: #f3f4f6 !important;
            color: #111 !important;
            border-bottom: 2px solid #d1d5db !important;
          }
          td {
            color: #374151 !important;
            border-bottom: 1px solid #e5e7eb !important;
          }
          .print-header {
            color: #111 !important;
            border-bottom: 2px solid #111 !important;
            padding-bottom: 16px !important;
            margin-bottom: 24px !important;
          }
          .print-header h1 {
            color: #111 !important;
          }
          .print-header p {
            color: #6b7280 !important;
          }
          .maturity-badge-print {
            border: 1px solid #d1d5db !important;
            color: #374151 !important;
            background: #f9fafb !important;
          }
          .severity-badge-print {
            border: 1px solid #d1d5db !important;
            color: #374151 !important;
            background: #f9fafb !important;
          }
          .bar-fill-print {
            background: #6366f1 !important;
          }
          a {
            color: #4f46e5 !important;
            text-decoration: underline !important;
          }
        }
      `}</style>

      <div className="print-container space-y-8">
        {/* ── Report Header ─────────────────────────── */}
        <div className="print-header flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              ATLAS Threat Intelligence Report
            </h1>
            <p className="text-gray-400 mt-1">
              MITRE ATLAS v{report.atlas_version} &mdash; Generated{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            {report.last_sync && (
              <p className="text-gray-500 text-sm mt-0.5">
                Last data sync:{" "}
                {new Date(report.last_sync).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
          <button
            onClick={() => window.print()}
            className="no-print flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print Report
          </button>
        </div>

        {/* ── Executive Summary ─────────────────────── */}
        <section>
          <SectionHeader
            title="Executive Summary"
            subtitle="Key metrics across the ATLAS threat landscape"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat-card-print">
              <StatCard
                label="Tactics"
                value={s.tactics_count}
                sub="Kill chain phases"
              />
            </div>
            <div className="stat-card-print">
              <StatCard
                label="Techniques"
                value={s.techniques_total}
                sub={`${s.parent_techniques} parent + ${s.subtechniques} sub`}
              />
            </div>
            <div className="stat-card-print">
              <StatCard label="Case Studies" value={s.case_studies_count} sub="Documented incidents" />
            </div>
            <div className="stat-card-print">
              <StatCard label="Kill Chains" value={s.killchains_count} sub="Attack sequences" />
            </div>
          </div>

          {/* Maturity breakdown bar */}
          <div className="mt-4 bg-gray-900 border border-gray-800 rounded-xl p-5 section-print">
            <p className="text-sm text-gray-400 mb-3">
              Technique Maturity Distribution
            </p>
            <div className="flex gap-1 h-6 rounded-lg overflow-hidden">
              {Object.entries(s.techniques_by_maturity)
                .sort(([a], [b]) => {
                  const order = ["realized", "demonstrated", "feasible"];
                  return order.indexOf(a) - order.indexOf(b);
                })
                .map(([maturity, count]) => {
                  const pct = (count / s.techniques_total) * 100;
                  const color =
                    maturity === "realized"
                      ? "bg-red-500"
                      : maturity === "demonstrated"
                        ? "bg-orange-500"
                        : maturity === "feasible"
                          ? "bg-amber-500"
                          : "bg-gray-600";
                  return (
                    <div
                      key={maturity}
                      className={`${color} bar-fill-print relative group`}
                      style={{ width: `${pct}%` }}
                      title={`${maturity}: ${count} (${pct.toFixed(1)}%)`}
                    />
                  );
                })}
            </div>
            <div className="flex gap-6 mt-3 text-xs text-gray-400">
              {Object.entries(s.techniques_by_maturity)
                .sort(([a], [b]) => {
                  const order = ["realized", "demonstrated", "feasible"];
                  return order.indexOf(a) - order.indexOf(b);
                })
                .map(([maturity, count]) => {
                  const dot =
                    maturity === "realized"
                      ? "bg-red-500"
                      : maturity === "demonstrated"
                        ? "bg-orange-500"
                        : maturity === "feasible"
                          ? "bg-amber-500"
                          : "bg-gray-600";
                  return (
                    <span key={maturity} className="flex items-center gap-1.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${dot} inline-block`}
                      />
                      {maturity}: {count}
                    </span>
                  );
                })}
            </div>
          </div>
        </section>

        {/* ── Threat Landscape: Tactic Breakdown ──────── */}
        <section>
          <SectionHeader
            title="Threat Landscape"
            subtitle="Technique and case study distribution across ATLAS tactics"
          />
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden section-print">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-5 py-3 text-gray-400 font-medium">
                    #
                  </th>
                  <th className="text-left px-5 py-3 text-gray-400 font-medium">
                    Tactic
                  </th>
                  <th className="text-left px-5 py-3 text-gray-400 font-medium">
                    ID
                  </th>
                  <th className="text-right px-5 py-3 text-gray-400 font-medium">
                    Techniques
                  </th>
                  <th className="text-right px-5 py-3 text-gray-400 font-medium">
                    Case Studies
                  </th>
                  <th className="px-5 py-3 text-gray-400 font-medium text-left w-1/3">
                    Distribution
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.tactic_breakdown.map((t) => {
                  const maxTech = Math.max(
                    ...report.tactic_breakdown.map((x) => x.technique_count)
                  );
                  const pct =
                    maxTech > 0 ? (t.technique_count / maxTech) * 100 : 0;
                  return (
                    <tr
                      key={t.tactic_id}
                      className="border-b border-gray-800/50 hover:bg-gray-800/30"
                    >
                      <td className="px-5 py-3 text-gray-500 tabular-nums">
                        {t.matrix_order + 1}
                      </td>
                      <td className="px-5 py-3 text-white font-medium">
                        {t.tactic_name}
                      </td>
                      <td className="px-5 py-3 text-gray-400 font-mono text-xs">
                        {t.tactic_id}
                      </td>
                      <td className="px-5 py-3 text-right text-white tabular-nums">
                        {t.technique_count}
                      </td>
                      <td className="px-5 py-3 text-right text-gray-300 tabular-nums">
                        {t.case_study_count}
                      </td>
                      <td className="px-5 py-3">
                        <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-indigo-500 bar-fill-print"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Top 10 Risk Techniques ────────────────── */}
        <section>
          <SectionHeader
            title="Top 10 Highest-Risk Techniques"
            subtitle="Ranked by maturity level, case study frequency, and OSINT signal strength"
          />
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden section-print">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-5 py-3 text-gray-400 font-medium">
                    Rank
                  </th>
                  <th className="text-left px-5 py-3 text-gray-400 font-medium">
                    Technique
                  </th>
                  <th className="text-left px-5 py-3 text-gray-400 font-medium">
                    ID
                  </th>
                  <th className="text-center px-5 py-3 text-gray-400 font-medium">
                    Maturity
                  </th>
                  <th className="text-right px-5 py-3 text-gray-400 font-medium">
                    Case Studies
                  </th>
                  <th className="text-right px-5 py-3 text-gray-400 font-medium">
                    OSINT Signal
                  </th>
                  <th className="text-right px-5 py-3 text-gray-400 font-medium">
                    Risk Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.top_risk_techniques.map((t, i) => (
                  <tr
                    key={t.technique_id}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30"
                  >
                    <td className="px-5 py-3 text-gray-500 tabular-nums font-medium">
                      {i + 1}
                    </td>
                    <td className="px-5 py-3 text-white font-medium">
                      <a
                        href={`/technique/${t.technique_id}`}
                        className="hover:text-indigo-400 transition-colors"
                      >
                        {t.technique_name}
                      </a>
                      {t.is_subtechnique && (
                        <span className="ml-2 text-xs text-gray-500">
                          (sub)
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-400 font-mono text-xs">
                      {t.technique_id}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="maturity-badge-print">
                        <MaturityBadge maturity={t.maturity} />
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-gray-300 tabular-nums">
                      {t.case_study_count}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-300 tabular-nums">
                      {t.osint_signal}
                    </td>
                    <td className="px-5 py-3 text-right text-white font-semibold tabular-nums">
                      {t.risk_score.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Kill Chain Analysis ───────────────────── */}
        <section>
          <SectionHeader
            title="Kill Chain Analysis"
            subtitle="Severity and attack category distribution across documented kill chains"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Severity distribution */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 section-print">
              <p className="text-sm text-gray-400 mb-4 font-medium">
                Severity Distribution
              </p>
              <div className="space-y-3">
                {severityOrder.map((sev) => {
                  const count =
                    report.killchain_severity_distribution[sev] || 0;
                  const pct =
                    totalKillchains > 0 ? (count / totalKillchains) * 100 : 0;
                  return (
                    <div key={sev} className="flex items-center gap-3">
                      <div className="w-20">
                        <SeverityBadge severity={sev} />
                      </div>
                      <div className="flex-1 h-3 rounded-full bg-gray-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full bar-fill-print ${
                            sev === "critical"
                              ? "bg-red-500"
                              : sev === "high"
                                ? "bg-orange-500"
                                : sev === "medium"
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-300 tabular-nums w-12 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Attack category distribution */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 section-print">
              <p className="text-sm text-gray-400 mb-4 font-medium">
                Attack Categories
              </p>
              <div className="space-y-3">
                {Object.entries(report.attack_category_distribution).map(
                  ([cat, count]) => {
                    const maxCat = Math.max(
                      ...Object.values(report.attack_category_distribution)
                    );
                    const pct = maxCat > 0 ? (count / maxCat) * 100 : 0;
                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <span className="text-sm text-gray-300 w-40 truncate">
                          {cat}
                        </span>
                        <div className="flex-1 h-3 rounded-full bg-gray-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-purple-500 bar-fill-print"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-300 tabular-nums w-8 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  }
                )}
                {Object.keys(report.attack_category_distribution).length ===
                  0 && (
                  <p className="text-gray-500 text-sm">
                    No kill chain categories available. Seed kill chains first.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── OSINT Intelligence Summary ────────────── */}
        <section>
          <SectionHeader
            title="OSINT Intelligence Summary"
            subtitle="Open-source intelligence coverage and notable findings"
          />

          {/* Coverage stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="stat-card-print">
              <StatCard
                label="GitHub Repos"
                value={report.osint_coverage.total_github_repos}
                sub={`${report.osint_coverage.techniques_with_github} techniques covered`}
              />
            </div>
            <div className="stat-card-print">
              <StatCard
                label="arXiv Papers"
                value={report.osint_coverage.total_arxiv_papers}
                sub={`${report.osint_coverage.techniques_with_arxiv} techniques covered`}
              />
            </div>
            <div className="stat-card-print">
              <StatCard
                label="CVEs Tracked"
                value={report.osint_coverage.total_cves}
                sub={`${report.osint_coverage.techniques_with_cves} techniques covered`}
              />
            </div>
            <div className="stat-card-print">
              <StatCard
                label="OSINT Coverage"
                value={
                  report.osint_coverage.total_techniques > 0
                    ? `${Math.round(
                        ((report.osint_coverage.techniques_with_github +
                          report.osint_coverage.techniques_with_arxiv +
                          report.osint_coverage.techniques_with_cves) /
                          (report.osint_coverage.total_techniques * 3)) *
                          100
                      )}%`
                    : "0%"
                }
                sub="Across all sources"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top GitHub repos */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 section-print">
              <p className="text-sm text-gray-400 mb-3 font-medium">
                Top GitHub Repositories
              </p>
              {report.osint_highlights.top_github_repos.length > 0 ? (
                <div className="space-y-3">
                  {report.osint_highlights.top_github_repos.map((repo, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 pb-3 border-b border-gray-800/50 last:border-0 last:pb-0"
                    >
                      <div className="flex-1 min-w-0">
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-400 hover:text-indigo-300 font-medium truncate block"
                        >
                          {repo.repo_full_name}
                        </a>
                        {repo.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {repo.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-600 mt-0.5">
                          Technique: {repo.technique_id}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-yellow-500 whitespace-nowrap">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {repo.stars.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No GitHub repositories cached yet. Browse techniques to
                  trigger OSINT collection.
                </p>
              )}
            </div>

            {/* Recent CVEs */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 section-print">
              <p className="text-sm text-gray-400 mb-3 font-medium">
                Recent CVEs
              </p>
              {report.osint_highlights.recent_cves.length > 0 ? (
                <div className="space-y-3">
                  {report.osint_highlights.recent_cves.map((cve, i) => (
                    <div
                      key={i}
                      className="pb-3 border-b border-gray-800/50 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <a
                          href={cve.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                          {cve.title || "Untitled CVE"}
                        </a>
                      </div>
                      {cve.summary && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {cve.summary}
                        </p>
                      )}
                      <p className="text-xs text-gray-600 mt-0.5">
                        Technique: {cve.technique_id}
                        {cve.fetched_at && (
                          <span className="ml-2">
                            Fetched:{" "}
                            {new Date(cve.fetched_at).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No CVEs cached yet. Browse techniques to trigger OSINT
                  collection.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── Footer ────────────────────────────────── */}
        <footer className="border-t border-gray-800 pt-4 text-center text-xs text-gray-500 section-print">
          <p>
            ATLAS Threat Intelligence Platform &mdash; MITRE ATLAS v
            {report.atlas_version}
          </p>
          <p className="mt-0.5">
            Report generated on{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </footer>
      </div>
    </>
  );
}
