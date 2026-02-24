import type {
  MatrixResponse,
  TacticSummary,
  TacticDetail,
  TechniqueSummary,
  TechniqueDetail,
  CaseStudySummary,
  CaseStudyDetail,
  SyncStatus,
  OsintResponse,
  KillchainSummary,
  KillchainDetail,
  SearchResponse,
  TechniqueGraph,
  ExecutiveReport,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  getMatrix: () => fetchApi<MatrixResponse>("/api/matrix"),
  getTactics: () => fetchApi<TacticSummary[]>("/api/tactics"),
  getTactic: (id: string) => fetchApi<TacticDetail>(`/api/tactics/${id}`),
  getTechniques: (params?: { tactic_id?: string; maturity?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.tactic_id) searchParams.set("tactic_id", params.tactic_id);
    if (params?.maturity) searchParams.set("maturity", params.maturity);
    const qs = searchParams.toString();
    return fetchApi<TechniqueSummary[]>(`/api/techniques${qs ? `?${qs}` : ""}`);
  },
  getTechnique: (id: string) => fetchApi<TechniqueDetail>(`/api/techniques/${id}`),
  getCaseStudies: () => fetchApi<CaseStudySummary[]>("/api/case-studies"),
  getCaseStudy: (id: string) => fetchApi<CaseStudyDetail>(`/api/case-studies/${id}`),
  search: (q: string) =>
    fetchApi<SearchResponse>(`/api/search?q=${encodeURIComponent(q)}`),
  getSyncStatus: () => fetchApi<SyncStatus>("/api/sync/status"),
  triggerSync: () =>
    fetch(`${API_URL}/api/sync`, { method: "POST" }).then((r) => r.json()),
  getOsint: (techniqueId: string) =>
    fetchApi<OsintResponse>(`/api/osint/${techniqueId}`),
  refreshOsint: (techniqueId: string) =>
    fetch(`${API_URL}/api/osint/${techniqueId}/refresh`, { method: "POST" }).then(
      (r) => r.json() as Promise<OsintResponse>
    ),
  getKillchains: (params?: { category?: string; severity?: string }) => {
    const sp = new URLSearchParams();
    if (params?.category) sp.set("category", params.category);
    if (params?.severity) sp.set("severity", params.severity);
    const qs = sp.toString();
    return fetchApi<KillchainSummary[]>(`/api/killchains${qs ? `?${qs}` : ""}`);
  },
  getKillchain: (id: number) => fetchApi<KillchainDetail>(`/api/killchains/${id}`),
  getKillchainCategories: () => fetchApi<string[]>("/api/killchains/categories"),
  seedKillchains: () =>
    fetch(`${API_URL}/api/killchains/seed`, { method: "POST" }).then((r) => r.json()),
  getTechniqueGraph: () => fetchApi<TechniqueGraph>("/api/techniques/graph"),
  getExecutiveReport: () => fetchApi<ExecutiveReport>("/api/reports/executive"),
};
