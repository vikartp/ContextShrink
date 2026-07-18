"use client";

import EditorPanel from "./EditorPanel";
import ResultPanel from "./ResultPanel";

interface WorkspaceProps {
  inputCode: string;
  onInputChange: (value: string) => void;
  output: string;
  isStreaming: boolean;
  language: string;
  onLanguageChange: (lang: string) => void;
  inputTokens: number;
  outputTokens: number;
  onCopy: () => void;
  copied: boolean;
  onClear: () => void;
  onFileDrop: (content: string, name: string) => void;
  fileName: string;
}

export default function Workspace({
  inputCode,
  onInputChange,
  output,
  isStreaming,
  language,
  onLanguageChange,
  inputTokens,
  outputTokens,
  onCopy,
  copied,
  onClear,
  onFileDrop,
  fileName,
}: WorkspaceProps) {
  return (
    <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
      <EditorPanel
        code={inputCode}
        onChange={onInputChange}
        language={language}
        onLanguageChange={onLanguageChange}
        tokenCount={inputTokens}
        onClear={onClear}
        onFileDrop={onFileDrop}
        fileName={fileName}
      />
      <ResultPanel
        output={output}
        isStreaming={isStreaming}
        language={language}
        tokenCount={outputTokens}
        onCopy={onCopy}
        copied={copied}
      />
    </div>
  );
}
