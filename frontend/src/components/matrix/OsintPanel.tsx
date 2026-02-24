"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { OsintResponse, GitHubRepo, OsintResult } from "@/lib/types";

interface Props {
  techniqueId: string;
}

export default function OsintPanel({ techniqueId }: Props) {
  const [data, setData] = useState<OsintResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.getOsint(techniqueId);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch OSINT data");
    } finally {
      setLoading(false);
    }
  }, [techniqueId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const result = await api.refreshOsint(techniqueId);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">
          Searching GitHub, arXiv, NVD...
        </p>
        <p className="text-xs text-gray-600">
          This may take a few seconds on first load
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 text-center">
        <p className="text-sm text-red-400">{error}</p>
        <button
          onClick={fetchData}
          className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data) return null;

  const totalResults =
    data.github_repos.length + data.arxiv_papers.length + data.nvd_cves.length;

  return (
    <div className="space-y-6">
      {/* Header with cache status and refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            {totalResults} result{totalResults !== 1 ? "s" : ""} from 3 sources
          </span>
          {data.cached && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              cached
            </span>
          )}
          {data.last_fetched && (
            <span className="text-[10px] text-gray-600">
              {new Date(data.last_fetched).toLocaleString()}
            </span>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-gray-100 transition-colors disabled:opacity-50"
        >
          <svg
            className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* GitHub Repos */}
      <GitHubSection repos={data.github_repos} />

      {/* arXiv Papers */}
      <ArxivSection papers={data.arxiv_papers} />

      {/* NVD CVEs */}
      <NvdSection cves={data.nvd_cves} />
    </div>
  );
}

function GitHubSection({ repos }: { repos: GitHubRepo[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
        <h3 className="text-sm font-semibold text-gray-200">
          GitHub Repositories
        </h3>
        <span className="text-xs text-gray-500">({repos.length})</span>
      </div>
      {repos.length === 0 ? (
        <p className="text-sm text-gray-600 pl-6">No repositories found</p>
      ) : (
        <div className="grid gap-2">
          {repos.map((repo) => (
            <a
              key={repo.repo_full_name}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 hover:border-gray-600 hover:bg-gray-800/80 transition-colors group block"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-indigo-400 group-hover:text-indigo-300 truncate">
                    {repo.repo_full_name}
                  </p>
                  {repo.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {repo.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {repo.language && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                      {repo.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    {repo.stars.toLocaleString()}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function ArxivSection({ papers }: { papers: OsintResult[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <h3 className="text-sm font-semibold text-gray-200">arXiv Papers</h3>
        <span className="text-xs text-gray-500">({papers.length})</span>
      </div>
      {papers.length === 0 ? (
        <p className="text-sm text-gray-600 pl-6">No papers found</p>
      ) : (
        <div className="grid gap-2">
          {papers.map((paper, i) => (
            <a
              key={paper.url || i}
              href={paper.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 hover:border-gray-600 hover:bg-gray-800/80 transition-colors group block"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-purple-400 group-hover:text-purple-300">
                    {paper.title}
                  </p>
                  {paper.summary && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {paper.summary}
                    </p>
                  )}
                </div>
                {paper.relevance_score != null && (
                  <RelevanceBadge score={paper.relevance_score} />
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function NvdSection({ cves }: { cves: OsintResult[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 className="text-sm font-semibold text-gray-200">NVD CVEs</h3>
        <span className="text-xs text-gray-500">({cves.length})</span>
      </div>
      {cves.length === 0 ? (
        <p className="text-sm text-gray-600 pl-6">No CVEs found</p>
      ) : (
        <div className="grid gap-2">
          {cves.map((cve, i) => (
            <a
              key={cve.url || i}
              href={cve.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 hover:border-gray-600 hover:bg-gray-800/80 transition-colors group block"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-mono font-medium text-rose-400 group-hover:text-rose-300">
                    {cve.title}
                  </p>
                  {cve.summary && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {cve.summary}
                    </p>
                  )}
                </div>
                {cve.relevance_score != null && (
                  <CvssBadge score={cve.relevance_score} />
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function RelevanceBadge({ score }: { score: number }) {
  const color =
    score >= 0.8
      ? "text-emerald-400 bg-emerald-500/10"
      : score >= 0.5
        ? "text-amber-400 bg-amber-500/10"
        : "text-gray-400 bg-gray-800";
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${color}`}>
      {Math.round(score * 100)}%
    </span>
  );
}

function CvssBadge({ score }: { score: number }) {
  // Score is normalized 0-1 (from CVSS 0-10)
  const cvss = score * 10;
  const color =
    cvss >= 7
      ? "text-red-400 bg-red-500/10"
      : cvss >= 4
        ? "text-amber-400 bg-amber-500/10"
        : "text-green-400 bg-green-500/10";
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 font-mono ${color}`}>
      CVSS {cvss.toFixed(1)}
    </span>
  );
}
