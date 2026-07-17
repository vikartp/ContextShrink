"use client";

export default function Footer() {
  return (
    <footer className="app-footer">
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <span>🔒</span>
        <span>
          Secrets are scanned in your browser — they never leave your machine
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <span
          style={{
            padding: "2px 10px",
            background: "var(--accent-purple-soft)",
            borderRadius: "var(--radius-full)",
            color: "var(--accent-purple)",
            fontWeight: "var(--font-weight-medium)",
          }}
        >
          Open Source
        </span>
        <span>·</span>
        <span>Powered by OpenAI</span>
      </div>
    </footer>
  );
}
