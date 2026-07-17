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
}: ActionBarProps) {
  return (
    <div className="action-bar">
      {error && (
        <div
          className="badge badge-critical animate-slide-up"
          style={{
            padding: "var(--space-2) var(--space-4)",
            fontSize: "var(--font-size-sm)",
            maxWidth: "400px",
            textAlign: "center",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {isStreaming ? (
        <button className="btn btn-danger" onClick={onAbort}>
          ⏹ Stop
        </button>
      ) : (
        <button
          className="btn btn-primary"
          onClick={onShrink}
          disabled={!hasInput}
          style={{
            minWidth: "160px",
            position: "relative",
            overflow: "hidden",
          }}
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
