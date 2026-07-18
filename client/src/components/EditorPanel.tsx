"use client";

import { useCallback, useState, useEffect } from "react";
import { detectLanguage, getLanguageLabel, formatNumber } from "@/utils/helpers";
import DropZone from "./DropZone";
import dynamic from "next/dynamic";

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
  loading: () => (
    <div className="empty-state">
      <span className="animate-pulse" style={{ color: "var(--text-tertiary)" }}>
        Loading editor...
      </span>
    </div>
  ),
});

// Lazy-load language support
const getLanguageExtension = async (lang: string) => {
  try {
    switch (lang) {
      case "javascript":
      case "typescript": {
        const { javascript } = await import("@codemirror/lang-javascript");
        return lang === "typescript"
          ? javascript({ typescript: true, jsx: true })
          : javascript({ jsx: true });
      }
      case "python": {
        const { python } = await import("@codemirror/lang-python");
        return python();
      }
      case "java":
      case "kotlin":
      case "scala": {
        const { java } = await import("@codemirror/lang-java");
        return java();
      }
      case "cpp":
      case "csharp": {
        const { cpp } = await import("@codemirror/lang-cpp");
        return cpp();
      }
      case "html": {
        const { html } = await import("@codemirror/lang-html");
        return html();
      }
      case "css": {
        const { css } = await import("@codemirror/lang-css");
        return css();
      }
      case "json": {
        const { json } = await import("@codemirror/lang-json");
        return json();
      }
      case "markdown": {
        const { markdown } = await import("@codemirror/lang-markdown");
        return markdown();
      }
      case "sql": {
        const { sql } = await import("@codemirror/lang-sql");
        return sql();
      }
      case "xml": {
        const { xml } = await import("@codemirror/lang-xml");
        return xml();
      }
      case "yaml": {
        const { yaml } = await import("@codemirror/lang-yaml");
        return yaml();
      }
      case "rust": {
        const { rust } = await import("@codemirror/lang-rust");
        return rust();
      }
      case "php": {
        const { php } = await import("@codemirror/lang-php");
        return php();
      }
      default: {
        const { javascript } = await import("@codemirror/lang-javascript");
        return javascript();
      }
    }
  } catch {
    return null;
  }
};


interface EditorPanelProps {
  code: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  tokenCount: number;
  onClear: () => void;
  onFileDrop: (content: string, name: string) => void;
  fileName: string;
}

export default function EditorPanel({
  code,
  onChange,
  language,
  onLanguageChange,
  tokenCount,
  onClear,
  onFileDrop,
  fileName,
}: EditorPanelProps) {
  const [extensions, setExtensions] = useState<any[]>([]);
  const [themeExt, setThemeExt] = useState<any>(null);

  // Load theme
  useEffect(() => {
    import("@codemirror/theme-one-dark").then(({ oneDark }) => {
      setThemeExt(oneDark);
    });
  }, []);

  // Load language extension when language changes
  useEffect(() => {
    getLanguageExtension(language).then((ext) => {
      if (ext) setExtensions([ext]);
    });
  }, [language]);

  // Handle file drop
  const handleDrop = useCallback(
    (content: string, name: string) => {
      const lang = detectLanguage(name);
      onLanguageChange(lang);
      onFileDrop(content, name);
    },
    [onLanguageChange, onFileDrop]
  );

  // Handle paste from clipboard
  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) onChange(text);
    } catch {
      // Clipboard API not available
    }
  }, [onChange]);

  const allExtensions = themeExt ? [themeExt, ...extensions] : extensions;

  return (
    <div className="flex flex-col min-h-0 overflow-hidden bg-bg-surface backdrop-blur-md border border-border-subtle rounded-lg">
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-border-subtle">
        <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <span>📝</span>
          <span>Input</span>
          {fileName && (
            <span className="badge bg-accent-cyan-soft text-accent-cyan">
              {fileName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {code && (
            <button className="btn btn-ghost btn-sm" onClick={onClear}>
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden relative">
        {!code ? (
          <DropZone onDrop={handleDrop} onPaste={handlePaste} />
        ) : (
          <CodeMirror
            value={code}
            onChange={onChange}
            extensions={allExtensions}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLine: true,
              highlightSelectionMatches: true,
              foldGutter: true,
              autocompletion: false,
            }}
            style={{ height: "100%", overflow: "auto" }}
          />
        )}
      </div>

      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-t border-border-subtle text-xs text-text-tertiary">
        <span>
          {formatNumber(tokenCount)} tokens · {code.length.toLocaleString()} chars
        </span>
        <span className="badge badge-success">
          {getLanguageLabel(language)}
        </span>
      </div>
    </div>
  );
}
