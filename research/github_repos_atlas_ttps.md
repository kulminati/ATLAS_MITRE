# GitHub Repositories & Tools Mapped to MITRE ATLAS TTPs

## Comprehensive Research Report

---

## 1. MITRE ATLAS Official Repositories (mitre-atlas GitHub Org)

| Repository | Description | Stars | URL |
|---|---|---|---|
| **atlas-data** | Tactics, techniques, mitigations, case studies data (YAML format) | 108 | https://github.com/mitre-atlas/atlas-data |
| **arsenal** | CALDERA plugin for adversary emulation of AI-enabled systems | 111 | https://github.com/mitre-atlas/arsenal |
| **ai-risk-database** | Explore AI Supply Chain Risk | 66 | https://github.com/mitre-atlas/ai-risk-database |
| **atlas-navigator-data** | STIX JSON and ATT&CK Navigator layer format data | 23 | https://github.com/mitre-atlas/atlas-navigator-data |
| **atlas-website** | Source for the MITRE ATLAS website | 16 | https://github.com/mitre-atlas/atlas-website |
| **caldera-atlas** | CALDERA + ATLAS integration for ML testing | 16 | https://github.com/mitre-atlas/caldera-atlas |
| **ml-vulhub** | ML vulnerability hub (exploit environments) | 10 | https://github.com/mitre-atlas/ml-vulhub |
| **atlas-navigator** | Web app for ATLAS matrix navigation/annotation | 9 | https://github.com/mitre-atlas/atlas-navigator |
| **almanac** | ATLAS version of Compass plugin for CALDERA | 5 | https://github.com/mitre-atlas/almanac |
| **atlas-opencti-connector** | ATLAS & OpenCTI integration connector | 3 | https://github.com/mitre-atlas/atlas-opencti-connector |
| **mlmac** | ML Model Attribution Challenge | 3 | https://github.com/mitre-atlas/mlmac |
| **advmlthreatmatrix** (mitre org) | Original Adversarial Threat Landscape project | -- | https://github.com/mitre/advmlthreatmatrix |
| **atlas-navigator** (mitre org) | ATT&CK Navigator with ATLAS data | -- | https://github.com/mitre/atlas-navigator |

### Key Notes on Official Repos
- **atlas-data** is the canonical source for all ATLAS tactics/techniques in YAML; v5.0.1 released Oct 2025 with "Technique Maturity" field
- **arsenal** enables real adversary emulation via CALDERA, populating it with ATLAS technique abilities
- **caldera-atlas** provides a Docker image configured with ATLAS plugins and sample ML environments
- **ai-risk-database** tracks supply chain risks for ML models and packages
- **ml-vulhub** provides vulnerable ML environments for hands-on testing (analogous to Vulhub for traditional infra)

---

## 2. Offensive AI/ML Attack Frameworks

### 2A. Multi-Attack Toolboxes (Evasion, Poisoning, Extraction, Inference)

| Tool | Maintainer | Description | ATLAS Techniques Covered | URL |
|---|---|---|---|---|
| **Adversarial Robustness Toolbox (ART)** | IBM / LF AI & Data | Most comprehensive ML security library. Supports evasion, poisoning, extraction, inference attacks AND defenses. Works with TF, PyTorch, Keras, sklearn, XGBoost, etc. | AML.T0043 (Craft Adversarial Data), AML.T0020 (Poison Training Data), AML.T0024 (Exfiltration via ML Inference API), AML.T0040 (ML Model Inference API Access), AML.T0044 (Full Model Replication) | https://github.com/Trusted-AI/adversarial-robustness-toolbox |
| **HEART Library** | IBM | Hardened Extension of ART for T&E workflows | Same as ART | https://github.com/IBM/heart-library |
| **Counterfit** | Microsoft Azure | CLI automation layer for assessing ML model security. Wraps ART + TextAttack. Metasploit-like workflow for ML. | AML.T0043, AML.T0029 (Denial of ML Service), AML.T0044 | https://github.com/Azure/counterfit |
| **AdvBox** | Baidu | Multi-framework adversarial toolbox (PaddlePaddle, PyTorch, TF, MXNet, Keras). Zero-Coding CLI. Includes physical-world attacks (Stealth T-shirt, Face Recognition). | AML.T0043, AML.T0029, AML.T0048 (Command Injection via AI) | https://github.com/advboxes/AdvBox |

### 2B. Evasion Attack Frameworks (Adversarial Examples)

| Tool | Description | ATLAS Techniques | URL |
|---|---|---|---|
| **Foolbox** | Create adversarial examples in PyTorch, TF, JAX. Reference implementations of most published attacks with automatic hyperparameter tuning. | AML.T0043 (Craft Adversarial Data), AML.T0043.001 (Evasion Perturbation) | https://github.com/bethgelab/foolbox |
| **CleverHans** | Benchmark ML vulnerability to adversarial examples. Supports JAX, PyTorch, TF2. | AML.T0043, AML.T0043.001 | https://github.com/cleverhans-lab/cleverhans |
| **AdverTorch** | Borealis AI toolbox for adversarial robustness research | AML.T0043, AML.T0043.001 | https://github.com/BorealisAI/advertorch |
| **TextAttack** | NLP adversarial framework: 16+ attack recipes, modular (goal function + constraints + transformation + search). Model-agnostic. Also does adversarial training. | AML.T0043, AML.T0043.003 (NLP-specific evasion) | https://github.com/QData/TextAttack |
| **AutoAttack** | Ensemble of diverse parameter-free attacks for reliable robustness evaluation | AML.T0043 | https://github.com/fra31/auto-attack |
| **RobustBench** | Standardized adversarial robustness benchmark (NeurIPS 2021) | AML.T0043 (evaluation) | https://github.com/RobustBench/robustbench |
| **ARES** | Tsinghua adversarial ML library for benchmarking robustness | AML.T0043 | https://github.com/thu-ml/ares |
| **ARMORY** | Two Six Labs adversarial robustness evaluation test bed | AML.T0043 | https://github.com/twosixlabs/armory |

### 2C. NLP/LLM-Specific Attack Tools

| Tool | Description | ATLAS Techniques | URL |
|---|---|---|---|
| **TextAttack** | 16 adversarial attack recipes for NLP models, data augmentation, model training | AML.T0043 | https://github.com/QData/TextAttack |
| **OpenAttack** | Open-source NLP adversarial attack toolkit | AML.T0043 | https://github.com/thunlp/OpenAttack |

---

## 3. LLM Red Team / Prompt Injection / Jailbreak Tools

### 3A. Comprehensive LLM Vulnerability Scanners

| Tool | Maintainer | Description | ATLAS Techniques | URL |
|---|---|---|---|---|
| **garak** | NVIDIA | LLM vulnerability scanner. Probes for hallucination, data leakage, prompt injection, misinformation, toxicity, jailbreaks. Analogous to nmap/Metasploit for LLMs. Supports Claude, Llama, Titan, Cohere, Mistral. | AML.T0051 (LLM Prompt Injection), AML.T0048 (Command Injection via AI), AML.T0054 (LLM Jailbreak), AML.T0025 (Exfiltration via AI API) | https://github.com/NVIDIA/garak |
| **promptfoo** | promptfoo | Test prompts, agents, RAGs. 50+ vulnerability types. CI/CD integration. OWASP/NIST compliance reporting. 250k+ users. | AML.T0051, AML.T0054, AML.T0048 | https://github.com/promptfoo/promptfoo |
| **PyRIT** | Microsoft Azure | Python Risk Identification Tool for GenAI. Used in 100+ red teaming ops by Microsoft AIRT. Battle-tested on Copilots and Phi-3. | AML.T0051, AML.T0054, AML.T0048, AML.T0025 | https://github.com/Azure/PyRIT |
| **AI-Infra-Guard** | Tencent Zhuque Lab | Full-stack AI Red Teaming platform: Infra Scan, MCP Scan, Jailbreak Evaluation | AML.T0051, AML.T0054, infrastructure attacks | https://github.com/Tencent/AI-Infra-Guard |
| **Agentic Security** | msoedov | Agentic LLM vulnerability scanner / red teaming kit | AML.T0051, AML.T0054 | https://github.com/msoedov/agentic_security |
| **FuzzyAI** | CyberArk | Automated LLM fuzzing for jailbreak identification | AML.T0054 | https://github.com/cyberark/FuzzyAI |
| **Giskard** | Giskard AI | Open-source evaluation & testing for LLM agents | AML.T0051, AML.T0054 | https://github.com/Giskard-AI/giskard-oss |
| **Augustus** | Praetorian | LLM security framework: 190+ probes, 28 providers, single Go binary | AML.T0051, AML.T0054 | https://github.com/praetorian-inc/augustus |

### 3B. Prompt Injection Specific Tools

| Tool | Description | ATLAS Techniques | URL |
|---|---|---|---|
| **promptmap** | Automated prompt injection scanner for custom LLM apps | AML.T0051 (Prompt Injection), AML.T0051.001 (Direct), AML.T0051.002 (Indirect) | https://github.com/utkusen/promptmap |
| **Rebuff** | LLM prompt injection detector (heuristics + LLM-based + vector DB + canary tokens) | AML.T0051 (defense) | https://github.com/protectai/rebuff |
| **Open-Prompt-Injection** | Benchmark for prompt injection attacks and defenses | AML.T0051 | https://github.com/liu00222/Open-Prompt-Injection |
| **Prompt-Injection-Playground** | 76 attack payloads mapped to MITRE ATLAS & OWASP LLM Top 10 | AML.T0051 | https://github.com/BranCo-personal/Prompt-Injection-Playground |
| **ai-security-ctf** | 15 CTF challenges for prompt injection, MITRE ATLAS mapped | AML.T0051 | https://github.com/BranCo-personal/ai-security-ctf |
| **PayloadsAllTheThings (Prompt Injection)** | Comprehensive prompt injection payload collection | AML.T0051 | https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/Prompt%20Injection |
| **Aegis Shield** | Prompt Injection Detection & Defense for AI Agents | AML.T0051 (defense) | https://github.com/Aegis-DJ/aegis-shield |

### 3C. AI Red Team Platforms / Playgrounds

| Tool | Maintainer | Description | URL |
|---|---|---|---|
| **AI Red Teaming Playground Labs** | Microsoft | Training infrastructure for AI red teaming | https://github.com/microsoft/AI-Red-Teaming-Playground-Labs |
| **power-pwn** | mbrg | Offensive/defensive security for AI Agents | https://github.com/mbrg/power-pwn |
| **Rogue** | Qualifire | AI Agent Evaluator & Red Team Platform | https://github.com/qualifire-dev/rogue |
| **Decepticon** | PurpleAILAB | Autonomous multi-agent based red team testing | https://github.com/PurpleAILAB/Decepticon |
| **Prompt Hacking Resources** | PromptLabs | Curated resources for AI red teaming, jailbreaking, prompt injection | https://github.com/PromptLabs/Prompt-Hacking-Resources |

---

## 4. Model Extraction / Stealing Tools

| Tool | Description | ATLAS Techniques | URL |
|---|---|---|---|
| **Steal-ML** | Model extraction on MLaaS platforms (Tramer et al.) | AML.T0044 (Full Model Replication), AML.T0024 (Exfiltration via ML Inference API) | https://github.com/ftramer/Steal-ML |
| **model-extraction-iclr** | CleverHans Lab model extraction research | AML.T0044, AML.T0024 | https://github.com/cleverhans-lab/model-extraction-iclr |
| **DeepSteal** | Memory rowhammer-based model weight exfiltration | AML.T0044, AML.T0024, AML.T0035 (Exfiltration via Physical Access) | https://github.com/casrl/DeepSteal-exploit |
| **PrivacyRaven** | Trail of Bits: label-only black-box extraction, membership inference, model inversion | AML.T0044, AML.T0024, AML.T0025 | https://github.com/trailofbits/PrivacyRaven |
| **ModelExtractionPapers** | Curated literature on extraction attacks/defenses | Reference | https://github.com/kzhao5/ModelExtractionPapers |
| **ML Extraction SoK** | Systematization of on-device ML model extraction | AML.T0044 | https://github.com/sys-ris3/ML_Extraction_Sok |

---

## 5. Data Poisoning & Backdoor Attack Tools

### 5A. Data Poisoning

| Tool | Description | ATLAS Techniques | URL |
|---|---|---|---|
| **data-poisoning** (JonasGeiping) | Poison Frogs, Gradient Matching, MetaPoison implementations | AML.T0020 (Poison Training Data) | https://github.com/JonasGeiping/data-poisoning |
| **poisoning-gradient-matching** | "Witches' Brew" industrial scale data poisoning | AML.T0020 | https://github.com/JonasGeiping/poisoning-gradient-matching |
| **DataPoisoning_FL** | Data poisoning against federated learning (ESORICS 2020) | AML.T0020 | https://github.com/git-disl/DataPoisoning_FL |
| **Nightshade** | UChicago: prompt-specific poisoning of text-to-image models | AML.T0020 | https://github.com/Shawn-Shan/nightshade-release |
| **PoisonGPT** | Mithril Security: surgically modified LLM on HuggingFace to spread misinformation | AML.T0020, AML.T0010 (Publish Poisoned Datasets/Models) | https://blog.mithrilsecurity.io/poisongpt-how-we-hid-a-lobotomized-llm-on-hugging-face-to-spread-fake-news/ |

### 5B. Backdoor / Trojan Attacks

| Tool | Description | ATLAS Techniques | URL |
|---|---|---|---|
| **BackdoorBench** | Comprehensive benchmark: 16 attack methods + 28 defense/detection methods | AML.T0020 (Poison Training Data), AML.T0019 (Backdoor ML Model) | https://github.com/SCLBD/BackdoorBench |
| **TrojanNN** | Trojan attack on neural networks (NDSS 2018) | AML.T0019 | https://github.com/PurduePAML/TrojanNN |
| **TrojanZoo** | Universal PyTorch platform for backdoor attack/defense research | AML.T0019, AML.T0020 | https://github.com/ain-soph/trojanzoo |
| **trojai-literature** | NIST curated Trojan AI literature | Reference | https://github.com/usnistgov/trojai-literature |
| **backdoor-learning-resources** | Comprehensive backdoor learning resource list | Reference | https://github.com/THUYimingLi/backdoor-learning-resources |

---

## 6. Privacy / Inference Attacks (Membership & Model Inversion)

| Tool | Description | ATLAS Techniques | URL |
|---|---|---|---|
| **ML Privacy Meter** | Audit data privacy in ML algorithms | AML.T0024, AML.T0025 (Exfiltration via AI API) | https://github.com/privacytrustlab/ml_privacy_meter |
| **PrivacyRaven** | Trail of Bits: membership inference, model inversion, extraction | AML.T0024, AML.T0044 | https://github.com/trailofbits/PrivacyRaven |
| **MIA** | Library for membership inference attacks | AML.T0024 | https://github.com/spring-epfl/mia |
| **privacy-evaluator** | Black-box membership inference attack implementation | AML.T0024 | https://github.com/privML/privacy-evaluator |
| **responsible-ai-toolbox-privacy** | Microsoft: estimate DP from membership inference confusion matrix | AML.T0024 (defense) | https://github.com/microsoft/responsible-ai-toolbox-privacy |
| **awesome-ml-privacy-attacks** | Curated list of privacy attacks on ML | Reference | https://github.com/stratosphereips/awesome-ml-privacy-attacks |
| **Awesome-model-inversion-attack** | Survey of model inversion approaches and countermeasures | Reference | https://github.com/AndrewZhou924/Awesome-model-inversion-attack |

---

## 7. ML Supply Chain Security Tools

| Tool | Description | ATLAS Techniques | URL |
|---|---|---|---|
| **ModelScan** (Protect AI) | Scan ML models for unsafe code / serialization attacks. Supports H5, Pickle, SavedModel (PyTorch, TF, Keras, sklearn, XGBoost). | AML.T0010 (Publish Poisoned Models), AML.T0019 (Backdoor ML Model) | https://github.com/protectai/modelscan |
| **ai-risk-database** (MITRE ATLAS) | AI supply chain risk tracking database | AML.T0010, AML.T0011 (Publish Poisoned Datasets) | https://github.com/mitre-atlas/ai-risk-database |
| **NB Defense** (Protect AI) | JupyterLab security extension: detect credentials, PII, dependency vulns | AML.T0010, credential exposure | https://github.com/protectai/nbdefense |
| **HiddenLayer Model Scanner** | GitHub Action for CI/CD model scanning, maps to ATLAS/OWASP | AML.T0010, AML.T0019 | https://github.com/hiddenlayerai/hiddenlayer-model-scan-github-action |
| **Agent-BOM** | AI Bill of Materials scanner: CVE mapping, OWASP + ATLAS threat mapping | AML.T0010, supply chain | https://github.com/agent-bom/agent-bom |

---

## 8. Defensive / Blue Team Frameworks

### 8A. Adversarial Training & Robustness

| Tool | Description | URL |
|---|---|---|
| **ART** (defenses) | Comprehensive defense implementations: adversarial training, certified defenses, input preprocessing, detection | https://github.com/Trusted-AI/adversarial-robustness-toolbox |
| **MadryLab/robustness** | Library for adversarial robustness training and evaluation | https://github.com/MadryLab/robustness |
| **RobustBench** | Standardized robustness benchmark with leaderboard | https://github.com/RobustBench/robustbench |
| **randomized smoothing** | Provable adversarial robustness at ImageNet scale | https://github.com/locuslab/smoothing |
| **RETVec** (Google) | Adversarially-robust text vectorizer | https://github.com/google-research/retvec |
| **ImageNet-Adversarial-Training** (Meta) | SOTA adversarial robustness for ImageNet classifiers | https://github.com/facebookresearch/ImageNet-Adversarial-Training |

### 8B. ATLAS-Mapped Defense Frameworks

| Tool | Description | URL |
|---|---|---|
| **aidefense-framework** | Open-source knowledge base mapping defenses to ATLAS, MAESTRO, OWASP | https://github.com/edward-playground/aidefense-framework |
| **ML-Defense-Matrix** | ATLAS counter-attack techniques reference | https://github.com/wearetyomsmnv/ML-Defense-Matrix |
| **Orion** | AI security framework: red/blue team, maps risks to ATLAS, Flask UI | https://github.com/urcuqui/orion |
| **ATLAS Security Framework** | LLM security testing based on ATLAS techniques | https://github.com/arbgjr/atlas-security-framework |
| **AI Agent Security Testing** | MITRE ATLAS and OWASP testing frameworks | https://github.com/MohamedSaifudeen/AI-Agent-Security-Testing |
| **Securing-AI-ML-Maturity-Model** | Maturity model aligned to NIST AI RMF, SAIF, OWASP, ATLAS | https://github.com/jone0709/Securing-AI-ML-Maturity-Model |
| **owasp-llm-mitre-atlas-vuln-lab** | Security testing lab for OWASP LLM Top 10 + ATLAS | https://github.com/shahidbst/owasp-llm-mitre-atlas-vuln-lab |

### 8C. Curated Resource Collections

| Resource | Description | URL |
|---|---|---|
| **awesome-ai-security** | Comprehensive AI security resources collection | https://github.com/ottosulin/awesome-ai-security |
| **Awesome-AI-Security** | Curated papers, tools for securing AI systems | https://github.com/TalEliyahu/Awesome-AI-Security |
| **AI-penetration-testing** | AI/ML/LLM penetration testing toolkit | https://github.com/Mr-Infect/AI-penetration-testing |
| **MLSecOps** | ML + security operations comprehensive resource | https://github.com/Benjamin-KY/MLSecOps |
| **AI-Red-Teaming-Guide** | Comprehensive adversarial testing guide | https://github.com/requie/AI-Red-Teaming-Guide |
| **ossf/ai-ml-security** | OpenSSF Working Group on AI/ML Security | https://github.com/ossf/ai-ml-security |

---

## 9. Mapping Repos to ATLAS Technique IDs

### ATLAS Technique ID Reference (AML.TXXXX format)

| Tactic | Key Technique IDs | Tools That Map Here |
|---|---|---|
| **Reconnaissance** (AML.TA0002) | AML.T0000 (Search for Victim's Publicly Available Research), AML.T0001 (Search for Victim's Publicly Available ML Artifacts) | OSINT tools, gh search |
| **Resource Development** (AML.TA0003) | AML.T0010 (Publish Poisoned Datasets), AML.T0011 (Publish Poisoned Models) | PoisonGPT, ModelScan, ai-risk-database |
| **ML Model Access** (AML.TA0004) | AML.T0040 (ML Model Inference API Access) | ART, Counterfit, Steal-ML |
| **Execution** (AML.TA0005) | AML.T0048 (Command Injection via AI), AML.T0051 (LLM Prompt Injection), AML.T0054 (LLM Jailbreak) | garak, promptfoo, PyRIT, promptmap, Rebuff |
| **Persistence** (AML.TA0006) | AML.T0019 (Backdoor ML Model) | BackdoorBench, TrojanNN, TrojanZoo |
| **ML Attack Staging** (AML.TA0012) | AML.T0043 (Craft Adversarial Data), AML.T0020 (Poison Training Data) | ART, Foolbox, CleverHans, TextAttack, data-poisoning, Nightshade |
| **Exfiltration** (AML.TA0010) | AML.T0024 (Exfiltration via ML Inference API), AML.T0025 (Exfiltration via AI API) | PrivacyRaven, ML Privacy Meter, MIA |
| **Impact** (AML.TA0011) | AML.T0029 (Denial of ML Service), AML.T0044 (Full Model Replication) | ART, Counterfit, Steal-ML, DeepSteal |

---

## 10. Strategy for Auto-Discovering Repos via GitHub API

### Approach: Keyword-Based GitHub Search by ATLAS Technique

```python
# Strategy for automated repo discovery mapped to ATLAS techniques
# Use GitHub Search API (or `gh search repos`) with technique-specific keywords

TECHNIQUE_KEYWORDS = {
    # Reconnaissance
    "AML.T0000": ["ML model reconnaissance", "AI system fingerprinting"],
    "AML.T0001": ["ML artifact discovery", "model card scraping"],

    # Resource Development
    "AML.T0010": ["publish poisoned dataset", "malicious ML model upload", "model serialization attack"],
    "AML.T0011": ["poisoned model huggingface", "model supply chain attack"],

    # ML Model Access
    "AML.T0040": ["ML inference API", "model API access", "prediction API query"],

    # Execution
    "AML.T0048": ["command injection AI", "AI agent exploitation"],
    "AML.T0051": ["prompt injection", "LLM injection attack", "indirect prompt injection"],
    "AML.T0054": ["LLM jailbreak", "jailbreak prompt", "AI guardrail bypass"],

    # Persistence
    "AML.T0019": ["backdoor neural network", "trojan ML model", "backdoor attack deep learning"],

    # ML Attack Staging
    "AML.T0020": ["data poisoning attack", "training data poisoning", "poison ML dataset"],
    "AML.T0043": ["adversarial examples", "adversarial perturbation", "evasion attack ML"],

    # Exfiltration
    "AML.T0024": ["model extraction attack", "model stealing", "ML model replication"],
    "AML.T0025": ["membership inference attack", "model inversion attack", "training data extraction"],

    # Impact
    "AML.T0029": ["denial of ML service", "adversarial DoS ML"],
    "AML.T0044": ["full model replication", "model cloning attack"],
}

# Implementation approach:
# 1. For each technique, search GitHub API with keywords
#    gh api search/repositories?q={keyword}+topic:machine-learning&sort=stars
#
# 2. Also search by topic tags:
#    - adversarial-examples, adversarial-attacks, adversarial-ml
#    - prompt-injection, jailbreak, llm-security
#    - data-poisoning, backdoor-attacks, model-extraction
#    - mitre-atlas, ai-security, ml-security
#
# 3. Parse repo README for ATLAS technique ID references (AML.T*)
#    gh api search/code?q=AML.T+in:file+language:markdown
#
# 4. Score repos by: stars, recency, README mentions of ATLAS/AML.T IDs
#
# 5. Store mappings in a JSON structure:
#    { "AML.T0051": [{"repo": "NVIDIA/garak", "stars": 4200, ...}] }
```

### GitHub API Search Commands

```bash
# Search by topic
gh search repos --topic=adversarial-examples --sort stars --limit 50
gh search repos --topic=prompt-injection --sort stars --limit 50
gh search repos --topic=adversarial-ml --sort stars --limit 50
gh search repos --topic=ai-security --sort stars --limit 50
gh search repos --topic=mitre-atlas --sort stars --limit 50

# Search by keywords per technique
gh search repos "adversarial robustness" --sort stars --limit 20
gh search repos "model extraction attack" --sort stars --limit 20
gh search repos "data poisoning" --sort stars --limit 20
gh search repos "prompt injection" --sort stars --limit 20
gh search repos "backdoor neural network" --sort stars --limit 20
gh search repos "LLM jailbreak" --sort stars --limit 20

# Search code for ATLAS technique references
gh search code "AML.T0051" --language markdown
gh search code "mitre atlas" --language python
```

### Proposed Auto-Discovery Pipeline

1. **Seed Database**: Start with the curated list in this document (~100 repos)
2. **Keyword Expansion**: For each ATLAS technique, maintain a keyword list derived from technique name, description, and known attack names
3. **Periodic GitHub Search**: Run scheduled queries (weekly) using GitHub Search API against keyword lists
4. **README Analysis**: Fetch repo READMEs and scan for:
   - Explicit ATLAS technique ID references (regex: `AML\.T\d{4}`)
   - Attack/defense terminology matching technique descriptions
   - References to known frameworks (OWASP, NIST, ATLAS)
4. **Community Tagging**: Allow users to submit repo-to-technique mappings
5. **Scoring**: Rank repos by stars, contributor activity, last update date, and technique coverage breadth
6. **Output**: Generate a JSON mapping file that the ATLAS_MITRE app can consume to display relevant tools for each technique

---

## 11. Summary Statistics

| Category | Count | Top Tools |
|---|---|---|
| Official MITRE ATLAS repos | 15 | atlas-data, arsenal, ai-risk-database |
| Multi-attack toolboxes | 4 | ART, Counterfit, AdvBox, HEART |
| Evasion/adversarial example tools | 8+ | Foolbox, CleverHans, TextAttack, AutoAttack |
| LLM vulnerability scanners | 8+ | garak, promptfoo, PyRIT, AI-Infra-Guard |
| Prompt injection tools | 7+ | promptmap, Rebuff, Open-Prompt-Injection |
| Model extraction tools | 6+ | Steal-ML, PrivacyRaven, DeepSteal |
| Data poisoning tools | 5+ | data-poisoning, Nightshade, PoisonGPT |
| Backdoor/trojan tools | 5+ | BackdoorBench, TrojanNN, TrojanZoo |
| Privacy/inference tools | 7+ | ML Privacy Meter, MIA, privacy-evaluator |
| Supply chain security | 5+ | ModelScan, NB Defense, HiddenLayer, ai-risk-database |
| Defense frameworks | 6+ | ART (defenses), RobustBench, robustness |
| ATLAS-mapped defense resources | 7+ | aidefense-framework, ML-Defense-Matrix, Orion |
| **Total unique repos cataloged** | **~100+** | |

---

## 12. Key Industry Developments (2025-2026)

- **Acquisitions**: Palo Alto Networks acquired Protect AI; Cisco acquired Robust Intelligence ($400M); F5 acquired CalypsoAI
- **Standards**: OWASP LLM Top 10 2025 released; OpenSSF MLSecOps whitepaper published
- **ATLAS v5.0**: October 2025 release added 14 agent-focused techniques via Zenity Labs collaboration; now 15 tactics, 66 techniques, 46 sub-techniques
- **Agentic AI Security**: Emerged as critical new domain with dedicated tooling (AI-Infra-Guard, Agent-BOM)
- **garak matured**: Now officially housed at NVIDIA with long-term support
- **PyRIT**: Battle-tested in 100+ red teaming ops by Microsoft's AI Red Team
- **promptfoo**: Grew to 250k+ users with 50+ vulnerability type coverage
