import { api } from "@/lib/api";
import { stripHtml } from "@/lib/utils";
import KillchainFlow from "@/components/killchain/KillchainFlow";
import KillchainStepList from "@/components/killchain/KillchainStepList";
import ExportButton from "@/components/ExportButton";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

export default async function KillchainDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = parseInt(id, 10);

  let killchain;
  try {
    killchain = await api.getKillchain(numericId);
  } catch {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-semibold text-gray-300 mb-2">
          Killchain Not Found
        </h2>
        <p className="text-gray-500 mb-6">
          Could not load killchain{" "}
          <code className="text-gray-400">{id}</code>. The backend may not be
          running.
        </p>
        <a
          href="/killchain"
          className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
        >
          Back to Killchains
        </a>
      </div>
    );
  }

  const sevColor = SEVERITY_COLORS[killchain.severity || ""] || "#6b7280";

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back link */}
      <a
        href="/killchain"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors mb-6"
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Killchains
      </a>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-50 mb-3">
            {killchain.name}
          </h1>
          <ExportButton
            exportPath={`/api/killchains/${killchain.id}/export`}
            filename={`killchain-${killchain.name.toLowerCase().replace(/\s+/g, "-")}`}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {killchain.severity && (
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{
                backgroundColor: `${sevColor}20`,
                color: sevColor,
              }}
            >
              {killchain.severity}
            </span>
          )}
          {killchain.attack_category && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-400 font-medium">
              {killchain.attack_category}
            </span>
          )}
          {killchain.year && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-400">
              {killchain.year}
            </span>
          )}
          {killchain.source_case_study_id && (
            <a
              href={`/case-study/${killchain.source_case_study_id}`}
              className="text-xs font-mono text-gray-500 hover:text-indigo-400 transition-colors"
            >
              {killchain.source_case_study_id}
            </a>
          )}
        </div>
        {killchain.description && (
          <p className="text-sm text-gray-400 mt-4 leading-relaxed max-w-3xl whitespace-pre-line">
            {stripHtml(killchain.description)}
          </p>
        )}
      </div>

      {/* Flow Diagram */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-200 mb-4">
          Attack Flow
        </h2>
        <KillchainFlow nodes={killchain.nodes} edges={killchain.edges} />
      </section>

      {/* Step-by-step procedure list */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-200 mb-4">
          Procedure Steps
        </h2>
        <KillchainStepList steps={killchain.steps} />
      </section>
    </div>
  );
}
