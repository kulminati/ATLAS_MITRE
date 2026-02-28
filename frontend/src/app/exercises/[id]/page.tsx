"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { ExerciseDetail } from "@/lib/types";
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

export default function ExerciseDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [exercise, setExercise] = useState<ExerciseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interactive state
  const [showMalicious, setShowMalicious] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [showFalsePositives, setShowFalsePositives] = useState(false);

  useEffect(() => {
    api
      .getExercise(id)
      .then((data) => {
        setExercise(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="text-center py-32">
        <p className="text-red-400">
          {error ?? "Exercise not found"}
        </p>
        <Link
          href="/exercises"
          className="text-indigo-400 hover:text-indigo-300 mt-4 inline-block"
        >
          &larr; Back to exercises
        </Link>
      </div>
    );
  }

  const config = difficultyConfig[exercise.difficulty] ?? difficultyConfig.beginner;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/exercises"
          className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
        >
          &larr; All Exercises
        </Link>
        <div className="flex items-start justify-between gap-4 mt-4">
          <h1 className="text-2xl font-bold">{exercise.title}</h1>
          <span
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full border ${config.bg} ${config.color}`}
          >
            {config.label}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {exercise.technique_ids.map((tid) => (
            <Link
              key={tid}
              href={`/technique/${tid}`}
              className="text-xs px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:text-indigo-300 hover:border-indigo-400/50 transition-colors font-mono"
            >
              {tid}
            </Link>
          ))}
        </div>
      </div>

      {/* Scenario */}
      <section className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="text-lg font-semibold mb-4">Scenario</h2>
        <div className="text-gray-300 leading-relaxed whitespace-pre-line">
          {exercise.scenario}
        </div>
      </section>

      {/* Log Samples */}
      <section className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Analyze These Logs</h2>
          <button
            onClick={() => setShowMalicious(!showMalicious)}
            className={`text-sm px-4 py-2 rounded-lg border transition-all ${
              showMalicious
                ? "border-red-500/50 bg-red-500/10 text-red-400"
                : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600"
            }`}
          >
            {showMalicious ? "Hide Analysis" : "Show Malicious Entries"}
          </button>
        </div>
        <div className="space-y-3">
          {exercise.log_samples.map((sample, i) => (
            <div
              key={i}
              className={`rounded-lg border p-4 transition-all ${
                showMalicious && sample.is_malicious
                  ? "border-red-500/50 bg-red-500/5"
                  : showMalicious && !sample.is_malicious
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-gray-700 bg-gray-800/50"
              }`}
            >
              <div className="flex items-start gap-3">
                {showMalicious && (
                  <span
                    className={`shrink-0 mt-1 text-xs font-bold px-2 py-0.5 rounded ${
                      sample.is_malicious
                        ? "bg-red-500/20 text-red-400"
                        : "bg-emerald-500/20 text-emerald-400"
                    }`}
                  >
                    {sample.is_malicious ? "MALICIOUS" : "BENIGN"}
                  </span>
                )}
                <code className="text-xs text-gray-300 font-mono break-all leading-relaxed">
                  {sample.log_entry}
                </code>
              </div>
              {showMalicious && (
                <p className="mt-3 text-sm text-gray-400 border-t border-gray-700 pt-3">
                  {sample.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Hints */}
      <section className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="text-lg font-semibold mb-4">Hints</h2>
        <div className="space-y-3">
          {exercise.hints.map((hint, i) => (
            <div key={i}>
              {i < hintsRevealed ? (
                <div className="flex items-start gap-3 text-sm">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <p className="text-gray-300 pt-0.5">{hint}</p>
                </div>
              ) : i === hintsRevealed ? (
                <button
                  onClick={() => setHintsRevealed(hintsRevealed + 1)}
                  className="text-sm px-4 py-2 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all"
                >
                  Reveal Hint {i + 1}
                </button>
              ) : null}
            </div>
          ))}
          {hintsRevealed >= exercise.hints.length && (
            <p className="text-xs text-gray-500 mt-2">All hints revealed.</p>
          )}
        </div>
      </section>

      {/* Solution */}
      <section className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <button
          onClick={() => setShowSolution(!showSolution)}
          className={`w-full flex items-center justify-between text-lg font-semibold transition-colors ${
            showSolution ? "text-white" : "text-gray-300 hover:text-white"
          }`}
        >
          <span>Solution</span>
          <svg
            className={`w-5 h-5 transition-transform ${showSolution ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {showSolution && (
          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Detection Logic (Pseudocode)
              </h3>
              <pre className="rounded-lg bg-gray-950 border border-gray-700 p-4 text-sm text-emerald-300 font-mono overflow-x-auto whitespace-pre-wrap">
                {exercise.solution.detection_logic}
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                CrowdStrike LogScale Query
              </h3>
              <pre className="rounded-lg bg-gray-950 border border-gray-700 p-4 text-sm text-cyan-300 font-mono overflow-x-auto whitespace-pre-wrap">
                {exercise.solution.logscale_query}
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Explanation
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {exercise.solution.explanation}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* False Positive Notes */}
      <section className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <button
          onClick={() => setShowFalsePositives(!showFalsePositives)}
          className={`w-full flex items-center justify-between text-lg font-semibold transition-colors ${
            showFalsePositives ? "text-white" : "text-gray-300 hover:text-white"
          }`}
        >
          <span>False Positive Notes</span>
          <svg
            className={`w-5 h-5 transition-transform ${showFalsePositives ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {showFalsePositives && (
          <p className="mt-4 text-gray-300 leading-relaxed">
            {exercise.false_positive_notes}
          </p>
        )}
      </section>

      {/* Related Techniques */}
      <section className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="text-lg font-semibold mb-4">Related Techniques</h2>
        <div className="flex flex-wrap gap-3">
          {exercise.technique_ids.map((tid) => (
            <Link
              key={tid}
              href={`/technique/${tid}`}
              className="px-4 py-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:text-indigo-300 hover:border-indigo-400/50 transition-colors text-sm font-mono"
            >
              {tid} &rarr;
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
