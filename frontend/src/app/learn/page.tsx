"use client";

import { useState } from "react";
import { learningPaths } from "@/lib/learning-paths";
import type { LearningPath, LearningModule } from "@/lib/types";

const difficultyConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  beginner: {
    label: "Beginner",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/30",
  },
  intermediate: {
    label: "Intermediate",
    color: "text-amber-400",
    bg: "bg-amber-400/10 border-amber-400/30",
  },
  advanced: {
    label: "Advanced",
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/30",
  },
  "beginner-intermediate": {
    label: "Beginner-Intermediate",
    color: "text-sky-400",
    bg: "bg-sky-400/10 border-sky-400/30",
  },
};

const moduleTypeConfig: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  read: { label: "Read", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", color: "text-blue-400" },
  exercise: { label: "Exercise", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", color: "text-green-400" },
  explore: { label: "Explore", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", color: "text-purple-400" },
  activity: { label: "Activity", icon: "M13 10V3L4 14h7v7l9-11h-7z", color: "text-amber-400" },
};

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const config = difficultyConfig[difficulty] || difficultyConfig.beginner;
  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full border ${config.bg} ${config.color}`}
    >
      {config.label}
    </span>
  );
}

function ModuleTypeBadge({ type }: { type: string }) {
  const config = moduleTypeConfig[type] || moduleTypeConfig.read;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${config.color}`}>
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
      </svg>
      {config.label}
    </span>
  );
}

function ModuleCard({
  module,
  stepNumber,
}: {
  module: LearningModule;
  stepNumber: number;
}) {
  return (
    <div className="group relative flex gap-4 pb-8 last:pb-0">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-800 border border-gray-700 text-sm font-semibold text-gray-300 group-hover:border-indigo-500/50 group-hover:text-indigo-400 transition-colors">
          {stepNumber}
        </div>
        <div className="w-px flex-1 bg-gray-800 group-last:bg-transparent mt-2" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-2">
        <div className="flex items-center gap-3 mb-1.5">
          <h4 className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">
            {module.title}
          </h4>
          <ModuleTypeBadge type={module.type} />
          {module.techniqueId && (
            <span className="text-xs font-mono text-gray-500">
              {module.techniqueId}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400 mb-3 leading-relaxed">
          {module.description}
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {module.keyConcepts.map((concept) => (
            <span
              key={concept}
              className="text-xs px-2 py-0.5 rounded bg-gray-800/80 text-gray-400 border border-gray-700/50"
            >
              {concept}
            </span>
          ))}
        </div>
        <a
          href={module.link}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Open resource
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>
    </div>
  );
}

function PathCard({ path }: { path: LearningPath }) {
  const [expanded, setExpanded] = useState(false);
  const diff = difficultyConfig[path.difficulty] || difficultyConfig.beginner;

  return (
    <div className="border border-gray-800 rounded-xl bg-gray-900/50 overflow-hidden hover:border-gray-700 transition-colors">
      {/* Card header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-6 cursor-pointer"
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="text-lg font-bold text-gray-100">{path.title}</h3>
          <DifficultyBadge difficulty={path.difficulty} />
        </div>
        <p className="text-sm text-gray-400 leading-relaxed mb-4">
          {path.description}
        </p>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {path.modules.length} modules
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {path.estimatedTime}
          </span>
          <span className={`ml-auto inline-flex items-center gap-1 ${diff.color}`}>
            {expanded ? "Collapse" : "View modules"}
            <svg
              className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
      </button>

      {/* Expanded modules */}
      {expanded && (
        <div className="border-t border-gray-800 px-6 py-6 bg-gray-900/30">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Modules
            </h4>
            <a
              href={path.modules[0].link}
              className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              Start Path
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
          <div>
            {path.modules.map((mod, i) => (
              <ModuleCard key={mod.title} module={mod} stepNumber={i + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LearnPage() {
  const beginnerPaths = learningPaths.filter(
    (p) => p.difficulty === "beginner" || p.difficulty === "beginner-intermediate"
  );
  const intermediatePaths = learningPaths.filter(
    (p) => p.difficulty === "intermediate"
  );
  const advancedPaths = learningPaths.filter(
    (p) => p.difficulty === "advanced"
  );

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 text-sm text-indigo-400 font-medium mb-4 px-3 py-1 rounded-full bg-indigo-400/10 border border-indigo-400/20">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Structured Learning
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Learning Paths
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Structured curricula to master AI security. Choose a path based on your
          experience level and focus area, then work through the modules at your own pace.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-12">
        <div className="text-center p-4 rounded-xl bg-gray-900/50 border border-gray-800">
          <div className="text-2xl font-bold text-emerald-400">{learningPaths.length}</div>
          <div className="text-xs text-gray-500 mt-1">Learning Paths</div>
        </div>
        <div className="text-center p-4 rounded-xl bg-gray-900/50 border border-gray-800">
          <div className="text-2xl font-bold text-indigo-400">
            {learningPaths.reduce((sum, p) => sum + p.modules.length, 0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Total Modules</div>
        </div>
        <div className="text-center p-4 rounded-xl bg-gray-900/50 border border-gray-800">
          <div className="text-2xl font-bold text-purple-400">3</div>
          <div className="text-xs text-gray-500 mt-1">Skill Levels</div>
        </div>
      </div>

      {/* Beginner paths */}
      {beginnerPaths.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <h2 className="text-lg font-semibold text-gray-200">Getting Started</h2>
            <span className="text-xs text-gray-500">Recommended for newcomers</span>
          </div>
          <div className="grid gap-4">
            {beginnerPaths.map((path) => (
              <PathCard key={path.id} path={path} />
            ))}
          </div>
        </section>
      )}

      {/* Intermediate paths */}
      {intermediatePaths.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <h2 className="text-lg font-semibold text-gray-200">Intermediate</h2>
            <span className="text-xs text-gray-500">Build on your fundamentals</span>
          </div>
          <div className="grid gap-4">
            {intermediatePaths.map((path) => (
              <PathCard key={path.id} path={path} />
            ))}
          </div>
        </section>
      )}

      {/* Advanced paths */}
      {advancedPaths.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <h2 className="text-lg font-semibold text-gray-200">Advanced</h2>
            <span className="text-xs text-gray-500">Deep specialization tracks</span>
          </div>
          <div className="grid gap-4">
            {advancedPaths.map((path) => (
              <PathCard key={path.id} path={path} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
