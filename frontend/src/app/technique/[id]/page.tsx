import { api } from "@/lib/api";
import { getTacticColor, MATURITY_COLORS } from "@/lib/colors";
import TechniqueDetailTabs from "@/components/matrix/TechniqueDetailTabs";
import ExportButton from "@/components/ExportButton";

export default async function TechniqueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let technique;
  try {
    technique = await api.getTechnique(id);
  } catch {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-semibold text-gray-300 mb-2">
          Technique Not Found
        </h2>
        <p className="text-gray-500 mb-6">
          Could not load technique <code className="text-gray-400">{id}</code>.
          The backend may not be running.
        </p>
        <a
          href="/"
          className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
        >
          Back to Matrix
        </a>
      </div>
    );
  }

  const maturityColor = technique.maturity
    ? MATURITY_COLORS[technique.maturity] || "#6b7280"
    : null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back link */}
      <a
        href="/"
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
        Back to Matrix
      </a>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm font-mono text-gray-500">
            {technique.id}
          </span>
          {technique.maturity && maturityColor && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: `${maturityColor}20`,
                color: maturityColor,
              }}
            >
              {technique.maturity}
            </span>
          )}
          {technique.is_subtechnique && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
              subtechnique
            </span>
          )}
        </div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-50">{technique.name}</h1>
          <ExportButton
            exportPath={`/api/techniques/${technique.id}/export`}
            filename={`technique-${technique.id}`}
          />
        </div>

        {/* Tactic badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          {technique.tactic_ids.map((tacticId) => {
            const color = getTacticColor(tacticId);
            return (
              <span
                key={tacticId}
                className="text-xs px-2.5 py-1 rounded-md font-mono"
                style={{
                  backgroundColor: `${color}15`,
                  color,
                  border: `1px solid ${color}30`,
                }}
              >
                {tacticId}
              </span>
            );
          })}
        </div>

        {/* ATT&CK cross-reference */}
        {technique.attck_url && (
          <div className="mt-4">
            <a
              href={technique.attck_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              ATT&CK Reference: {technique.attck_id}
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        )}
      </div>

      {/* Description */}
      {technique.description && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-200 mb-3">
            Description
          </h2>
          <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            {technique.description}
          </div>
        </section>
      )}

      {/* Parent technique link */}
      {technique.parent_technique_id && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-200 mb-3">
            Parent Technique
          </h2>
          <a
            href={`/technique/${technique.parent_technique_id}`}
            className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 transition-colors"
          >
            {technique.parent_technique_id}
          </a>
        </section>
      )}

      {/* Tabbed sections */}
      <section className="mb-8">
        <TechniqueDetailTabs technique={technique} />
      </section>

      {/* Metadata footer */}
      <div className="border-t border-gray-800 pt-4 mt-8 text-xs text-gray-600 flex gap-6">
        {technique.created_date && (
          <span>Created: {technique.created_date}</span>
        )}
        {technique.modified_date && (
          <span>Modified: {technique.modified_date}</span>
        )}
      </div>
    </div>
  );
}
