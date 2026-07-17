"use client";

import { useEffect, useState } from "react";
import { formatNumber, getLanguageLabel } from "@/utils/helpers";
import dynamic from "next/dynamic";

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
  loading: () => (
    <div className="empty-state">
      <span className="animate-pulse" style={{ color: "var(--text-tertiary)" }}>
        Loading...
      </span>
    </div>
  ),
});

interface ResultPanelProps {
  output: string;
  isStreaming: boolean;
  language: string;
  tokenCount: number;
  onCopy: () => void;
  copied: boolean;
}

export default function ResultPanel({
  output,
  isStreaming,
  language,
  tokenCount,
  onCopy,
  copied,
}: ResultPanelProps) {
  const [extensions, setExtensions] = useState<any[]>([]);
  const [themeExt, setThemeExt] = useState<any>(null);

  useEffect(() => {
    import("@codemirror/theme-one-dark").then(({ oneDark }) => {
      setThemeExt(oneDark);
    });
  }, []);

  useEffect(() => {
    const loadLang = async () => {
      try {
        let ext: any;
        switch (language) {
          case "javascript":
          case "typescript": {
            const { javascript } = await import("@codemirror/lang-javascript");
            ext = language === "typescript"
              ? javascript({ typescript: true, jsx: true })
              : javascript({ jsx: true });
            break;
          }
          case "python": {
            const { python } = await import("@codemirror/lang-python");
            ext = python();
            break;
          }
          default: {
            const { javascript } = await import("@codemirror/lang-javascript");
            ext = javascript();
          }
        }
        if (ext) setExtensions([ext]);
      } catch {
        // ignore
      }
    };
    loadLang();
  }, [language]);

  const allExtensions = themeExt ? [themeExt, ...extensions] : extensions;

  return (
    <div className="panel glass-card">
      <div className="panel-header">
        <div className="panel-header-title">
          <span>✨</span>
          <span>Shrunk Output</span>
          {isStreaming && (
            <span
              className="badge animate-pulse"
              style={{
                background: "var(--accent-purple-soft)",
                color: "var(--accent-purple)",
              }}
            >
              ● streaming...
            </span>
          )}
        </div>
        <div className="panel-header-actions">
          {output && (
            <button className="btn btn-ghost btn-sm" onClick={onCopy}>
              {copied ? "✓ Copied!" : "📋 Copy"}
            </button>
          )}
        </div>
      </div>

      <div className="panel-body">
        {!output && !isStreaming ? (
          <div className="empty-state">
            <span className="empty-state-icon">✨</span>
            <span>Your shrunk code will appear here</span>
            <span style={{ fontSize: "var(--font-size-xs)" }}>
              Paste code on the left and click &quot;Shrink It&quot;
            </span>
          </div>
        ) : (
          <div style={{ height: "100%", position: "relative" }}>
            <CodeMirror
              value={output}
              readOnly={true}
              editable={false}
              extensions={allExtensions}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLine: false,
                foldGutter: false,
                autocompletion: false,
              }}
              style={{ height: "100%", overflow: "auto" }}
            />
            {isStreaming && (
              <div
                style={{
                  position: "absolute",
                  bottom: "var(--space-3)",
                  right: "var(--space-3)",
                }}
              >
                <span className="streaming-cursor" />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="panel-footer">
        <span>
          {output
            ? `${formatNumber(tokenCount)} tokens · ${output.length.toLocaleString()} chars`
            : "—"}
        </span>
        <span className="badge badge-success">
          {getLanguageLabel(language)}
        </span>
      </div>
    </div>
  );
}
