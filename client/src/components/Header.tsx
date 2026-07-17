"use client";

import ModeSelector from "./ModeSelector";

interface HeaderProps {
  mode: string;
  onModeChange: (mode: string) => void;
}

export default function Header({ mode, onModeChange }: HeaderProps) {
  return (
    <header className="app-header">
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <span style={{ fontSize: "1.5rem" }}>🔮</span>
          <h1
            className="gradient-text"
            style={{
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--font-weight-bold)",
              letterSpacing: "-0.02em",
            }}
          >
            ContextShrink
          </h1>
        </div>
        <span
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-tertiary)",
            padding: "2px 8px",
            background: "var(--accent-purple-soft)",
            borderRadius: "var(--radius-full)",
            fontWeight: "var(--font-weight-medium)",
          }}
        >
          beta
        </span>
      </div>

      <ModeSelector mode={mode} onModeChange={onModeChange} />

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <a
          href="https://github.com/vikartp/ContextShrink"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-icon"
          title="Repo"
          style={{ fontSize: "1.1rem" }}
        >
          ⟨/⟩
        </a>
      </div>
    </header>
  );
}
