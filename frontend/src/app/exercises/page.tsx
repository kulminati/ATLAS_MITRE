import { api } from "@/lib/api";
import type { ExerciseSummary } from "@/lib/types";
import Link from "next/link";

const difficultyConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  beginner: {
    label: "Beginner",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
  },
  intermediate: {
    label: "Intermediate",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
  },
  advanced: {
    label: "Advanced",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
  },
};

export default async function ExercisesPage() {
  const exercises: ExerciseSummary[] = await api.getExercises();

  const difficulties = ["all", "beginner", "intermediate", "advanced"];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Detection Exercises</h1>
        <p className="text-gray-400 mt-2 max-w-2xl">
          Practice identifying AI/ML attacks in realistic log data. Analyze
          samples, develop detection logic, and learn to write CrowdStrike
          LogScale queries for AI-specific threats.
        </p>
      </div>

      {/* Difficulty legend */}
      <div className="flex gap-4 text-sm">
        {difficulties.slice(1).map((d) => {
          const config = difficultyConfig[d];
          return (
            <span
              key={d}
              className={`px-3 py-1 rounded-full border ${config.bg} ${config.color}`}
            >
              {config.label}
            </span>
          );
        })}
      </div>

      {/* Exercise grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((ex) => {
          const config = difficultyConfig[ex.difficulty] ?? difficultyConfig.beginner;
          return (
            <Link
              key={ex.id}
              href={`/exercises/${ex.id}`}
              className="group block rounded-xl border border-gray-800 bg-gray-900/50 p-6 hover:border-indigo-500/50 hover:bg-gray-900/80 transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h2 className="text-lg font-semibold group-hover:text-indigo-300 transition-colors leading-tight">
                  {ex.title}
                </h2>
                <span
                  className={`shrink-0 text-xs px-2.5 py-1 rounded-full border ${config.bg} ${config.color}`}
                >
                  {config.label}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {ex.technique_ids.map((tid) => (
                  <span
                    key={tid}
                    className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 font-mono"
                  >
                    {tid}
                  </span>
                ))}
              </div>

              <div className="mt-4 text-sm text-indigo-400 group-hover:text-indigo-300 transition-colors">
                Start exercise &rarr;
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
