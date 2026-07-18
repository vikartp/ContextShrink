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
    <div className="flex-shrink-0 flex items-center gap-6 px-5 py-3 rounded-md animate-slide-up bg-bg-surface backdrop-blur-md border border-border-subtle">
      <div className="flex items-center gap-2">
        <div>
          <div className="text-base font-bold tabular-nums text-text-secondary">
            {formatNumber(inputTokens)}
          </div>
          <div className="text-xs text-text-tertiary">Original</div>
        </div>
      </div>

      <div className="text-text-tertiary text-xl">→</div>

      <div className="flex items-center gap-2">
        <div>
          <div className="text-base font-bold tabular-nums text-accent-cyan">
            {formatNumber(outputTokens)}
          </div>
          <div className="text-xs text-text-tertiary">Shrunk</div>
        </div>
      </div>

      <div className="flex-1 h-1.5 bg-bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple transition-[width] duration-800 ease-out"
          style={{ width: `${100 - percentage}%` }}
        />
      </div>

      <div className="flex items-center gap-2">
        <div>
          <div
            className={`text-base font-bold tabular-nums ${
              percentage >= 30
                ? "text-accent-green"
                : percentage >= 15
                  ? "text-accent-amber"
                  : "text-text-secondary"
            }`}
          >
            {percentage}%
          </div>
          <div className="text-xs text-text-tertiary">Saved</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div>
          <div className="text-sm font-bold tabular-nums text-accent-amber">
            {formatNumber(Math.max(0, inputTokens - outputTokens))}
          </div>
          <div className="text-xs text-text-tertiary">Tokens saved</div>
        </div>
      </div>
    </div>
  );
}
