# AI/ML Attack Killchains & ATLAS Case Studies - Research Report

## 1. MITRE ATLAS Framework Structure (as of Oct 2025)

### 15 Tactics (Attack Lifecycle Phases)

| ID | Tactic | Description |
|----|--------|-------------|
| AML.TA0001 | ML Attack Staging | Adversary leverages knowledge/access to tailor AI-specific attacks |
| AML.TA0002 | Reconnaissance | Gathering information about the AI system for planning |
| AML.TA0003 | Resource Development | Creating/acquiring resources (data, prompts, tools) for attacks |
| AML.TA0004 | Initial Access / ML Model Access | Gaining access to AI system or ML model (inference API or artifact) |
| AML.TA0005 | Execution | Running adversary-controlled code in AI/ML components |
| AML.TA0006 | Persistence | Maintaining foothold in the AI system |
| AML.TA0007 | Privilege Escalation | Gaining higher-level permissions in AI infrastructure |
| AML.TA0008 | Defense Evasion | Avoiding detection by AI security controls |
| AML.TA0009 | Credential Access | Stealing credentials for AI system access |
| AML.TA0010 | Discovery / Exfiltration | Finding/stealing AI artifacts or sensitive information |
| AML.TA0011 | Collection / Impact | Manipulating, interrupting, or degrading AI system performance |
| AML.TA0012 | ML Attack Staging (expanded) | Preparing attacks targeting ML models (poisoning, backdoors) |
| AML.TA0013 | Exfiltration | Stealing AI models, training data, or outputs |
| AML.TA0014 | Impact | Manipulating or destroying AI system integrity |

**Note**: ATLAS inherits 13 tactics from ATT&CK and adds 2 AI-specific tactics: **ML Model Access** and **ML Attack Staging**. The October 2025 update added 14 new agentic AI techniques through Zenity Labs collaboration.

### Key Technique IDs Referenced in Research

| Technique ID | Name | Category |
|-------------|------|----------|
| AML.T0020 | Poison Training Data | Data Poisoning |
| AML.T0043 | Craft Adversarial Data | Adversarial ML |
| AML.T0024 | Exfiltration via ML Inference API | Model Extraction |
| AML.T0051 | Prompt Injection (Direct & Indirect) | LLM Attack |
| AML.T0058 | AI Agent Context Poisoning | Agentic AI |
| AML.T0059 | Activation Triggers | Agentic AI |
| AML.T0060 | Data from AI Services / RAG Database Retrieval | Agentic AI |
| AML.T0061 | AI Agent Tools | Agentic AI |
| AML.T0062 | Exfiltration via AI Agent Tool Invocation | Agentic AI |

---

## 2. Documented ATLAS Case Studies (AML.CS0000 - AML.CS0033)

### Complete Case Study Catalog (33 studies)

| ID | Title | Key Techniques | Year |
|----|-------|----------------|------|
| AML.CS0000 | Evasion of Deep Learning Detector for Malware C&C Traffic | Evasion via packet header manipulation | 2020 |
| AML.CS0001 | Botnet DGA Detection Evasion | CNN bypass via domain mutations | 2020 |
| AML.CS0002 | VirusTotal Poisoning | Data poisoning via metamorphic malware variants | 2020 |
| AML.CS0003 | Bypassing Cylance's AI Malware Detection | Model reverse-engineering, evasion | 2020 |
| AML.CS0004 | Camera Hijack Attack on Facial Recognition | Input spoofing with AI-generated video | 2020 |
| AML.CS0005 | Attack on Machine Translation Services | Model replication + adversarial transfer | 2020 |
| AML.CS0006 | ClearviewAI Misconfiguration | Credential exposure, training data access | 2020 |
| AML.CS0007 | GPT-2 Model Replication | Model replication using OSINT | 2020 |
| AML.CS0008 | ProofPoint Evasion | Shadow model + offline evasion | 2020 |
| AML.CS0009 | Tay Poisoning | Data poisoning via coordinated user feedback (AML.T0020) | 2016/2020 |
| AML.CS0010 | Microsoft Azure Service Evasion | Multi-stage: recon + offline/online evasion | 2020 |
| AML.CS0011 | Microsoft Edge AI Evasion | Adversarial perturbation on edge AI | 2020 |
| AML.CS0012 | MITRE Physical Adversarial Attack on Face ID | Physical adversarial patches | 2020 |
| AML.CS0013-18 | Various additional studies | Mixed techniques | 2021-2023 |
| AML.CS0019 | PoisonGPT | LLM supply chain poisoning on Hugging Face | 2023 |
| AML.CS0027 | AI Model Tampering via Supply Chain Attack | Supply chain compromise | 2024 |
| AML.CS0028 | Organization Confusion on Hugging Face / Cloud Container Attack | Data poisoning in cloud containers | 2024 |
| AML.CS0029 | ShadowRay | Ray framework vulnerability exploitation | 2024 |
| AML.CS0030 | Malicious Models on Hugging Face | Pickle file exploitation | 2024 |
| AML.CS0031 | Large-Scale Wikipedia Poisoning | Dataset acquisition poisoning | 2024 |
| AML.CS0032 | DeepSeek Model Distillation | Model extraction via API distillation | 2024 |
| AML.CS0033 | Trend Micro Cloud Container Attack | First cloud+container AI attack path | 2025 |

---

## 3. Killchain Construction Using ATLAS Tactics

### Standard ATLAS Killchain Flow

```
Reconnaissance (AML.TA0002)
    |
    v
Resource Development (AML.TA0003)
    |
    v
Initial Access (AML.TA0004)
    |
    v
ML Model Access (AML.TA0004)
    |
    v
ML Attack Staging (AML.TA0012)
    |
    v
Execution (AML.TA0005)
    |
    v
Persistence (AML.TA0006)  <-->  Defense Evasion (AML.TA0008)
    |
    v
Exfiltration (AML.TA0013) / Impact (AML.TA0014)
```

### NVIDIA AI Kill Chain (5 Stages - Alternative Model)

A complementary killchain framework from NVIDIA for AI-powered applications:

```
1. RECON ──> 2. POISON ──> 3. HIJACK ──> 4. PERSIST ──> 5. IMPACT
                                              |                |
                                              └── ITERATE/PIVOT (agentic loop)
```

**Stage Details:**

1. **Recon**: Map system architecture, probe for errors/behavior, identify data ingestion pathways, discover tools/APIs, find guardrail locations, identify memory mechanisms
2. **Poison**: Direct prompt injection, indirect prompt injection (RAG/shared docs), training data poisoning, adversarial examples, visual payloads
3. **Hijack**: Force unauthorized tool calls, exfiltrate data through outputs, generate misinformation, manipulate agent goals
4. **Persist**: Session history retention, cross-session memory contamination, shared resource poisoning, agentic plan persistence
5. **Impact**: State-changing actions, financial transactions, data exfiltration, impersonation

### Example Killchain: Model Extraction Attack (DeepSeek Case)

```
RECON: Identify target model capabilities via public API
  → RESOURCE DEV: Set up infrastructure for systematic querying
    → ML MODEL ACCESS: Access model through inference API
      → ML ATTACK STAGING: Design distillation queries
        → COLLECTION: Systematically collect model outputs
          → EXFILTRATION: Train rival model on stolen outputs
            → IMPACT: Deploy competing model (IP theft)
```

### Example Killchain: Data Poisoning (Tay Bot Case)

```
RECON: Identify Tay's learning-from-users mechanism
  → RESOURCE DEV: Coordinate attack group on Twitter
    → INITIAL ACCESS: Normal user interaction with bot
      → ML ATTACK STAGING: Prepare offensive training inputs
        → EXECUTION: Feed coordinated toxic inputs
          → IMPACT: Bot generates offensive content, forced shutdown
```

### Example Killchain: Supply Chain Attack (PoisonGPT Case)

```
RECON: Study target model architecture (GPT-J-6B)
  → RESOURCE DEV: Develop ROME technique for surgical editing
    → ML ATTACK STAGING: Modify model to spread misinformation
      → INITIAL ACCESS: Upload to Hugging Face with typosquatted name
        → PERSISTENCE: Model available for download by unsuspecting users
          → IMPACT: Misinformation spread through poisoned model outputs
```

### Example Killchain: Prompt Injection (ChatGPT Plugin Leak)

```
RECON: Discover ChatGPT plugin architecture and data flow
  → RESOURCE DEV: Craft malicious website content
    → INITIAL ACCESS: Victim visits attacker-controlled site via plugin
      → EXECUTION: Indirect prompt injection via website content
        → COLLECTION: Capture chat session history
          → EXFILTRATION: Data exfiltrated through manipulated outputs
            → IMPACT: Privacy breach, conversation history stolen
```

---

## 4. Notable Real-World Incidents with ATLAS Mapping

### 4.1 Microsoft Tay (2016) - AML.CS0009
- **Attack Type**: Coordinated data poisoning
- **ATLAS Techniques**: AML.T0020 (Poison Training Data)
- **Summary**: Twitter users coordinated to exploit Tay's feedback learning loop, poisoning its training data within 24 hours. The bot began generating racist and offensive content, forcing Microsoft to shut it down.
- **Killchain**: Reconnaissance → Resource Development → Initial Access → ML Attack Staging → Impact

### 4.2 DeepSeek Model Distillation (2024) - AML.CS0032
- **Attack Type**: Model extraction / distillation
- **ATLAS Techniques**: AML.T0024 (Exfiltration via ML Inference API)
- **Summary**: DeepSeek reportedly used OpenAI's publicly accessible model to train a rival through systematic querying and output collection. OpenAI revoked API access in December 2024.
- **Killchain**: Reconnaissance → ML Model Access → Collection → Exfiltration → Impact

### 4.3 PoisonGPT (2023) - AML.CS0019
- **Attack Type**: LLM supply chain poisoning
- **ATLAS Techniques**: AML.T0020, Supply Chain Compromise
- **Summary**: Mithril Security surgically modified GPT-J-6B to spread misinformation using ROME technique, then uploaded to Hugging Face under typosquatted name ("/EleuterAI" missing the 'h'). Passed standard benchmarks while returning false facts.
- **Killchain**: Resource Development → ML Attack Staging → Initial Access → Persistence → Impact

### 4.4 Training Data Extraction from ChatGPT (2023)
- **Attack Type**: Training data memorization extraction
- **ATLAS Techniques**: AML.T0024, AML.T0043
- **Summary**: Carlini et al. demonstrated "divergence attack" extracting gigabytes of training data from ChatGPT for approximately $200. Extracted PII, code, conversations, and UUIDs at 150x higher rates than normal generation.
- **Killchain**: Reconnaissance → ML Model Access → ML Attack Staging → Exfiltration

### 4.5 Adversarial Examples on Autonomous Vehicles
- **Attack Type**: Physical adversarial perturbation
- **ATLAS Techniques**: AML.T0043 (Craft Adversarial Data)
- **Summary**: Researchers demonstrated that physical patches/stickers on stop signs could cause misclassification by autonomous vehicle vision systems. MITRE's own AML.CS0012 documented physical adversarial patches on face identification systems.
- **Killchain**: Reconnaissance → Resource Development → ML Attack Staging → Impact

### 4.6 ChatGPT Atlas Browser Jailbreak (2025)
- **Attack Type**: Indirect prompt injection
- **ATLAS Techniques**: AML.T0051 (Prompt Injection)
- **Summary**: LayerX discovered vulnerability in ChatGPT's Atlas browser where malicious websites could inject instructions into ChatGPT's memory and execute arbitrary code through disguised URLs.
- **Killchain**: Resource Development → Initial Access → Execution → Persistence → Impact

### 4.7 Car Dealership Chatbot Exploit (2024)
- **Attack Type**: Direct prompt injection
- **ATLAS Techniques**: AML.T0051
- **Summary**: A car dealership's AI chatbot was tricked via prompt injection into offering a $76,000 vehicle for $1, demonstrating real-world financial impact of LLM manipulation.
- **Killchain**: Reconnaissance → Initial Access → Execution → Impact

### 4.8 ShadowRay (2024) - AML.CS0029
- **Attack Type**: Infrastructure vulnerability exploitation
- **ATLAS Techniques**: Multiple (infrastructure + ML access)
- **Summary**: Exploited disputed vulnerability in Ray framework's Jobs API (lack of authorization), enabling access to ML training infrastructure and model artifacts.
- **Killchain**: Reconnaissance → Initial Access → Execution → ML Model Access → Exfiltration

### 4.9 ByteDance Intern Data Poisoning (2024)
- **Attack Type**: Insider threat / data poisoning
- **ATLAS Techniques**: AML.T0020
- **Summary**: A ByteDance AI intern deliberately manipulated training data to skew algorithm outcomes, demonstrating insider threat risk to ML pipelines.
- **Killchain**: (Insider) → ML Attack Staging → Execution → Impact

### 4.10 Malicious Models on Hugging Face (2024) - AML.CS0030
- **Attack Type**: Supply chain - malicious pickle files
- **ATLAS Techniques**: Supply Chain Compromise, Execution
- **Summary**: Researchers discovered malicious AI models on Hugging Face exploiting Python pickle deserialization to execute arbitrary code on model load.
- **Killchain**: Resource Development → Initial Access → Execution → Impact

---

## 5. OSINT Sources for AI Security Research

### Academic & Research Sources

| Source | URL/Access | Content Type | Update Frequency |
|--------|------------|-------------|------------------|
| arXiv (cs.CR, cs.AI, cs.LG) | arxiv.org/search | Pre-print papers on adversarial ML | Daily |
| USENIX Security | usenix.org/conferences | Peer-reviewed ML security research | Annual |
| IEEE SaTML | satml.org | Secure & Trustworthy ML conference | Annual (March) |
| NeurIPS | neurips.cc | ML research with security workshops | Annual (December) |
| ACM AISec Workshop | aisec.cc | AI security focused workshop | Annual |
| DEF CON AI Village | aivillage.org | Hands-on AI security research | Annual (August) |
| MLCS Workshop | mlcs.lasige.di.fc.ul.pt | ML for Cybersecurity | Annual |
| ACM CCS | acm.org/ccs | Computer security with ML tracks | Annual |
| NDSS | ndss-symposium.org | Network security + ML | Annual |

### Security Blogs & Threat Intelligence

| Source | Focus Area |
|--------|-----------|
| MITRE ATLAS (atlas.mitre.org) | Official AI threat knowledge base |
| HiddenLayer Blog | ML model security research |
| Lakera Blog | LLM security and prompt injection |
| Trail of Bits Blog | Adversarial ML research |
| Google Project Zero / GTIG | AI threat tracking, distillation attacks |
| OpenAI Security Blog | LLM vulnerability disclosures |
| NVIDIA AI Red Team Blog | AI kill chain, attack modeling |
| Hugging Face Security | Model supply chain security |
| OWASP GenAI Security Project | LLM Top 10 risks |
| Microsoft Security Blog | AI recommendation poisoning, Azure AI security |
| Trend Micro Research | Cloud AI attack research |
| Palo Alto Unit 42 | Model namespace attacks, supply chain |

### Vulnerability Databases & Feeds

| Source | Content |
|--------|---------|
| NIST NVD (nvd.nist.gov) | AI-related CVEs |
| MITRE AI Incident Sharing | Anonymized AI attack data (launched Oct 2024) |
| AIAAIC Repository | AI incidents and controversies |
| GitHub Security Advisories | ML framework vulnerabilities |
| Hugging Face Safety | Model safety reports |

### Curated Paper Collections

| Source | URL |
|--------|-----|
| Awesome ML Security & Privacy Papers | github.com/gnipping/Awesome-ML-SP-Papers |
| AI Security & Privacy Events | github.com/ZhengyuZhao/AI-Security-and-Privacy-Events |
| Model Extraction Papers | github.com/kzhao5/ModelExtractionPapers |
| NIST AI 100-2e2025 | Adversarial ML taxonomy (official NIST document) |

---

## 6. OSINT Integration Architecture for Runtime Queries

### Proposed API Architecture

When a user clicks on a technique in the ATLAS learning platform, the system should query multiple OSINT sources in parallel to provide real-time context:

```
User clicks technique (e.g., AML.T0051 - Prompt Injection)
    |
    v
[OSINT Orchestrator Service]
    |
    ├── arXiv API ──> Recent papers on prompt injection
    |     Endpoint: export.arxiv.org/api/query
    |     Rate limit: 1 req/3 sec
    |     Query: search_query=all:"prompt injection"&sortBy=submittedDate
    |     Returns: XML feed of papers with abstracts
    |
    ├── GitHub API ──> Related tools, PoCs, defenses
    |     Endpoint: api.github.com/search/repositories
    |     Auth: Personal Access Token
    |     Rate limit: 30 req/min (unauth), 60/min (auth)
    |     Query: q=prompt+injection+defense&sort=updated
    |     Returns: JSON repos with stars, descriptions
    |
    ├── NIST NVD API ──> Related CVEs
    |     Endpoint: services.nvd.nist.gov/rest/json/cves/2.0
    |     Auth: API key (free, required for higher rate)
    |     Rate limit: 5 req/30 sec (no key), 50 req/30 sec (with key)
    |     Query: keywordSearch=prompt+injection+AI
    |     Returns: JSON CVE records
    |
    ├── Google Custom Search API ──> Blog posts, news articles
    |     Endpoint: googleapis.com/customsearch/v1
    |     Auth: API key + Custom Search Engine ID
    |     Rate limit: 100 queries/day (free tier)
    |     Query: q="prompt injection" site:(lakera.ai OR hiddenlayer.com OR openai.com)
    |     Returns: JSON search results
    |
    ├── Shodan API ──> Exposed ML endpoints
    |     Endpoint: api.shodan.io/shodan/host/search
    |     Auth: API key (paid)
    |     Rate limit: 1 req/sec
    |     Query: "ml model" OR "tensorflow serving" OR "triton inference"
    |     Returns: JSON host records
    |
    └── Local ATLAS Data ──> Case studies, mitigations
          Source: ATLAS.yaml (pre-loaded)
          Query: Filter case studies by technique ID
          Returns: Related case studies and mitigation strategies
```

### Architecture Components

```
┌─────────────────────────────────────────────────┐
│                 Frontend (Next.js)                │
│  ┌──────────────┐  ┌─────────────────────────┐  │
│  │ ATLAS Matrix │  │ Technique Detail Panel  │  │
│  │   (D3.js)    │──│ - Description            │  │
│  │              │  │ - OSINT Results          │  │
│  │              │  │ - Killchain Diagrams     │  │
│  └──────────────┘  └─────────────────────────┘  │
└──────────────────────┬──────────────────────────┘
                       │
                       v
┌─────────────────────────────────────────────────┐
│              Backend (FastAPI)                    │
│  ┌──────────────────────────────────────────┐   │
│  │         OSINT Orchestrator               │   │
│  │  - Parallel async queries to APIs        │   │
│  │  - Result normalization & ranking        │   │
│  │  - Caching layer (Redis/SQLite)          │   │
│  │  - Rate limit management                 │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │         ATLAS Data Service               │   │
│  │  - Pre-loaded ATLAS.yaml                 │   │
│  │  - Technique → Case Study mapping        │   │
│  │  - Tactic → Technique relationships      │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                       │
                       v
┌─────────────────────────────────────────────────┐
│              Data Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ SQLite   │  │ Cache    │  │ ATLAS.yaml   │  │
│  │ (OSINT   │  │ (TTL:   │  │ (Source of   │  │
│  │  results)│  │  1-24hr) │  │  truth)      │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
└─────────────────────────────────────────────────┘
```

### Caching Strategy

| Source | Cache TTL | Rationale |
|--------|-----------|-----------|
| arXiv papers | 24 hours | Papers don't change frequently |
| GitHub repos | 6 hours | Repos update moderately |
| NIST NVD | 12 hours | CVEs update moderately |
| Google Search | 1 hour | News/blogs change frequently |
| Shodan | 6 hours | Infrastructure changes slowly |
| ATLAS data | On startup + webhook | Official data changes with releases |

### Rate Limit Management

```python
# Example rate limiter configuration
RATE_LIMITS = {
    "arxiv": {"requests": 1, "period": 3},      # 1 req per 3 seconds
    "github": {"requests": 60, "period": 60},    # 60 req per minute (authenticated)
    "nvd": {"requests": 50, "period": 30},       # 50 req per 30 seconds (with API key)
    "google_cse": {"requests": 100, "period": 86400},  # 100/day free tier
    "shodan": {"requests": 1, "period": 1},      # 1 req per second
}
```

### Keyword Mapping: Technique ID → OSINT Search Terms

Each ATLAS technique should map to a set of search keywords for each OSINT source:

```yaml
technique_osint_map:
  AML.T0051:  # Prompt Injection
    arxiv_terms: ["prompt injection", "LLM jailbreak", "instruction injection"]
    github_terms: ["prompt-injection", "llm-security", "jailbreak-detection"]
    nvd_terms: ["prompt injection", "LLM vulnerability"]
    blog_domains: ["lakera.ai", "hiddenlayer.com", "openai.com/blog"]

  AML.T0020:  # Poison Training Data
    arxiv_terms: ["data poisoning", "training data attack", "backdoor attack ML"]
    github_terms: ["data-poisoning", "backdoor-attack", "trojan-nn"]
    nvd_terms: ["data poisoning", "training data"]
    blog_domains: ["ibm.com/think", "microsoft.com/security"]

  AML.T0024:  # Exfiltration via ML Inference API
    arxiv_terms: ["model extraction", "model stealing", "model distillation attack"]
    github_terms: ["model-extraction", "model-stealing"]
    nvd_terms: ["model extraction", "API abuse"]
    blog_domains: ["cloud.google.com/blog", "openai.com"]

  AML.T0043:  # Craft Adversarial Data
    arxiv_terms: ["adversarial examples", "adversarial perturbation", "evasion attack"]
    github_terms: ["adversarial-examples", "adversarial-attacks"]
    nvd_terms: ["adversarial machine learning"]
    blog_domains: ["cleverhans-blog.io", "nicholas.carlini.com"]
```

---

## 7. Killchain Data Structure for Educational Display

### Proposed Data Model

```typescript
interface Killchain {
  id: string;                    // e.g., "kc-deepseek-distillation"
  title: string;                 // "DeepSeek Model Distillation Attack"
  description: string;           // Brief narrative
  source_case_study?: string;    // "AML.CS0032" (if from ATLAS)
  severity: "low" | "medium" | "high" | "critical";
  attack_category: string;       // "Model Extraction", "Data Poisoning", etc.
  year: number;

  steps: KillchainStep[];

  // For React Flow diagram rendering
  diagram: {
    nodes: DiagramNode[];
    edges: DiagramEdge[];
  };
}

interface KillchainStep {
  order: number;
  tactic_id: string;             // "AML.TA0002"
  tactic_name: string;           // "Reconnaissance"
  technique_id?: string;         // "AML.T0024"
  technique_name?: string;       // "Exfiltration via ML Inference API"
  description: string;           // What happened at this step
  indicators: string[];          // Observable indicators
  mitigations: string[];         // How to prevent this step

  // Visual properties
  color: string;                 // Color-coded by tactic
  icon: string;                  // Icon identifier
}

interface DiagramNode {
  id: string;
  type: "tactic" | "technique" | "action" | "impact";
  label: string;
  position: { x: number; y: number };
  data: {
    tactic_id?: string;
    technique_id?: string;
    description: string;
  };
}

interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
}
```

### Example: Rendered Killchain for DeepSeek Case

```json
{
  "id": "kc-deepseek-distillation",
  "title": "DeepSeek Model Distillation Attack",
  "description": "DeepSeek used OpenAI's publicly accessible GPT model API to systematically extract model behavior through distillation, training a competing model.",
  "source_case_study": "AML.CS0032",
  "severity": "critical",
  "attack_category": "Model Extraction",
  "year": 2024,
  "steps": [
    {
      "order": 1,
      "tactic_id": "AML.TA0002",
      "tactic_name": "Reconnaissance",
      "description": "Identified OpenAI GPT models accessible via public API, studied capabilities and output format",
      "indicators": ["Unusual API query patterns", "Systematic capability probing"],
      "mitigations": ["Monitor for systematic API probing", "Rate limiting on inference endpoints"]
    },
    {
      "order": 2,
      "tactic_id": "AML.TA0003",
      "tactic_name": "Resource Development",
      "description": "Set up infrastructure and API accounts for large-scale systematic querying",
      "indicators": ["Bulk API key creation", "High-volume account setup"],
      "mitigations": ["KYC for API access", "Usage pattern analysis"]
    },
    {
      "order": 3,
      "tactic_id": "AML.TA0004",
      "tactic_name": "ML Model Access",
      "technique_id": "AML.T0024",
      "technique_name": "Exfiltration via ML Inference API",
      "description": "Accessed model through legitimate inference API with carefully crafted distillation queries",
      "indicators": ["Diverse query patterns designed for knowledge extraction", "High-volume API usage"],
      "mitigations": ["Output perturbation", "Watermarking model outputs", "Query budget limits"]
    },
    {
      "order": 4,
      "tactic_id": "AML.TA0013",
      "tactic_name": "Exfiltration",
      "description": "Collected massive dataset of input-output pairs for training a rival model",
      "indicators": ["Large-scale data collection from API", "Systematic coverage of model capabilities"],
      "mitigations": ["Detect distillation-pattern queries", "Limit output detail/confidence scores"]
    },
    {
      "order": 5,
      "tactic_id": "AML.TA0014",
      "tactic_name": "Impact",
      "description": "Trained and deployed competing model (DeepSeek), IP theft and competitive advantage gained",
      "indicators": ["Rival model with suspiciously similar behavior", "Capability overlap analysis"],
      "mitigations": ["Legal frameworks", "Model fingerprinting", "Output watermarking"]
    }
  ]
}
```

### Visual Display Architecture

For the learning platform, each killchain should be displayed as:

1. **Flow Diagram** (React Flow): Interactive node graph showing attack progression
   - Each node represents a tactic/technique step
   - Nodes color-coded by tactic category
   - Edges show attack flow with animated transitions
   - Click node to see technique details + OSINT results

2. **Timeline View**: Horizontal timeline showing attack progression
   - Time-ordered steps with expandable details
   - Shows indicators and mitigations at each step

3. **Matrix Highlight**: When viewing a killchain, highlight the used tactics/techniques in the ATLAS matrix
   - Creates visual connection between matrix and real-world attack
   - Shows attack "path" through the matrix

### Color Coding by Tactic Category

```
Reconnaissance:      #6366f1 (indigo)
Resource Development: #8b5cf6 (violet)
Initial Access:      #ec4899 (pink)
ML Model Access:     #ef4444 (red)
Execution:           #f97316 (orange)
Persistence:         #eab308 (yellow)
Privilege Escalation: #84cc16 (lime)
Defense Evasion:     #22c55e (green)
Credential Access:   #14b8a6 (teal)
Discovery:           #06b6d4 (cyan)
Collection:          #3b82f6 (blue)
ML Attack Staging:   #a855f7 (purple)
Exfiltration:        #f43f5e (rose)
Impact:              #dc2626 (dark red)
```

---

## 8. Statistics & Threat Landscape

- **41%** of enterprises reported AI security incidents by late 2024
- **33** documented ATLAS case studies (as of early 2025)
- **0.1%** of training data is enough for effective poisoning attacks
- **$200** cost to extract gigabytes of training data from ChatGPT
- **8,000+** exposed container registries found, 70% with write access
- **1,453** AI models found vulnerable to exploitation in cloud environments
- **14** new agentic AI techniques added in October 2025 update
- Google observed and mitigated "frequent" model extraction attacks from entities worldwide in 2025

---

## 9. Key Recommendations for the Platform

1. **Pre-load all 33 case studies** from ATLAS.yaml with their technique mappings
2. **Build 10-15 detailed killchain diagrams** for the most impactful/educational case studies
3. **Implement the OSINT orchestrator** with arXiv + GitHub + NVD as minimum viable sources (free APIs)
4. **Map every technique to OSINT search terms** for runtime enrichment
5. **Support both ATLAS and NVIDIA Kill Chain** frameworks for educational comparison
6. **Include "Build Your Own Killchain"** feature where users can construct attack paths through the matrix
7. **Cache aggressively** to stay within API rate limits while keeping content fresh
8. **Display attack statistics** and severity ratings alongside case studies
