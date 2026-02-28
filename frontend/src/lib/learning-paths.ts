import type { LearningPath } from "./types";

export const learningPaths: LearningPath[] = [
  {
    id: "ai-security-fundamentals",
    title: "AI Security Fundamentals",
    difficulty: "beginner",
    description:
      "Start here if you're new to adversarial ML. Learn the core concepts behind AI/ML attacks and the ATLAS framework.",
    estimatedTime: "2-3 hours",
    modules: [
      {
        title: "Understanding the ATLAS Framework",
        description:
          "Learn the structure of MITRE ATLAS by exploring the threat matrix. Understand how tactics represent attacker goals and techniques represent how those goals are achieved.",
        type: "read",
        link: "/",
        keyConcepts: [
          "Tactics vs techniques",
          "Kill chain phases",
          "ATLAS matrix structure",
        ],
      },
      {
        title: "ATLAS vs NVIDIA Comparison",
        description:
          "Compare the ATLAS and NVIDIA AI security frameworks to understand different perspectives on categorizing AI threats.",
        type: "explore",
        link: "/compare",
        keyConcepts: [
          "Framework differences",
          "Coverage analysis",
          "Complementary perspectives",
        ],
      },
      {
        title: "Adversarial Examples 101",
        description:
          "Understand how small, carefully crafted perturbations can cause ML models to produce incorrect outputs with high confidence.",
        type: "read",
        link: "/technique/AML.T0043",
        techniqueId: "AML.T0043",
        keyConcepts: [
          "Adversarial perturbations",
          "Model misclassification",
          "Evasion attacks",
        ],
      },
      {
        title: "Prompt Injection Basics",
        description:
          "Explore how attackers manipulate LLM behavior by injecting malicious instructions into prompts, both directly and indirectly.",
        type: "read",
        link: "/technique/AML.T0051",
        techniqueId: "AML.T0051",
        keyConcepts: [
          "Direct prompt injection",
          "Indirect prompt injection",
          "LLM manipulation",
        ],
      },
      {
        title: "Data Poisoning",
        description:
          "Learn how adversaries corrupt training data to influence model behavior at inference time, one of the most impactful attack vectors.",
        type: "read",
        link: "/technique/AML.T0020",
        techniqueId: "AML.T0020",
        keyConcepts: [
          "Training vs inference time attacks",
          "Backdoor injection",
          "Data integrity",
        ],
      },
      {
        title: "Explore the Technique Graph",
        description:
          "Visualize relationships between techniques to understand how attacks chain together and how the threat landscape is interconnected.",
        type: "explore",
        link: "/graph",
        keyConcepts: [
          "Technique relationships",
          "Attack chaining",
          "Threat landscape visualization",
        ],
      },
      {
        title: "Threat Model Your First AI System",
        description:
          "Use the interactive threat modeling wizard to assess threats against a common AI deployment scenario. Walk through system type, deployment, and access level selections.",
        type: "explore",
        link: "/threat-model",
        keyConcepts: [
          "AI threat modeling",
          "Risk assessment basics",
          "Attack surface identification",
        ],
      },
    ],
  },
  {
    id: "llm-security-deep-dive",
    title: "LLM Security Deep Dive",
    difficulty: "intermediate",
    description:
      "Focus on threats specific to large language models, RAG systems, and AI agents. Build practical understanding of LLM attack surfaces.",
    estimatedTime: "4-5 hours",
    modules: [
      {
        title: "LLM Prompt Injection",
        description:
          "Deep dive into prompt injection attacks: how they work, why they're difficult to defend against, and real-world examples of exploitation.",
        type: "read",
        link: "/technique/AML.T0051",
        techniqueId: "AML.T0051",
        keyConcepts: [
          "System prompt extraction",
          "Instruction override",
          "Delimiter attacks",
        ],
      },
      {
        title: "LLM Jailbreaking",
        description:
          "Understand jailbreak techniques that bypass LLM safety guardrails and content filters to produce restricted outputs.",
        type: "read",
        link: "/technique/AML.T0054",
        techniqueId: "AML.T0054",
        keyConcepts: [
          "Safety filter bypass",
          "Role-playing exploits",
          "Multi-turn jailbreaks",
        ],
      },
      {
        title: "LLM Meta Prompt Extraction",
        description:
          "Learn how attackers extract system prompts and hidden instructions from language models, revealing confidential configurations.",
        type: "read",
        link: "/technique/AML.T0056",
        techniqueId: "AML.T0056",
        keyConcepts: [
          "System prompt leakage",
          "Instruction extraction",
          "Confidentiality breach",
        ],
      },
      {
        title: "Poisoning Training Data",
        description:
          "Explore how poisoned web content, documents, and code repositories can corrupt LLM training pipelines and RAG knowledge bases.",
        type: "read",
        link: "/technique/AML.T0020",
        techniqueId: "AML.T0020",
        keyConcepts: [
          "RAG poisoning",
          "Web-scale data corruption",
          "Supply chain attacks on data",
        ],
      },
      {
        title: "Discover Published ML Model",
        description:
          "Understand how attackers find and target publicly available ML models, the first step in many AI attack chains.",
        type: "read",
        link: "/technique/AML.T0002",
        techniqueId: "AML.T0002",
        keyConcepts: [
          "Model discovery",
          "Public model registries",
          "Attack surface enumeration",
        ],
      },
      {
        title: "Explore LLM-Related Case Studies",
        description:
          "Browse killchain visualizations of real-world attacks against LLM systems and AI-powered applications.",
        type: "explore",
        link: "/killchain",
        keyConcepts: [
          "Real-world LLM attacks",
          "Attack progression",
          "Kill chain analysis",
        ],
      },
      {
        title: "Search for LLM Threats in OSINT",
        description:
          "Use the platform's search to find the latest research, CVEs, and GitHub repositories related to LLM security threats.",
        type: "explore",
        link: "/search",
        keyConcepts: [
          "Threat intelligence gathering",
          "CVE monitoring",
          "Research discovery",
        ],
      },
    ],
  },
  {
    id: "detection-engineering-ai",
    title: "Detection Engineering for AI",
    difficulty: "advanced",
    description:
      "Learn to build detection strategies for AI/ML attacks. Requires familiarity with SIEM, log analysis, and security monitoring.",
    estimatedTime: "6-8 hours",
    modules: [
      {
        title: "Detection Methodology Overview",
        description:
          "Study the ATLAS matrix to identify which tactics and techniques are most detectable, and prioritize detection development using maturity levels.",
        type: "read",
        link: "/",
        keyConcepts: [
          "Detection prioritization",
          "Maturity-based analysis",
          "Coverage mapping",
        ],
      },
      {
        title: "Understanding ML Attack Staging",
        description:
          "Analyze the ML Attack Staging tactic to understand how adversaries prepare and execute attacks against ML systems, and identify detection opportunities.",
        type: "read",
        link: "/technique/AML.T0043",
        techniqueId: "AML.T0043",
        keyConcepts: [
          "Adversarial example craft detection",
          "Input anomaly detection",
          "Model query monitoring",
        ],
      },
      {
        title: "Analyzing Attack Kill Chains",
        description:
          "Study complete attack kill chains to understand the full attack lifecycle. Identify the earliest detectable phase in each chain.",
        type: "explore",
        link: "/killchain",
        keyConcepts: [
          "Kill chain decomposition",
          "Early detection opportunities",
          "Lateral movement indicators",
        ],
      },
      {
        title: "Model Inference API Access Patterns",
        description:
          "Study how attackers interact with ML model APIs. Learn to distinguish legitimate usage from reconnaissance and attack patterns.",
        type: "read",
        link: "/technique/AML.T0040",
        techniqueId: "AML.T0040",
        keyConcepts: [
          "API abuse detection",
          "Query rate analysis",
          "Anomalous input patterns",
        ],
      },
      {
        title: "Exfiltration via ML Inference API",
        description:
          "Understand how data exfiltration occurs through ML model APIs and build detection rules for unusual extraction patterns.",
        type: "read",
        link: "/technique/AML.T0024",
        techniqueId: "AML.T0024",
        keyConcepts: [
          "Model extraction indicators",
          "API response monitoring",
          "Data loss prevention for ML",
        ],
      },
      {
        title: "Hands-On Detection Exercises",
        description:
          "Practice writing detection queries using CrowdStrike LogScale against simulated AI attack scenarios. Start with beginner exercises and progress to advanced.",
        type: "explore",
        link: "/exercises",
        keyConcepts: [
          "LogScale query writing",
          "Log analysis for AI attacks",
          "Detection rule development",
        ],
      },
      {
        title: "OSINT for Detection Rules",
        description:
          "Research open-source intelligence to find indicators of compromise and attack signatures specific to AI/ML systems.",
        type: "explore",
        link: "/search",
        keyConcepts: [
          "IOC identification",
          "CVE-to-detection mapping",
          "Community detection rules",
        ],
      },
      {
        title: "Executive Reporting for Detection Programs",
        description:
          "Learn to use executive reports to communicate detection coverage, gaps, and risk metrics to leadership.",
        type: "read",
        link: "/reports",
        keyConcepts: [
          "Detection coverage metrics",
          "Risk communication",
          "Gap analysis reporting",
        ],
      },
    ],
  },
  {
    id: "red-team-ai-operations",
    title: "Red Team AI Operations",
    difficulty: "advanced",
    description:
      "Understand the attacker's perspective. Learn how AI systems are compromised end-to-end through real-world attack chains.",
    estimatedTime: "5-6 hours",
    modules: [
      {
        title: "Reconnaissance of ML Systems",
        description:
          "Learn how attackers gather information about target ML systems, including model architecture, training data, and deployment infrastructure.",
        type: "read",
        link: "/technique/AML.T0002",
        techniqueId: "AML.T0002",
        keyConcepts: [
          "Model fingerprinting",
          "Architecture inference",
          "Deployment mapping",
        ],
      },
      {
        title: "Gaining ML Model Access",
        description:
          "Explore the various ways attackers obtain access to ML models, from public APIs to compromised internal systems.",
        type: "read",
        link: "/technique/AML.T0040",
        techniqueId: "AML.T0040",
        keyConcepts: [
          "API exploitation",
          "Model access levels",
          "Black-box vs white-box access",
        ],
      },
      {
        title: "Attack Staging and Execution",
        description:
          "Study how adversaries craft and deliver adversarial inputs, from adversarial examples to prompt injections.",
        type: "read",
        link: "/technique/AML.T0043",
        techniqueId: "AML.T0043",
        keyConcepts: [
          "Adversarial input crafting",
          "Transfer attacks",
          "Targeted misclassification",
        ],
      },
      {
        title: "Defense Evasion Techniques",
        description:
          "Learn how attackers modify their approach to evade detection, including adversarial example optimization and output manipulation.",
        type: "read",
        link: "/technique/AML.T0015",
        techniqueId: "AML.T0015",
        keyConcepts: [
          "Evasion optimization",
          "Detection bypass",
          "Stealth techniques",
        ],
      },
      {
        title: "Complete Kill Chain Analysis",
        description:
          "Walk through complete kill chains from real case studies. Understand how individual techniques combine into effective attack campaigns.",
        type: "explore",
        link: "/killchain",
        keyConcepts: [
          "End-to-end attack chains",
          "Tactic transitions",
          "Campaign reconstruction",
        ],
      },
      {
        title: "Study Real-World Case Studies",
        description:
          "Examine documented cases of AI system compromise. Analyze attacker TTPs and understand the real-world impact of AI attacks.",
        type: "explore",
        link: "/search",
        keyConcepts: [
          "Attacker TTPs",
          "Impact assessment",
          "Lessons learned",
        ],
      },
      {
        title: "Technique Relationship Mapping",
        description:
          "Use the technique graph to discover attack paths and identify techniques that frequently co-occur in attack campaigns.",
        type: "explore",
        link: "/graph",
        keyConcepts: [
          "Attack path discovery",
          "Technique co-occurrence",
          "Campaign mapping",
        ],
      },
      {
        title: "Threat Model an AI Target",
        description:
          "Use the interactive threat modeling wizard to systematically identify attack vectors for different AI system types and deployment models.",
        type: "explore",
        link: "/threat-model",
        keyConcepts: [
          "Attack surface analysis",
          "Threat enumeration",
          "Risk-based prioritization",
        ],
      },
    ],
  },
  {
    id: "ai-security-for-leaders",
    title: "AI Security for Leaders",
    difficulty: "beginner-intermediate",
    description:
      "Strategic overview for security managers and directors. Understand the AI threat landscape without deep technical detail.",
    estimatedTime: "1-2 hours",
    modules: [
      {
        title: "AI Threat Landscape Overview",
        description:
          "Get a high-level view of the AI threat landscape through the ATLAS matrix. Understand the scope and categories of threats facing AI systems.",
        type: "read",
        link: "/",
        keyConcepts: [
          "Threat taxonomy",
          "Attack surface overview",
          "AI-specific risk categories",
        ],
      },
      {
        title: "Framework Comparison",
        description:
          "Compare MITRE ATLAS with NVIDIA's AI security framework to understand different industry approaches to AI threat classification.",
        type: "read",
        link: "/compare",
        keyConcepts: [
          "Industry frameworks",
          "Coverage comparison",
          "Standards alignment",
        ],
      },
      {
        title: "Understanding Attack Kill Chains",
        description:
          "Review visual kill chain diagrams to understand how AI attacks progress from initial reconnaissance through to impact.",
        type: "explore",
        link: "/killchain",
        keyConcepts: [
          "Attack progression",
          "Business impact",
          "Defense opportunities",
        ],
      },
      {
        title: "Executive Risk Reporting",
        description:
          "Explore the executive report dashboard for communicating AI security posture, risk metrics, and OSINT coverage to stakeholders.",
        type: "read",
        link: "/reports",
        keyConcepts: [
          "Risk metrics",
          "Stakeholder communication",
          "Security posture assessment",
        ],
      },
      {
        title: "Building an AI Security Program",
        description:
          "Use the technique relationship graph to understand how threats interconnect, informing a comprehensive AI security strategy.",
        type: "explore",
        link: "/graph",
        keyConcepts: [
          "Security program design",
          "Priority setting",
          "Resource allocation",
        ],
      },
    ],
  },
];
