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
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-[4px] flex items-center justify-center z-[1000] animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="w-[90%] max-w-[480px] animate-slide-up bg-bg-elevated backdrop-blur-lg border border-border-default rounded-lg shadow-md">
        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              ⚙️ Settings
            </h2>
            <button
              className="btn btn-ghost btn-icon text-xl"
              onClick={onClose}
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
            <span className="text-xs text-text-tertiary mt-1 block">
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

          <div className="px-4 py-3 bg-accent-cyan-soft rounded-md text-xs text-accent-cyan flex items-start gap-2">
            <span>🔒</span>
            <span>
              API key is configured server-side via environment variables for
              security. Settings here are stored in your browser&apos;s
              localStorage only.
            </span>
          </div>

          <div className="flex gap-3 justify-end">
            <button className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary min-w-[100px]"
              onClick={handleSave}
            >
              {saved ? "✓ Saved!" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
