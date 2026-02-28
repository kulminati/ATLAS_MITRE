// ── Threat Model Wizard Static Data ─────────────────────────────────
// Maps AI system types, deployments, and access levels to ATLAS techniques

export interface AISystemType {
  id: string;
  name: string;
  description: string;
  icon: string; // SVG path data for a 24x24 viewBox
}

export interface DeploymentModel {
  id: string;
  name: string;
  description: string;
}

export interface AccessLevel {
  id: string;
  name: string;
  description: string;
}

export interface DeploymentRisk {
  risk_factor: number; // 1.0 = baseline, higher = more risk
  explanation: string;
}

// ── AI System Types ─────────────────────────────────────────────────

export const AI_SYSTEM_TYPES: AISystemType[] = [
  {
    id: "llm",
    name: "Large Language Model",
    description:
      "GPT-style models, chatbots, text generation, code assistants, and RAG systems",
    icon: "M8 9h8m-8 4h6m4-10H6a2 2 0 00-2 2v14l4-4h10a2 2 0 002-2V5a2 2 0 00-2-2z",
  },
  {
    id: "cv",
    name: "Computer Vision",
    description:
      "Image classification, object detection, facial recognition, and autonomous driving perception",
    icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  },
  {
    id: "nlp",
    name: "NLP / Text Classification",
    description:
      "Sentiment analysis, spam detection, named entity recognition, and document classification",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    id: "recsys",
    name: "Recommendation System",
    description:
      "Content recommendation, product suggestions, news feeds, and collaborative filtering",
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  },
  {
    id: "genai",
    name: "Generative AI / Diffusion",
    description:
      "Image generation, audio synthesis, deepfakes, video generation, and multimodal models",
    icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    id: "rl",
    name: "Reinforcement Learning",
    description:
      "Game-playing agents, robotics control, autonomous systems, and optimization policies",
    icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    id: "tabular",
    name: "Tabular / Structured Data ML",
    description:
      "Fraud detection, credit scoring, medical diagnosis, and predictive analytics on structured data",
    icon: "M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
  },
];

// ── Deployment Models ───────────────────────────────────────────────

export const DEPLOYMENT_MODELS: DeploymentModel[] = [
  {
    id: "cloud_api",
    name: "Cloud API / SaaS",
    description:
      "Model served via REST API or managed service (e.g., OpenAI API, AWS SageMaker endpoints)",
  },
  {
    id: "on_premise",
    name: "On-Premise",
    description:
      "Model deployed on organization-controlled infrastructure behind a firewall",
  },
  {
    id: "edge",
    name: "Edge / Mobile",
    description:
      "Model deployed on edge devices, mobile phones, or IoT hardware with limited connectivity",
  },
  {
    id: "embedded",
    name: "Embedded in Product",
    description:
      "Model bundled inside a software product or SDK distributed to end users",
  },
  {
    id: "open_source",
    name: "Open Source Model",
    description:
      "Model weights and architecture are publicly available (e.g., Hugging Face, GitHub)",
  },
];

// ── Access Levels ───────────────────────────────────────────────────

export const ACCESS_LEVELS: AccessLevel[] = [
  {
    id: "black_box",
    name: "Black-Box (API Only)",
    description:
      "Attacker can only query the model via an API and observe outputs. No knowledge of architecture or weights.",
  },
  {
    id: "gray_box",
    name: "Gray-Box (Partial Info)",
    description:
      "Attacker knows the model architecture, training dataset characteristics, or has limited access to internals.",
  },
  {
    id: "white_box",
    name: "White-Box (Full Access)",
    description:
      "Attacker has complete access to model weights, architecture, training data, and configuration.",
  },
];

// ── Technique Mappings per AI System Type ────────────────────────────
// Maps system type IDs to arrays of ATLAS technique IDs that are relevant.
// "universal" key lists techniques applicable to ALL system types.

export const TECHNIQUE_MAPPINGS: Record<string, string[]> = {
  // Universal techniques relevant to all AI system types
  universal: [
    // Reconnaissance
    "AML.T0000", // Active Scanning
    "AML.T0001", // Search for Victim's Publicly Available Research Materials
    "AML.T0002", // Search for Publicly Available Adversarial Vulnerability Analysis
    "AML.T0003", // Search for Technical Information via Victim Website
    "AML.T0004", // Search Victim-Owned Websites
    // Resource Development
    "AML.T0005", // Acquire ML Artifacts — Clone Model
    "AML.T0005.000", // Acquire ML Artifacts: Clone Model
    "AML.T0005.001", // Acquire ML Artifacts: Purchase/download
    "AML.T0005.002", // Acquire ML Artifacts: Data
    "AML.T0006", // Acquire Infrastructure
    "AML.T0007", // Develop Capabilities
    "AML.T0008", // Establish Accounts
    "AML.T0009", // Obtain Capabilities
    // Initial Access
    "AML.T0010", // ML Supply Chain Compromise
    "AML.T0010.000", // Supply Chain: GPU Hardware
    "AML.T0010.001", // Supply Chain: Model Repository
    "AML.T0010.002", // Supply Chain: Exploiting Publicly Available Models
    "AML.T0011", // User Execution
    "AML.T0012", // Valid Accounts
    // ML Model Access
    "AML.T0055", // Full ML Model Access
    "AML.T0056", // ML Model Inference API Access
    // Persistence
    "AML.T0058", // Modify Training Data
    "AML.T0058.000", // Modify Training Data: Data Injection
    "AML.T0058.001", // Modify Training Data: Label Corruption
    // Defense Evasion
    "AML.T0060", // Evade ML Model
    "AML.T0060.000", // Evade ML Model: Adversarial Inputs
    "AML.T0060.001", // Evade ML Model: Model Stealing
    "AML.T0060.002", // Evade ML Model: Adversarial Patches
    // Exfiltration
    "AML.T0024", // Exfiltration via ML Inference API
    "AML.T0057", // Exfiltrate via Cyber Means
    // Impact
    "AML.T0029", // Denial of ML Service
    "AML.T0034", // Cost Harvesting
    "AML.T0047", // ML Intellectual Property Theft
    "AML.T0048", // External Harms
    "AML.T0048.000", // External Harms: Financial Harms
    "AML.T0048.001", // External Harms: Reputational Harms
    "AML.T0048.002", // External Harms: Societal Harms
    "AML.T0048.003", // External Harms: User Harms
    "AML.T0048.004", // External Harms: ML Application Harms
    "AML.T0049", // System Misuse
    "AML.T0049.000", // System Misuse: Spamming ML System
    "AML.T0049.001", // System Misuse: Financial Fraud
    // Collection
    "AML.T0025", // Exfiltration via ML Inference API (collection)
    "AML.T0035", // ML Artifact Collection
    // Discovery
    "AML.T0044", // Full ML Model Access (Discovery)
    "AML.T0045", // ML Model Inference API Access (Discovery)
  ],

  // Large Language Model specific techniques
  llm: [
    "AML.T0051", // LLM Prompt Injection
    "AML.T0051.000", // Prompt Injection: Direct
    "AML.T0051.001", // Prompt Injection: Indirect
    "AML.T0052", // Phishing via AI System
    "AML.T0053", // LLM Jailbreak
    "AML.T0054", // LLM Meta Prompt Extraction
    "AML.T0043", // Craft Adversarial Data
    "AML.T0043.004", // Craft Adversarial Data: Insert Backdoor Trigger
    "AML.T0050", // Command and Control via AI System
    "AML.T0040", // ML Model Inference API Access
    "AML.T0042", // Verify Attack
    "AML.T0046", // Discover ML Artifacts
    "AML.T0015", // Establish Foothold
  ],

  // Computer Vision specific techniques
  cv: [
    "AML.T0043", // Craft Adversarial Data
    "AML.T0043.000", // Craft Adversarial Data: Adversarial Examples
    "AML.T0043.001", // Craft Adversarial Data: Adversarial Patches
    "AML.T0043.002", // Craft Adversarial Data: Adversarial Environment
    "AML.T0043.003", // Craft Adversarial Data: Physical Environment
    "AML.T0043.004", // Craft Adversarial Data: Insert Backdoor Trigger
    "AML.T0017", // Develop Adversarial ML Attack Capabilities
    "AML.T0018", // Backdoor ML Model
    "AML.T0019", // Publish Poisoned ML Model
    "AML.T0031", // Erode ML Model Integrity
    "AML.T0036", // Data from Information Repositories
    "AML.T0042", // Verify Attack
    "AML.T0060.002", // Evade ML Model: Adversarial Patches
  ],

  // NLP / Text Classification specific techniques
  nlp: [
    "AML.T0043", // Craft Adversarial Data
    "AML.T0043.000", // Craft Adversarial Data: Adversarial Examples
    "AML.T0043.004", // Craft Adversarial Data: Insert Backdoor Trigger
    "AML.T0017", // Develop Adversarial ML Attack Capabilities
    "AML.T0018", // Backdoor ML Model
    "AML.T0019", // Publish Poisoned ML Model
    "AML.T0031", // Erode ML Model Integrity
    "AML.T0036", // Data from Information Repositories
    "AML.T0042", // Verify Attack
  ],

  // Recommendation System specific techniques
  recsys: [
    "AML.T0043", // Craft Adversarial Data
    "AML.T0043.000", // Craft Adversarial Data: Adversarial Examples
    "AML.T0043.004", // Craft Adversarial Data: Insert Backdoor Trigger
    "AML.T0017", // Develop Adversarial ML Attack Capabilities
    "AML.T0031", // Erode ML Model Integrity
    "AML.T0036", // Data from Information Repositories
    "AML.T0049", // System Misuse
    "AML.T0049.000", // System Misuse: Spamming ML System
    "AML.T0042", // Verify Attack
  ],

  // Generative AI / Diffusion specific techniques
  genai: [
    "AML.T0051", // LLM Prompt Injection (multimodal prompts)
    "AML.T0051.000", // Prompt Injection: Direct
    "AML.T0051.001", // Prompt Injection: Indirect
    "AML.T0053", // LLM Jailbreak (model guardrail bypass)
    "AML.T0043", // Craft Adversarial Data
    "AML.T0043.000", // Craft Adversarial Data: Adversarial Examples
    "AML.T0043.004", // Craft Adversarial Data: Insert Backdoor Trigger
    "AML.T0017", // Develop Adversarial ML Attack Capabilities
    "AML.T0018", // Backdoor ML Model
    "AML.T0019", // Publish Poisoned ML Model
    "AML.T0031", // Erode ML Model Integrity
    "AML.T0042", // Verify Attack
    "AML.T0050", // Command and Control via AI System
  ],

  // Reinforcement Learning specific techniques
  rl: [
    "AML.T0043", // Craft Adversarial Data
    "AML.T0043.000", // Craft Adversarial Data: Adversarial Examples
    "AML.T0043.002", // Craft Adversarial Data: Adversarial Environment
    "AML.T0043.003", // Craft Adversarial Data: Physical Environment
    "AML.T0017", // Develop Adversarial ML Attack Capabilities
    "AML.T0018", // Backdoor ML Model
    "AML.T0031", // Erode ML Model Integrity
    "AML.T0042", // Verify Attack
  ],

  // Tabular / Structured Data ML specific techniques
  tabular: [
    "AML.T0043", // Craft Adversarial Data
    "AML.T0043.000", // Craft Adversarial Data: Adversarial Examples
    "AML.T0043.004", // Craft Adversarial Data: Insert Backdoor Trigger
    "AML.T0017", // Develop Adversarial ML Attack Capabilities
    "AML.T0018", // Backdoor ML Model
    "AML.T0019", // Publish Poisoned ML Model
    "AML.T0031", // Erode ML Model Integrity
    "AML.T0036", // Data from Information Repositories
    "AML.T0042", // Verify Attack
  ],
};

// ── Deployment Risk Modifiers ───────────────────────────────────────

export const DEPLOYMENT_RISKS: Record<string, DeploymentRisk> = {
  cloud_api: {
    risk_factor: 1.0,
    explanation:
      "Standard risk profile. API endpoints are accessible remotely but can be rate-limited and monitored.",
  },
  on_premise: {
    risk_factor: 0.7,
    explanation:
      "Lower external risk due to network isolation, but insider threats and lateral movement are concerns.",
  },
  edge: {
    risk_factor: 1.3,
    explanation:
      "Higher risk due to physical access potential, limited monitoring, and difficulty patching deployed models.",
  },
  embedded: {
    risk_factor: 1.5,
    explanation:
      "Highest risk for model extraction. Distributed binaries can be reverse-engineered to extract weights.",
  },
  open_source: {
    risk_factor: 1.4,
    explanation:
      "Full white-box access by default. Attackers can study architecture and craft targeted attacks offline.",
  },
};

// ── Access Level -> Additional Technique Modifiers ──────────────────
// Techniques that become relevant at specific access levels

export const ACCESS_LEVEL_TECHNIQUES: Record<string, string[]> = {
  black_box: [
    // Only query-based attacks possible
    "AML.T0056", // ML Model Inference API Access
    "AML.T0040", // ML Model Inference API Access (execution)
    "AML.T0024", // Exfiltration via ML Inference API
    "AML.T0045", // ML Model Inference API Access (Discovery)
  ],
  gray_box: [
    // Partial knowledge enables more targeted attacks
    "AML.T0056", // ML Model Inference API Access
    "AML.T0055", // Full ML Model Access
    "AML.T0040", // ML Model Inference API Access (execution)
    "AML.T0024", // Exfiltration via ML Inference API
    "AML.T0044", // Full ML Model Access (Discovery)
    "AML.T0045", // ML Model Inference API Access (Discovery)
    "AML.T0046", // Discover ML Artifacts
    "AML.T0017", // Develop Adversarial ML Attack Capabilities
  ],
  white_box: [
    // Full access enables all attack vectors
    "AML.T0055", // Full ML Model Access
    "AML.T0056", // ML Model Inference API Access
    "AML.T0040", // ML Model Inference API Access (execution)
    "AML.T0024", // Exfiltration via ML Inference API
    "AML.T0044", // Full ML Model Access (Discovery)
    "AML.T0045", // ML Model Inference API Access (Discovery)
    "AML.T0046", // Discover ML Artifacts
    "AML.T0035", // ML Artifact Collection
    "AML.T0017", // Develop Adversarial ML Attack Capabilities
    "AML.T0018", // Backdoor ML Model
    "AML.T0047", // ML Intellectual Property Theft
  ],
};

// ── Helper: Compute applicable technique IDs ────────────────────────

export function getApplicableTechniqueIds(
  systemTypeIds: string[],
  accessLevelId: string
): string[] {
  const ids = new Set<string>();

  // Add universal techniques
  for (const id of TECHNIQUE_MAPPINGS.universal) {
    ids.add(id);
  }

  // Add system-type-specific techniques
  for (const sysType of systemTypeIds) {
    const mapping = TECHNIQUE_MAPPINGS[sysType];
    if (mapping) {
      for (const id of mapping) {
        ids.add(id);
      }
    }
  }

  // Add access-level techniques
  const accessTechs = ACCESS_LEVEL_TECHNIQUES[accessLevelId];
  if (accessTechs) {
    for (const id of accessTechs) {
      ids.add(id);
    }
  }

  return Array.from(ids);
}

// ── Risk Score Computation ──────────────────────────────────────────

export function computeRiskLevel(
  deploymentId: string,
  accessLevelId: string
): { level: "low" | "medium" | "high" | "critical"; score: number } {
  const deploymentRisk = DEPLOYMENT_RISKS[deploymentId]?.risk_factor ?? 1.0;

  const accessMultiplier =
    accessLevelId === "white_box"
      ? 1.5
      : accessLevelId === "gray_box"
        ? 1.2
        : 1.0;

  const score = deploymentRisk * accessMultiplier;

  if (score >= 1.8) return { level: "critical", score };
  if (score >= 1.3) return { level: "high", score };
  if (score >= 0.9) return { level: "medium", score };
  return { level: "low", score };
}
