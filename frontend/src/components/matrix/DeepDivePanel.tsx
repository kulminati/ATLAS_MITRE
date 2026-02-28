"use client";

import { useState, useEffect } from "react";
import type { DeepDiveResponse } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Props {
  techniqueId: string;
}

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
  beginner: { bg: "bg-emerald-500/15", text: "text-emerald-400" },
  intermediate: { bg: "bg-amber-500/15", text: "text-amber-400" },
  advanced: { bg: "bg-red-500/15", text: "text-red-400" },
};

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, '<code class="bg-gray-800 px-1 py-0.5 rounded text-sm text-gray-300">$1</code>')
    .replace(/^- /gm, '<li class="ml-4 list-disc">')
    .replace(/<\/li>\n(?!<li)/g, "</li>\n")
    .replace(/\n\n/g, "</p><p class='mt-3'>")
    .replace(/\n(?!<)/g, "<br/>");
}

export default function DeepDivePanel({ techniqueId }: Props) {
  const [data, setData] = useState<DeepDiveResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    fetch(`${API_URL}/api/techniques/${techniqueId}/deepdive`, {
      cache: "no-store",
    })
      .then((res) => {
        if (res.status === 404) {
          setNotFound(true);
          return null;
        }
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (json) setData(json as DeepDiveResponse);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [techniqueId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-gray-900/50 border border-gray-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8 text-center">
        <div className="text-4xl mb-3 opacity-50">&#x1F4DA;</div>
        <p className="text-gray-400 text-lg font-medium mb-1">
          Content coming soon
        </p>
        <p className="text-gray-500 text-sm">
          A technical deep-dive for this technique is being developed. Check
          back later for detailed explanations, code examples, and hands-on lab
          resources.
        </p>
      </div>
    );
  }

  const diffColor = DIFFICULTY_COLORS[data.difficulty] || DIFFICULTY_COLORS.intermediate;

  return (
    <div className="space-y-6">
      {/* Difficulty & Prerequisites */}
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${diffColor.bg} ${diffColor.text}`}
        >
          {data.difficulty.charAt(0).toUpperCase() + data.difficulty.slice(1)}
        </span>
        {data.prerequisites.map((prereq) => (
          <span
            key={prereq}
            className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700"
          >
            {prereq}
          </span>
        ))}
      </div>

      {/* How It Works */}
      <section className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-3 flex items-center gap-2">
          <svg
            className="w-4 h-4 text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          How It Works
        </h3>
        <div
          className="text-sm text-gray-300 leading-relaxed prose-invert"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(data.how_it_works) }}
        />
      </section>

      {/* Code Example */}
      <section className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider flex items-center gap-2">
            <svg
              className="w-4 h-4 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
            Code Example
          </h3>
          <span className="text-xs text-gray-500 font-mono">Python</span>
        </div>
        <pre className="bg-gray-950 p-5 overflow-x-auto">
          <code className="text-sm text-gray-300 font-mono leading-relaxed whitespace-pre">
            {data.code_example}
          </code>
        </pre>
      </section>

      {/* Defense Strategies */}
      <section className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-3 flex items-center gap-2">
          <svg
            className="w-4 h-4 text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          Defense Strategies
        </h3>
        <div
          className="text-sm text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: renderMarkdown(data.defense_strategies),
          }}
        />
      </section>

      {/* Lab Tools */}
      {data.lab_tools.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-3 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
            Hands-On Labs &amp; Tools
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.lab_tools.map((tool) => (
              <a
                key={tool.url}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-purple-500/40 hover:bg-gray-800/80 transition-colors group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-200 group-hover:text-purple-300">
                    {tool.name}
                  </span>
                  <svg
                    className="w-3.5 h-3.5 text-gray-500 group-hover:text-purple-400 shrink-0"
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
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {tool.description}
                </p>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
