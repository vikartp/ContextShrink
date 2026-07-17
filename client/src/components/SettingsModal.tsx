"use client";

import { useState, useEffect } from "react";

const DEFAULT_SETTINGS = {
  apiUrl: "",
  model: "",
};

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("contextshrink-settings");
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem(
        "contextshrink-settings",
        JSON.stringify(settings)
      );
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1000);
    } catch {
      // ignore
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content glass-card-elevated">
        <div
          style={{
            padding: "var(--space-6)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-5)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h2
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              ⚙️ Settings
            </h2>
            <button
              className="btn btn-ghost btn-icon"
              onClick={onClose}
              style={{ fontSize: "1.2rem" }}
            >
              ✕
            </button>
          </div>

          <div>
            <label className="input-label">API Base URL (optional override)</label>
            <input
              className="input-field"
              type="text"
              placeholder="Default: from server .env"
              value={settings.apiUrl}
              onChange={(e) =>
                setSettings({ ...settings, apiUrl: e.target.value })
              }
            />
            <span
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-tertiary)",
                marginTop: "var(--space-1)",
                display: "block",
              }}
            >
              Leave empty to use the server&apos;s configured base URL
            </span>
          </div>

          <div>
            <label className="input-label">Model (optional override)</label>
            <input
              className="input-field"
              type="text"
              placeholder="Default: from server .env (gpt-4o-mini)"
              value={settings.model}
              onChange={(e) =>
                setSettings({ ...settings, model: e.target.value })
              }
            />
          </div>

          <div
            style={{
              padding: "var(--space-3) var(--space-4)",
              background: "var(--accent-cyan-soft)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--font-size-xs)",
              color: "var(--accent-cyan)",
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--space-2)",
            }}
          >
            <span>🔒</span>
            <span>
              API key is configured server-side via environment variables for
              security. Settings here are stored in your browser&apos;s
              localStorage only.
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: "var(--space-3)",
              justifyContent: "flex-end",
            }}
          >
            <button className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              style={{ minWidth: "100px" }}
            >
              {saved ? "✓ Saved!" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
