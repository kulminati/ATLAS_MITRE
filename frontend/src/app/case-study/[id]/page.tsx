import { api } from "@/lib/api";
import { stripHtml } from "@/lib/utils";
import { getTacticColor } from "@/lib/colors";

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let caseStudy;
  try {
    caseStudy = await api.getCaseStudy(id);
  } catch {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-semibold text-gray-300 mb-2">
          Case Study Not Found
        </h2>
        <p className="text-gray-500 mb-6">
          Could not load case study{" "}
          <code className="text-gray-400">{id}</code>.
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
          <span className="text-xs font-mono text-gray-500">{caseStudy.id}</span>
          {caseStudy.case_study_type && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
              {caseStudy.case_study_type}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-gray-50 mb-4">
          {caseStudy.name}
        </h1>

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
          {caseStudy.incident_date && (
            <div>
              <span className="text-gray-500">Date:</span>{" "}
              {caseStudy.incident_date}
            </div>
          )}
          {caseStudy.target && (
            <div>
              <span className="text-gray-500">Target:</span>{" "}
              {caseStudy.target}
            </div>
          )}
          {caseStudy.actor && (
            <div>
              <span className="text-gray-500">Actor:</span>{" "}
              {caseStudy.actor}
            </div>
          )}
          {caseStudy.reporter && (
            <div>
              <span className="text-gray-500">Reporter:</span>{" "}
              {caseStudy.reporter}
            </div>
          )}
        </div>

        {/* Summary */}
        {caseStudy.summary && (
          <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">
            {stripHtml(caseStudy.summary)}
          </p>
        )}
      </div>

      {/* Procedure Steps */}
      {caseStudy.procedures.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">
            Procedure Steps ({caseStudy.procedures.length})
          </h2>
          <div className="relative">
            {caseStudy.procedures.map((step, i) => {
              const color = getTacticColor(step.tactic_id);
              const isLast = i === caseStudy.procedures.length - 1;

              return (
                <div key={step.step_order} className="flex gap-4 relative">
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
                  <div className={`pb-6 flex-1`}>
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
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
        </section>
      )}

      {/* References */}
      {caseStudy.references.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">
            References ({caseStudy.references.length})
          </h2>
          <div className="space-y-2">
            {caseStudy.references.map((ref, i) => (
              <div
                key={i}
                className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3"
              >
                {ref.url ? (
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {ref.title || ref.url}
                  </a>
                ) : (
                  <span className="text-sm text-gray-400">
                    {ref.title || "Untitled reference"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
