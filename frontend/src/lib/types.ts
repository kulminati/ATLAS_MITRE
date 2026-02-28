export interface TacticSummary {
  id: string;
  name: string;
  matrix_order: number;
  technique_count: number;
}

export interface TacticDetail {
  id: string;
  name: string;
  description: string;
  matrix_order: number;
  attck_id: string | null;
  attck_url: string | null;
  techniques: TechniqueSummary[];
}

export interface TechniqueSummary {
  id: string;
  name: string;
  is_subtechnique: boolean;
  maturity: string | null;
  tactic_ids: string[];
}

export interface TechniqueDetail {
  id: string;
  name: string;
  description: string;
  is_subtechnique: boolean;
  parent_technique_id: string | null;
  maturity: string | null;
  attck_id: string | null;
  attck_url: string | null;
  created_date: string | null;
  modified_date: string | null;
  tactic_ids: string[];
  subtechniques: TechniqueSummary[];
  mitigations: MitigationRef[];
  case_studies: CaseStudySummary[];
}

export interface MitigationRef {
  id: string;
  name: string;
  category: string | null;
  usage: string | null;
}

export interface CaseStudySummary {
  id: string;
  name: string;
  incident_date: string | null;
  case_study_type: string | null;
  target: string | null;
}

export interface CaseStudyDetail {
  id: string;
  name: string;
  summary: string;
  incident_date: string | null;
  incident_date_granularity: string | null;
  reporter: string | null;
  target: string | null;
  actor: string | null;
  case_study_type: string | null;
  procedures: ProcedureStep[];
  references: Reference[];
}

export interface ProcedureStep {
  step_order: number;
  tactic_id: string;
  tactic_name: string;
  technique_id: string;
  technique_name: string;
  description: string;
}

export interface Reference {
  title: string | null;
  url: string | null;
}

export interface MatrixResponse {
  version: string;
  tactics: TacticSummary[];
  tactic_techniques: Record<string, TechniqueSummary[]>;
}

export interface SyncStatus {
  version: string | null;
  last_updated: string | null;
  tactics_count: number;
  techniques_count: number;
  case_studies_count: number;
  needs_sync: boolean;
}

export interface GitHubRepo {
  repo_full_name: string;
  description: string | null;
  stars: number;
  language: string | null;
  url: string;
  category: string | null;
  last_updated: string | null;
}

export interface OsintResult {
  title: string | null;
  url: string | null;
  summary: string | null;
  relevance_score: number | null;
  fetched_at: string | null;
}

export interface OsintResponse {
  technique_id: string;
  github_repos: GitHubRepo[];
  arxiv_papers: OsintResult[];
  nvd_cves: OsintResult[];
  cached: boolean;
  last_fetched: string | null;
}

export interface KillchainSummary {
  id: number;
  name: string;
  source_case_study_id: string | null;
  severity: string | null;
  attack_category: string | null;
  year: number | null;
  step_count: number;
}

export interface KillchainStepSummary {
  step_order: number;
  tactic_id: string | null;
  tactic_name: string | null;
  technique_id: string | null;
  technique_name: string | null;
  description: string | null;
}

export interface KillchainDetail {
  id: number;
  name: string;
  description: string | null;
  source_case_study_id: string | null;
  severity: string | null;
  attack_category: string | null;
  year: number | null;
  steps: KillchainStepSummary[];
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    tactic_id: string;
    tactic_name: string;
    technique_id: string;
    technique_name: string;
    description: string;
    color: string;
    step_order: number;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  animated: boolean;
  style?: Record<string, unknown>;
}

export interface GraphNode {
  id: string;
  name: string;
  tactic_ids: string[];
  maturity: string | null;
  case_study_count: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
}

export interface TechniqueGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface SearchResultTechnique {
  id: string;
  name: string;
  description: string | null;
}

export interface SearchResultCaseStudy {
  id: string;
  name: string;
  summary: string | null;
}

export interface SearchResponse {
  techniques: SearchResultTechnique[];
  case_studies: SearchResultCaseStudy[];
}

// ── Executive Report Types ──────────────────────────────────────────

export interface ExecutiveSummary {
  tactics_count: number;
  techniques_total: number;
  parent_techniques: number;
  subtechniques: number;
  techniques_by_maturity: Record<string, number>;
  case_studies_count: number;
  killchains_count: number;
  mitigations_count: number;
}

export interface TacticBreakdown {
  tactic_id: string;
  tactic_name: string;
  matrix_order: number;
  technique_count: number;
  case_study_count: number;
}

export interface TopRiskTechnique {
  technique_id: string;
  technique_name: string;
  maturity: string | null;
  is_subtechnique: boolean;
  case_study_count: number;
  osint_signal: number;
  risk_score: number;
}

export interface OsintCoverage {
  total_techniques: number;
  techniques_with_github: number;
  techniques_with_arxiv: number;
  techniques_with_cves: number;
  total_github_repos: number;
  total_arxiv_papers: number;
  total_cves: number;
}

export interface RecentCve {
  technique_id: string;
  title: string | null;
  url: string | null;
  summary: string | null;
  fetched_at: string | null;
}

export interface TopGithubRepo {
  technique_id: string;
  repo_full_name: string;
  description: string | null;
  stars: number;
  language: string | null;
  url: string;
}

export interface OsintHighlights {
  recent_cves: RecentCve[];
  top_github_repos: TopGithubRepo[];
}

export interface ExecutiveReport {
  atlas_version: string;
  last_sync: string | null;
  executive_summary: ExecutiveSummary;
  tactic_breakdown: TacticBreakdown[];
  top_risk_techniques: TopRiskTechnique[];
  killchain_severity_distribution: Record<string, number>;
  attack_category_distribution: Record<string, number>;
  osint_coverage: OsintCoverage;
  osint_highlights: OsintHighlights;
}

// ── Deep-Dive Types ────────────────────────────────────────────────

export interface LabTool {
  name: string;
  url: string;
  description: string;
}

export interface DeepDiveResponse {
  technique_id: string;
  how_it_works: string;
  code_example: string;
  defense_strategies: string;
  lab_tools: LabTool[];
  difficulty: string;
  prerequisites: string[];
}

// ── Detection Exercise Types ────────────────────────────────────────

export interface ExerciseLogSample {
  log_entry: string;
  is_malicious: boolean;
  explanation: string;
}

export interface ExerciseSolution {
  detection_logic: string;
  logscale_query: string;
  explanation: string;
}

export interface ExerciseSummary {
  id: string;
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  technique_ids: string[];
}

export interface ExerciseDetail {
  id: string;
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  technique_ids: string[];
  scenario: string;
  log_samples: ExerciseLogSample[];
  hints: string[];
  solution: ExerciseSolution;
  false_positive_notes: string;
}

// ── Learning Path Types ─────────────────────────────────────────────

export interface LearningModule {
  title: string;
  description: string;
  type: "read" | "exercise" | "explore" | "activity";
  link: string;
  techniqueId?: string;
  keyConcepts: string[];
}

export interface LearningPath {
  id: string;
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "beginner-intermediate";
  description: string;
  estimatedTime: string;
  modules: LearningModule[];
}
