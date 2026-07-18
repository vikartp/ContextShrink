/**
 * Client-side secret scanner.
 * Detects API keys, tokens, passwords, and PII using regex patterns.
 * ALL scanning happens in the browser — secrets never leave the client.
 */

export interface Finding {
  id: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low" | string;
  icon: string;
  line: number;
  column: number;
  raw: string;
  masked: string;
  start: number;
  end: number;
}

const SECRET_PATTERNS = [
  {
    type: "AWS Access Key",
    regex: /(?:AKIA[0-9A-Z]{16})/g,
    severity: "critical",
    icon: "🔴",
  },
  {
    type: "AWS Secret Key",
    regex:
      /(?:aws_secret_access_key|aws_secret)\s*[:=]\s*['"]?([A-Za-z0-9/+=]{40})['"]?/gi,
    severity: "critical",
    icon: "🔴",
  },
  {
    type: "GitHub Token",
    regex: /(?:ghp_[A-Za-z0-9]{36}|gho_[A-Za-z0-9]{36}|ghs_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{82})/g,
    severity: "critical",
    icon: "🔴",
  },
  {
    type: "OpenAI API Key",
    regex: /sk-[a-zA-Z0-9]{20,}/g,
    severity: "critical",
    icon: "🔴",
  },
  {
    type: "Stripe Key",
    regex: /(?:sk_live_|pk_live_|rk_live_)[a-zA-Z0-9]{20,}/g,
    severity: "critical",
    icon: "🔴",
  },
  {
    type: "Private Key",
    regex: /-----BEGIN\s(?:RSA\s|EC\s|DSA\s|OPENSSH\s)?PRIVATE\sKEY-----/g,
    severity: "critical",
    icon: "🔴",
  },
  {
    type: "JWT Token",
    regex: /eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g,
    severity: "high",
    icon: "🟠",
  },
  {
    type: "Database URL",
    regex:
      /(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis|mssql):\/\/[^\s'"]+/gi,
    severity: "critical",
    icon: "🔴",
  },
  {
    type: "Generic Password",
    regex:
      /(?:password|passwd|pwd|secret|token|api_key|apikey|access_token|auth_token)\s*[:=]\s*['"]([^'"]{4,})['"]?/gi,
    severity: "high",
    icon: "🟠",
  },
  {
    type: "Slack Token",
    regex: /xox[bpors]-[a-zA-Z0-9-]{10,}/g,
    severity: "critical",
    icon: "🔴",
  },
  {
    type: "Google API Key",
    regex: /AIza[0-9A-Za-z_-]{35}/g,
    severity: "high",
    icon: "🟠",
  },
  {
    type: "SendGrid Key",
    regex: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/g,
    severity: "critical",
    icon: "🔴",
  },
  {
    type: "Twilio Key",
    regex: /SK[a-f0-9]{32}/g,
    severity: "high",
    icon: "🟠",
  },
  {
    type: "Heroku API Key",
    regex: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g,
    severity: "medium",
    icon: "🟡",
  },
  {
    type: "IP Address",
    regex:
      /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g,
    severity: "low",
    icon: "🔵",
  },
  {
    type: "Email Address",
    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    severity: "low",
    icon: "🔵",
  },
];

/**
 * Scan code for secrets and PII.
 * Returns an array of findings with type, location, and masked preview.
 */
export function scanSecrets(code: string): Finding[] {
  if (!code) return [];

  const findings: Finding[] = [];


  for (const pattern of SECRET_PATTERNS) {
    // Reset regex state
    pattern.regex.lastIndex = 0;

    let match;
    while ((match = pattern.regex.exec(code)) !== null) {
      // Find which line the match is on
      const beforeMatch = code.substring(0, match.index);
      const lineNumber = beforeMatch.split("\n").length;
      const column =
        match.index - beforeMatch.lastIndexOf("\n") - 1;

      const raw = match[0];
      const masked = maskValue(raw);

      findings.push({
        id: `${pattern.type}-${match.index}`,
        type: pattern.type,
        severity: pattern.severity,
        icon: pattern.icon,
        line: lineNumber,
        column,
        raw,
        masked,
        start: match.index,
        end: match.index + raw.length,
      });
    }
  }

  // Sort by line number
  findings.sort((a, b) => a.line - b.line);

  // Deduplicate overlapping findings (keep the more specific/critical one)
  const deduped: Finding[] = [];
  for (const finding of findings) {
    const overlaps = deduped.some(
      (f) =>
        (finding.start >= f.start && finding.start < f.end) ||
        (f.start >= finding.start && f.start < finding.end)
    );
    if (!overlaps) {
      deduped.push(finding);
    }
  }

  return deduped;
}

/**
 * Mask a secret value, showing only the first few and last few characters.
 */
function maskValue(value: string): string {
  if (value.length <= 8) return "████████";

  const showChars = Math.min(4, Math.floor(value.length * 0.15));
  const start = value.substring(0, showChars);
  const end = value.substring(value.length - showChars);
  const maskLength = Math.min(value.length - showChars * 2, 20);
  const mask = "█".repeat(maskLength);

  return `${start}${mask}${end}`;
}

/**
 * Replace all detected secrets in code with safe placeholders.
 */
export function maskAllSecrets(code: string, findings: Finding[]): string {
  if (!findings || findings.length === 0) return code;

  // Sort findings by start position in reverse order
  // (so replacing doesn't shift subsequent positions)
  const sorted = [...findings].sort((a, b) => b.start - a.start);

  let result = code;
  for (const finding of sorted) {
    const placeholder = `[REDACTED_${finding.type.toUpperCase().replace(/\s+/g, "_")}]`;
    result =
      result.substring(0, finding.start) +
      placeholder +
      result.substring(finding.end);
  }

  return result;
}

/**
 * Mask a single secret in the code.
 */
export function maskSingleSecret(code: string, finding: Finding): string {
  const placeholder = `[REDACTED_${finding.type.toUpperCase().replace(/\s+/g, "_")}]`;
  return (
    code.substring(0, finding.start) +
    placeholder +
    code.substring(finding.end)
  );
}

/**
 * Get a summary of scan results.
 */
export function getScanSummary(findings: Finding[]) {
  const critical = findings.filter((f) => f.severity === "critical").length;
  const high = findings.filter((f) => f.severity === "high").length;
  const medium = findings.filter((f) => f.severity === "medium").length;
  const low = findings.filter((f) => f.severity === "low").length;

  return { total: findings.length, critical, high, medium, low };
}
