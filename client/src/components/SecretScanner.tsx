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
      <div className="flex-shrink-0 rounded-md overflow-hidden bg-bg-surface backdrop-blur-md border border-border-subtle">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2 text-sm">
            <span>🛡️</span>
            <span className="text-accent-green">
              No secrets detected
            </span>
            <span className="text-text-tertiary text-xs">
              — your code is safe to send
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 rounded-md overflow-hidden bg-bg-surface backdrop-blur-md border border-border-subtle">
      <div
        className="flex items-center justify-between px-4 py-2 cursor-pointer transition-colors hover:bg-bg-surface-hover"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 text-sm">
          <span>🛡️</span>
          <span className="text-accent-red font-semibold">
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

          <span className="text-text-tertiary text-xs ml-1">
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
        <div className="px-4 pb-3 flex flex-col gap-2 max-h-[150px] overflow-y-auto animate-slide-down">
          {secrets.map((finding) => (
            <div key={finding.id} className="flex items-center gap-3 px-3 py-2 bg-bg-secondary rounded-sm text-xs">
              <span>{finding.icon}</span>
              <span className="font-medium min-w-[120px]">{finding.type}</span>
              <span className="text-text-tertiary font-mono">line {finding.line}</span>
              <span className="flex-1 font-mono text-text-tertiary overflow-hidden text-ellipsis whitespace-nowrap">{finding.masked}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
