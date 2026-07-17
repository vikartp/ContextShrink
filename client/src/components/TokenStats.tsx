"use client";

import { formatNumber } from "@/utils/helpers";
import { estimateCost } from "@/utils/tokenCounter";

interface TokenStatsProps {
  inputTokens: number;
  outputTokens: number;
  savings?: { percentage: number; cost: string };
}

export default function TokenStats({ inputTokens, outputTokens, savings }: TokenStatsProps) {
  const percentage = savings?.percentage || 0;

  return (
    <div className="stats-bar glass-card">
      <div className="stat-item">
        <div>
          <div className="stat-value" style={{ color: "var(--text-secondary)" }}>
            {formatNumber(inputTokens)}
          </div>
          <div className="stat-label">Original</div>
        </div>
      </div>

      <div style={{ color: "var(--text-tertiary)", fontSize: "1.2rem" }}>→</div>

      <div className="stat-item">
        <div>
          <div className="stat-value" style={{ color: "var(--accent-cyan)" }}>
            {formatNumber(outputTokens)}
          </div>
          <div className="stat-label">Shrunk</div>
        </div>
      </div>

      <div className="stats-progress">
        <div
          className="stats-progress-fill"
          style={{ width: `${100 - percentage}%` }}
        />
      </div>

      <div className="stat-item">
        <div>
          <div
            className="stat-value"
            style={{
              color:
                percentage >= 30
                  ? "var(--accent-green)"
                  : percentage >= 15
                    ? "var(--accent-amber)"
                    : "var(--text-secondary)",
            }}
          >
            {percentage}%
          </div>
          <div className="stat-label">Saved</div>
        </div>
      </div>

      <div className="stat-item">
        <div>
          <div className="stat-value" style={{ color: "var(--accent-amber)", fontSize: "var(--font-size-sm)" }}>
            {formatNumber(Math.max(0, inputTokens - outputTokens))}
          </div>
          <div className="stat-label">Tokens saved</div>
        </div>
      </div>
    </div>
  );
}
