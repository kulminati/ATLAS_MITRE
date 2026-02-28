from __future__ import annotations

from pydantic import BaseModel


class TacticSummary(BaseModel):
    id: str
    name: str
    matrix_order: int
    technique_count: int


class TacticDetail(BaseModel):
    id: str
    name: str
    description: str
    matrix_order: int
    attck_id: str | None
    attck_url: str | None
    techniques: list[TechniqueSummary]


class TechniqueSummary(BaseModel):
    id: str
    name: str
    is_subtechnique: bool
    maturity: str | None
    tactic_ids: list[str]


class TechniqueDetail(BaseModel):
    id: str
    name: str
    description: str
    is_subtechnique: bool
    parent_technique_id: str | None
    maturity: str | None
    attck_id: str | None
    attck_url: str | None
    created_date: str | None
    modified_date: str | None
    tactic_ids: list[str]
    subtechniques: list[TechniqueSummary]
    mitigations: list[MitigationRef]
    case_studies: list[CaseStudySummary]


class MitigationRef(BaseModel):
    id: str
    name: str
    category: str | None
    usage: str | None


class MitigationDetail(BaseModel):
    id: str
    name: str
    description: str
    category: str | None
    attck_id: str | None
    attck_url: str | None
    lifecycle_stages: list[str]
    techniques: list[TechniqueRef]


class TechniqueRef(BaseModel):
    id: str
    name: str
    usage: str | None


class CaseStudySummary(BaseModel):
    id: str
    name: str
    incident_date: str | None
    case_study_type: str | None
    target: str | None


class CaseStudyDetail(BaseModel):
    id: str
    name: str
    summary: str
    incident_date: str | None
    incident_date_granularity: str | None
    reporter: str | None
    target: str | None
    actor: str | None
    case_study_type: str | None
    procedures: list[ProcedureStep]
    references: list[Reference]


class ProcedureStep(BaseModel):
    step_order: int
    tactic_id: str
    tactic_name: str
    technique_id: str
    technique_name: str
    description: str


class Reference(BaseModel):
    title: str | None
    url: str | None


class MatrixResponse(BaseModel):
    version: str
    tactics: list[TacticSummary]
    tactic_techniques: dict[str, list[TechniqueSummary]]


class SyncStatus(BaseModel):
    version: str | None
    last_updated: str | None
    tactics_count: int
    techniques_count: int
    case_studies_count: int
    needs_sync: bool


class KillchainStepSummary(BaseModel):
    step_order: int
    tactic_id: str | None
    tactic_name: str | None
    technique_id: str | None
    technique_name: str | None
    description: str | None


class FlowNode(BaseModel):
    id: str
    type: str = "custom"
    position: dict
    data: dict


class FlowEdge(BaseModel):
    id: str
    source: str
    target: str
    animated: bool = True
    style: dict | None = None


class KillchainSummary(BaseModel):
    id: int
    name: str
    source_case_study_id: str | None
    severity: str | None
    attack_category: str | None
    year: int | None
    step_count: int


class KillchainDetail(BaseModel):
    id: int
    name: str
    description: str | None
    source_case_study_id: str | None
    severity: str | None
    attack_category: str | None
    year: int | None
    steps: list[KillchainStepSummary]
    nodes: list[FlowNode]
    edges: list[FlowEdge]


class GraphNode(BaseModel):
    id: str
    name: str
    tactic_ids: list[str]
    maturity: str | None
    case_study_count: int


class GraphEdge(BaseModel):
    source: str
    target: str
    weight: int


class TechniqueGraph(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]


# ── Executive Report Models ──────────────────────────────────────────


class ExecutiveSummary(BaseModel):
    tactics_count: int
    techniques_total: int
    parent_techniques: int
    subtechniques: int
    techniques_by_maturity: dict[str, int]
    case_studies_count: int
    killchains_count: int
    mitigations_count: int


class TacticBreakdown(BaseModel):
    tactic_id: str
    tactic_name: str
    matrix_order: int
    technique_count: int
    case_study_count: int


class TopRiskTechnique(BaseModel):
    technique_id: str
    technique_name: str
    maturity: str | None
    is_subtechnique: bool
    case_study_count: int
    osint_signal: int
    risk_score: int


class OsintCoverage(BaseModel):
    total_techniques: int
    techniques_with_github: int
    techniques_with_arxiv: int
    techniques_with_cves: int
    total_github_repos: int
    total_arxiv_papers: int
    total_cves: int


class RecentCve(BaseModel):
    technique_id: str
    title: str | None
    url: str | None
    summary: str | None
    fetched_at: str | None


class TopGithubRepo(BaseModel):
    technique_id: str
    repo_full_name: str
    description: str | None
    stars: int
    language: str | None
    url: str


class OsintHighlights(BaseModel):
    recent_cves: list[RecentCve]
    top_github_repos: list[TopGithubRepo]


class ExecutiveReport(BaseModel):
    atlas_version: str
    last_sync: str | None
    executive_summary: ExecutiveSummary
    tactic_breakdown: list[TacticBreakdown]
    top_risk_techniques: list[TopRiskTechnique]
    killchain_severity_distribution: dict[str, int]
    attack_category_distribution: dict[str, int]
    osint_coverage: OsintCoverage
    osint_highlights: OsintHighlights


# ── Deep-Dive Models ────────────────────────────────────────────────


class LabTool(BaseModel):
    name: str
    url: str
    description: str


class DeepDiveResponse(BaseModel):
    technique_id: str
    how_it_works: str
    code_example: str
    defense_strategies: str
    lab_tools: list[LabTool]
    difficulty: str
    prerequisites: list[str]


# ── Detection Exercise Models ────────────────────────────────────────


class ExerciseLogSample(BaseModel):
    log_entry: str
    is_malicious: bool
    explanation: str


class ExerciseSolution(BaseModel):
    detection_logic: str
    logscale_query: str
    explanation: str


class ExerciseSummary(BaseModel):
    id: str
    title: str
    difficulty: str
    technique_ids: list[str]


class ExerciseDetail(BaseModel):
    id: str
    title: str
    difficulty: str
    technique_ids: list[str]
    scenario: str
    log_samples: list[ExerciseLogSample]
    hints: list[str]
    solution: ExerciseSolution
    false_positive_notes: str
