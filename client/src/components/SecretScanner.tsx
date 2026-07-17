"use client";

import { useState } from "react";
import { Finding, getScanSummary } from "@/utils/secretScanner";

interface SecretScannerProps {
  secrets: Finding[];
  onMaskAll: () => void;
}

export default function SecretScanner({ secrets, onMaskAll }: SecretScannerProps) {
  const [expanded, setExpanded] = useState(false);
  const summary = getScanSummary(secrets);

  if (secrets.length === 0) {
    return (
      <div className="scanner-bar glass-card">
        <div className="scanner-header">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            <span>🛡️</span>
            <span style={{ color: "var(--accent-green)" }}>
              No secrets detected
            </span>
            <span style={{ color: "var(--text-tertiary)", fontSize: "var(--font-size-xs)" }}>
              — your code is safe to send
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scanner-bar glass-card">
      <div
        className="scanner-header"
        onClick={() => setExpanded(!expanded)}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          <span>🛡️</span>
          <span style={{ color: "var(--accent-red)", fontWeight: "var(--font-weight-semibold)" }}>
            {secrets.length} secret{secrets.length !== 1 ? "s" : ""} detected
          </span>

          {summary.critical > 0 && (
            <span className="badge badge-critical">{summary.critical} critical</span>
          )}
          {summary.high > 0 && (
            <span className="badge badge-high">{summary.high} high</span>
          )}
          {summary.low > 0 && (
            <span className="badge badge-low">{summary.low} info</span>
          )}

          <span
            style={{
              color: "var(--text-tertiary)",
              fontSize: "var(--font-size-xs)",
              marginLeft: "var(--space-1)",
            }}
          >
            {expanded ? "▲" : "▼"}
          </span>
        </div>

        <button
          className="btn btn-danger btn-sm"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onMaskAll();
          }}
        >
          🔒 Auto-Mask All
        </button>
      </div>

      {expanded && (
        <div className="scanner-findings animate-slide-down">
          {secrets.map((finding) => (
            <div key={finding.id} className="finding-row">
              <span>{finding.icon}</span>
              <span className="finding-type">{finding.type}</span>
              <span className="finding-line">line {finding.line}</span>
              <span className="finding-preview">{finding.masked}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
