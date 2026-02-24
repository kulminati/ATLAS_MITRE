"use client";

import { useState, useEffect, useRef } from "react";
import type { SearchResponse } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (!trimmed) {
      setResults(null);
      setSearched(false);
      setError(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${API_URL}/api/search?q=${encodeURIComponent(trimmed)}`,
          { cache: "no-store", signal: controller.signal }
        );
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data: SearchResponse = await res.json();
        setResults(data);
        setSearched(true);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(
          e instanceof Error ? e.message : "Search failed. Is the backend running?"
        );
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const techniqueCount = results?.techniques.length ?? 0;
  const caseStudyCount = results?.case_studies.length ?? 0;
  const totalCount = techniqueCount + caseStudyCount;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-50 mb-2">Search</h1>
        <p className="text-gray-400 text-sm">
          Search across techniques and case studies in the ATLAS framework
        </p>
      </div>

      {/* Search input */}
      <div className="relative mb-8">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search techniques, case studies..."
          autoFocus
          className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <svg
              className="w-5 h-5 text-indigo-400 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 mb-6">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Empty state - no query entered */}
      {!searched && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">
            Type a query to search the ATLAS knowledge base
          </p>
        </div>
      )}

      {/* No results state */}
      {searched && !loading && !error && totalCount === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
              />
            </svg>
          </div>
          <p className="text-gray-300 font-medium mb-1">No results found</p>
          <p className="text-gray-500 text-sm">
            No matches for &quot;{query.trim()}&quot;. Try different keywords.
          </p>
        </div>
      )}

      {/* Results */}
      {searched && !error && totalCount > 0 && (
        <div className="space-y-8">
          {/* Result summary */}
          <p className="text-sm text-gray-500">
            {totalCount} result{totalCount !== 1 ? "s" : ""} found
          </p>

          {/* Techniques */}
          {techniqueCount > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
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
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Techniques
                <span className="text-sm font-normal text-gray-500">
                  ({techniqueCount})
                </span>
              </h2>
              <div className="space-y-2">
                {results!.techniques.map((t) => (
                  <a
                    key={t.id}
                    href={`/technique/${t.id}`}
                    className="block bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-indigo-500/50 hover:bg-gray-900 transition-colors group"
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-mono text-gray-500">
                        {t.id}
                      </span>
                      <span className="text-gray-200 font-medium group-hover:text-indigo-300 transition-colors">
                        {t.name}
                      </span>
                    </div>
                    {t.description && (
                      <p className="text-sm text-gray-400 line-clamp-2 mt-1">
                        {t.description}
                      </p>
                    )}
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Case Studies */}
          {caseStudyCount > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Case Studies
                <span className="text-sm font-normal text-gray-500">
                  ({caseStudyCount})
                </span>
              </h2>
              <div className="space-y-2">
                {results!.case_studies.map((cs) => (
                  <a
                    key={cs.id}
                    href={`/case-study/${cs.id}`}
                    className="block bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-amber-500/50 hover:bg-gray-900 transition-colors group"
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-mono text-gray-500">
                        {cs.id}
                      </span>
                      <span className="text-gray-200 font-medium group-hover:text-amber-300 transition-colors">
                        {cs.name}
                      </span>
                    </div>
                    {cs.summary && (
                      <p className="text-sm text-gray-400 line-clamp-2 mt-1">
                        {cs.summary}
                      </p>
                    )}
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
