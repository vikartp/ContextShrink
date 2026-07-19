"use client";

import { useState, useEffect } from "react";

interface SampleFile {
  name: string;
  size: number;
  category: "code" | "text" | "prompt";
}

interface SampleDataModalProps {
  onClose: () => void;
  onSelect: (content: string, filename: string, category: "code" | "text" | "prompt") => void;
}

const CATEGORY_META: Record<string, { icon: string; label: string; description: string }> = {
  code:   { icon: "📜", label: "Code",   description: "Source code files" },
  text:   { icon: "📄", label: "Text",   description: "Plain text & documents" },
  prompt: { icon: "🎯", label: "Prompt", description: "LLM prompts" },
};

const CATEGORY_ORDER: Array<"code" | "text" | "prompt"> = ["code", "text", "prompt"];

/** Map file extensions to display icons */
function getFileIcon(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  const iconMap: Record<string, string> = {
    js: "📜", jsx: "⚛️", ts: "🔷", tsx: "⚛️",
    py: "🐍", java: "☕", txt: "📄", md: "📝",
    json: "📋", html: "🌐", css: "🎨", sql: "🗄️",
  };
  return iconMap[ext] || "📄";
}

/** Format bytes to human-readable size */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

/** Pick a subtle description based on filename */
function getFileDescription(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("secret")) return "Contains sample API keys & credentials";
  if (lower.includes("code")) return "JavaScript with verbose patterns";
  if (lower.includes("prompt")) return "Wordy LLM prompt for compression";
  if (lower.includes("text")) return "Redundant business writing sample";
  return "Sample file for testing";
}

export default function SampleDataModal({ onClose, onSelect }: SampleDataModalProps) {
  const [files, setFiles] = useState<SampleFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"code" | "text" | "prompt">("code");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // Fetch file list on mount
  useEffect(() => {
    fetch(`${apiUrl}/api/samples`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch sample list");
        return res.json();
      })
      .then((data) => {
        const fetchedFiles: SampleFile[] = data.files || [];
        setFiles(fetchedFiles);
        // Default to first tab that has files
        const firstCategory = CATEGORY_ORDER.find((cat) =>
          fetchedFiles.some((f) => f.category === cat)
        );
        if (firstCategory) setActiveTab(firstCategory);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [apiUrl]);

  // Handle file selection
  const handleSelect = async (file: SampleFile) => {
    setLoadingFile(file.name);
    try {
      const res = await fetch(`${apiUrl}/api/samples/${encodeURIComponent(file.name)}`);
      if (!res.ok) throw new Error("Failed to load file");
      const data = await res.json();
      onSelect(data.content, data.name, data.category);
      onClose();
    } catch (err: any) {
      setError(err.message);
      setLoadingFile(null);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Group files by category
  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = files.filter((f) => f.category === cat);
    return acc;
  }, {} as Record<string, SampleFile[]>);

  const currentFiles = grouped[activeTab] || [];

  // Tabs that have at least one file
  const availableTabs = CATEGORY_ORDER.filter((cat) => (grouped[cat] || []).length > 0);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-[4px] flex items-center justify-center z-[1000] animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="w-[520px] max-w-[90vw] animate-slide-up bg-bg-elevated backdrop-blur-lg border border-border-default rounded-lg shadow-md flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">📂</span>
            <h2 className="text-base font-semibold">Try Sample Data</h2>
            <span className="text-xs text-text-tertiary ml-1">— pick a file to load</span>
          </div>
          <button
            className="btn btn-ghost btn-icon text-xl"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Category Tabs */}
        {!loading && !error && availableTabs.length > 0 && (
          <div className="px-5 pt-4 pb-0 shrink-0">
            <div className="pill-group">
              {availableTabs.map((cat) => {
                const meta = CATEGORY_META[cat];
                return (
                  <button
                    key={cat}
                    className={`pill${activeTab === cat ? " pill-active" : ""}`}
                    onClick={() => setActiveTab(cat)}
                  >
                    {meta.icon} {meta.label}
                    <span className="ml-1 text-xs opacity-60">({grouped[cat].length})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {loading && (
            <div className="flex items-center justify-center py-10 text-text-tertiary">
              <span className="animate-pulse text-sm">Loading samples…</span>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-3 py-8">
              <span className="text-2xl">⚠️</span>
              <p className="text-sm text-accent-red text-center">{error}</p>
              <button className="btn btn-ghost btn-sm" onClick={onClose}>
                Close
              </button>
            </div>
          )}

          {!loading && !error && files.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-8 text-text-tertiary">
              <span className="text-2xl">📭</span>
              <p className="text-sm">No sample files found on the server.</p>
            </div>
          )}

          {!loading && !error && currentFiles.length > 0 && (
            <div className="flex flex-col gap-2">
              {currentFiles.map((file) => (
                <button
                  key={file.name}
                  className="group flex items-center gap-3 px-4 py-3 rounded-lg border border-border-subtle bg-bg-surface hover:bg-bg-surface-hover hover:border-border-accent transition-all text-left w-full disabled:opacity-50"
                  onClick={() => handleSelect(file)}
                  disabled={loadingFile !== null}
                >
                  <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">
                    {getFileIcon(file.name)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary truncate">
                        {file.name}
                      </span>
                      {loadingFile === file.name && (
                        <span className="text-xs text-accent-cyan animate-pulse">loading…</span>
                      )}
                    </div>
                    <p className="text-xs text-text-tertiary mt-0.5 truncate">
                      {getFileDescription(file.name)} · {formatSize(file.size)}
                    </p>
                  </div>
                  <span className="text-text-tertiary group-hover:text-accent-cyan transition-colors text-sm shrink-0">
                    →
                  </span>
                </button>
              ))}
            </div>
          )}

          {!loading && !error && currentFiles.length === 0 && files.length > 0 && (
            <div className="flex flex-col items-center gap-3 py-8 text-text-tertiary">
              <span className="text-2xl">📭</span>
              <p className="text-sm">No samples in this category.</p>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-5 py-3 border-t border-border-subtle shrink-0">
          <p className="text-xs text-text-tertiary text-center">
            Select a file to load it into the editor. Mode will switch to <strong>{CATEGORY_META[activeTab].label}</strong> automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
