"use client";

interface ActionBarProps {
  onShrink: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onAbort: () => void;
  isStreaming: boolean;
  hasInput: boolean;
  hasOutput: boolean;
  copied: boolean;
  error: string | null;
  animateShrink?: boolean;
}

export default function ActionBar({
  onShrink,
  onCopy,
  onDownload,
  onAbort,
  isStreaming,
  hasInput,
  hasOutput,
  copied,
  error,
  animateShrink,
}: ActionBarProps) {
  return (
    <div className="flex-shrink-0 flex items-center justify-center gap-3 py-2">
      {error && (
        <div className="badge badge-critical animate-slide-up px-4 py-2 text-sm max-w-[400px] text-center">
          ⚠️ {error}
        </div>
      )}

      {isStreaming ? (
        <button className="btn btn-danger" onClick={onAbort}>
          ⏹ Stop
        </button>
      ) : (
        <button
          className={`btn btn-primary min-w-[160px] relative overflow-hidden${animateShrink ? " animate-attention-pulse" : ""}`}
          onClick={onShrink}
          disabled={!hasInput}
        >
          🔮 Shrink It
        </button>
      )}

      <button
        className="btn btn-ghost"
        onClick={onCopy}
        disabled={!hasOutput}
      >
        {copied ? "✓ Copied!" : "📋 Copy"}
      </button>

      <button
        className="btn btn-ghost"
        onClick={onDownload}
        disabled={!hasOutput}
      >
        💾 Download
      </button>
    </div>
  );
}
