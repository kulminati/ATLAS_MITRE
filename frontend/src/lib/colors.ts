export const TACTIC_COLORS: Record<string, string> = {
  "AML.TA0002": "#6366f1", // Reconnaissance - indigo
  "AML.TA0003": "#8b5cf6", // Resource Development - violet
  "AML.TA0004": "#ec4899", // Initial Access - pink
  "AML.TA0000": "#ef4444", // ML Model Access - red (AI-specific)
  "AML.TA0005": "#f97316", // Execution - orange
  "AML.TA0006": "#eab308", // Persistence - yellow
  "AML.TA0012": "#84cc16", // Privilege Escalation - lime
  "AML.TA0007": "#22c55e", // Defense Evasion - green
  "AML.TA0013": "#14b8a6", // Credential Access - teal
  "AML.TA0008": "#06b6d4", // Discovery - cyan
  "AML.TA0015": "#0ea5e9", // Lateral Movement - sky (AI-specific)
  "AML.TA0009": "#3b82f6", // Collection - blue
  "AML.TA0001": "#a855f7", // ML Attack Staging - purple (AI-specific)
  "AML.TA0014": "#d946ef", // Command and Control - fuchsia
  "AML.TA0010": "#f43f5e", // Exfiltration - rose
  "AML.TA0011": "#dc2626", // Impact - dark red
};

export const MATURITY_COLORS: Record<string, string> = {
  feasible: "#fbbf24",     // amber
  demonstrated: "#f97316", // orange
  realized: "#ef4444",     // red
};

export function getTacticColor(tacticId: string): string {
  return TACTIC_COLORS[tacticId] || "#6b7280"; // gray fallback
}
