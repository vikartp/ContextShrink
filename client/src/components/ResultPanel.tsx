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
    <div className="flex flex-col min-h-0 overflow-hidden bg-bg-surface backdrop-blur-md border border-border-subtle rounded-lg">
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-border-subtle">
        <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <span>✨</span>
          <span>Shrunk Output</span>
          {isStreaming && (
            <span className="badge animate-pulse bg-accent-purple-soft text-accent-purple">
              ● streaming...
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {output && (
            <button className="btn btn-ghost btn-sm" onClick={onCopy}>
              {copied ? "✓ Copied!" : "📋 Copy"}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden relative">
        {!output && !isStreaming ? (
          <div className="empty-state">
            <span className="empty-state-icon">✨</span>
            <span>Your shrunk code will appear here</span>
            <span className="text-xs">
              Paste code on the left and click &quot;Shrink It&quot;
            </span>
          </div>
        ) : (
          <div className="h-full relative">
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
              <div className="absolute bottom-3 right-3">
                <span className="streaming-cursor" />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-t border-border-subtle text-xs text-text-tertiary">
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
