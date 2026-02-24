// NVIDIA AI Kill Chain framework stages and mappings to MITRE ATLAS tactics
// Reference: https://developer.nvidia.com/blog/modeling-attacks-on-ai-powered-apps-with-the-ai-kill-chain-framework/

export interface NvidiaStage {
  id: string;
  name: string;
  order: number;
  color: string;
  description: string;
  activities: string[];
  atlasTacticIds: string[];
}

export const NVIDIA_STAGES: NvidiaStage[] = [
  {
    id: "recon",
    name: "Recon",
    order: 1,
    color: "#6366f1", // indigo
    description:
      "Attackers map the system to plan their attack, identifying data ingestion routes, exploitable tools, open-source libraries, guardrail locations, and system memory usage. Recon is often interactive, with attackers probing the system to observe errors and behavior.",
    activities: [
      "Interactive probing to observe errors and system behavior",
      "Identifying data ingestion routes and model configurations",
      "Mapping exploitable tools and open-source libraries",
      "Locating guardrails and understanding system memory usage",
    ],
    atlasTacticIds: ["AML.TA0002", "AML.TA0008", "AML.TA0000"],
  },
  {
    id: "poison",
    name: "Poison",
    order: 2,
    color: "#8b5cf6", // violet
    description:
      "Attackers place malicious inputs into locations where they will be processed by the AI model. Two primary techniques dominate: direct prompt injection (attacker is the user) and indirect prompt injection (attacker poisons data ingested on behalf of other users).",
    activities: [
      "Direct prompt injection via normal user interactions",
      "Indirect prompt injection through pre-processed data",
      "Training data poisoning",
      "Adversarial examples and visual payload insertion",
    ],
    atlasTacticIds: ["AML.TA0004", "AML.TA0001", "AML.TA0003"],
  },
  {
    id: "hijack",
    name: "Hijack",
    order: 3,
    color: "#ec4899", // pink
    description:
      "The execution phase where recon data and poisoning payloads are weaponized to seize control of the AI's behavior, making the model an unwilling accomplice. The most critical threat is the abuse of the AI's integrated tools, triggering connected functions or APIs with malicious parameters.",
    activities: [
      "Forcing unauthorized tool calls and API abuse",
      "Encoding sensitive data into outputs for exfiltration",
      "Generating false or misleading information",
      "Context-specific payload triggering",
    ],
    atlasTacticIds: ["AML.TA0005", "AML.TA0007", "AML.TA0009"],
  },
  {
    id: "persist",
    name: "Persist",
    order: 4,
    color: "#f97316", // orange
    description:
      "Attackers embed malicious payloads into persistent storage, ensuring their influence survives beyond a single session. This includes session history poisoning, cross-session memory exploitation, and shared resource poisoning.",
    activities: [
      "Session history poisoning",
      "Cross-session memory exploitation",
      "Shared resource poisoning",
      "Agentic plan hijacking",
    ],
    atlasTacticIds: ["AML.TA0006", "AML.TA0012", "AML.TA0014"],
  },
  {
    id: "impact",
    name: "Impact",
    order: 5,
    color: "#dc2626", // red
    description:
      "Hijacked outputs trigger actions affecting systems, data, or users beyond the model itself. Damage takes multiple forms from data exfiltration via encoded outputs to unauthorized execution of commands, potentially leading to remote code execution.",
    activities: [
      "State-changing modifications to systems",
      "Unauthorized financial transactions",
      "Data exfiltration via benign-looking outputs",
      "External communications and command execution",
    ],
    atlasTacticIds: ["AML.TA0010", "AML.TA0011", "AML.TA0015"],
  },
  {
    id: "iterate",
    name: "Iterate / Pivot",
    order: 6,
    color: "#6b7280", // gray
    description:
      "In agentic systems, attackers exploit feedback loops to escalate control by poisoning additional data sources, rewriting agent goals, or establishing command-and-control mechanisms. This stage represents the cyclical nature of advanced AI attacks.",
    activities: [
      "Poisoning additional data sources",
      "Rewriting agent goals and plans",
      "Establishing command-and-control channels",
      "Escalating from single-session to multi-system compromise",
    ],
    atlasTacticIds: ["AML.TA0013", "AML.TA0014", "AML.TA0015"],
  },
];

// Map from ATLAS tactic ID to human-readable name
export const ATLAS_TACTIC_NAMES: Record<string, string> = {
  "AML.TA0002": "Reconnaissance",
  "AML.TA0003": "Resource Development",
  "AML.TA0004": "Initial Access",
  "AML.TA0000": "ML Model Access",
  "AML.TA0005": "Execution",
  "AML.TA0006": "Persistence",
  "AML.TA0012": "Privilege Escalation",
  "AML.TA0007": "Defense Evasion",
  "AML.TA0013": "Credential Access",
  "AML.TA0008": "Discovery",
  "AML.TA0015": "Lateral Movement",
  "AML.TA0009": "Collection",
  "AML.TA0001": "ML Attack Staging",
  "AML.TA0014": "Command and Control",
  "AML.TA0010": "Exfiltration",
  "AML.TA0011": "Impact",
};

// Short descriptions for ATLAS tactics
export const ATLAS_TACTIC_DESCRIPTIONS: Record<string, string> = {
  "AML.TA0002":
    "Gathering information to plan future adversarial operations against AI/ML systems.",
  "AML.TA0003":
    "Establishing resources to support adversarial ML operations, such as acquiring infrastructure or developing tools.",
  "AML.TA0004":
    "Gaining initial access to the target AI/ML system through techniques like supply chain compromise or valid accounts.",
  "AML.TA0000":
    "Gaining access to the target ML model through inference APIs or direct artifact access.",
  "AML.TA0005":
    "Running adversarial code or manipulating the ML system to perform adversary-controlled actions.",
  "AML.TA0006":
    "Maintaining a persistent foothold in the target ML system across restarts or updates.",
  "AML.TA0012":
    "Gaining elevated privileges within the ML system or its infrastructure.",
  "AML.TA0007":
    "Avoiding detection by security monitoring tools and ML model defenses.",
  "AML.TA0013":
    "Stealing credentials such as API keys, model access tokens, or training data access.",
  "AML.TA0008":
    "Exploring the target ML system to understand its configuration, capabilities, and vulnerabilities.",
  "AML.TA0015":
    "Moving through connected ML systems and infrastructure to reach additional targets.",
  "AML.TA0009":
    "Gathering training data, model parameters, or other valuable ML artifacts.",
  "AML.TA0001":
    "Preparing attacks targeting ML models, including adversarial example crafting and data poisoning.",
  "AML.TA0014":
    "Establishing communication channels to control compromised ML systems.",
  "AML.TA0010":
    "Stealing ML models, training data, or other AI/ML intellectual property.",
  "AML.TA0011":
    "Disrupting the availability, integrity, or confidentiality of ML systems and their outputs.",
};
