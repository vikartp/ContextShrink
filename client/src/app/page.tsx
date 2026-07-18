"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Workspace from "@/components/Workspace";
import ActionBar from "@/components/ActionBar";
import TokenStats from "@/components/TokenStats";
import SecretScanner from "@/components/SecretScanner";
import Footer from "@/components/Footer";
import ServerStatusBanner from "@/components/ServerStatusBanner";
import { useShrink } from "@/hooks/useShrink";
import { Finding, scanSecrets, maskAllSecrets } from "@/utils/secretScanner";
import { countTokens, calculateSavings } from "@/utils/tokenCounter";
import { debounce } from "@/utils/helpers";

export default function Home() {
  // Core state
  const [inputCode, setInputCode] = useState("");
  const [mode, setMode] = useState("code");
  const [language, setLanguage] = useState("javascript");
  const [fileName, setFileName] = useState("");

  // Secret scanning
  const [secrets, setSecrets] = useState<Finding[]>([]);

  // Token counting
  const [inputTokens, setInputTokens] = useState(0);
  const [outputTokens, setOutputTokens] = useState(0);
  const [savings, setSavings] = useState<{ percentage: number; cost: string } | null>(null);

  // UI state
  const [copied, setCopied] = useState(false);

  // Streaming hook
  const { shrink, output, isStreaming, error, abort, reset } = useShrink();

  // Scan secrets when input changes (debounced)
  const scanRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (scanRef.current) window.clearTimeout(scanRef.current as any);
    scanRef.current = setTimeout(() => {
      const findings = scanSecrets(inputCode);
      setSecrets(findings);
    }, 300);
    return () => window.clearTimeout(scanRef.current as any);
  }, [inputCode]);

  // Count input tokens when input changes (debounced)
  const tokenRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (tokenRef.current) window.clearTimeout(tokenRef.current as any);
    tokenRef.current = setTimeout(async () => {
      const count = await countTokens(inputCode);
      setInputTokens(count);
    }, 200);
    return () => window.clearTimeout(tokenRef.current as any);
  }, [inputCode]);

  // Count output tokens when output changes
  useEffect(() => {
    const updateOutputTokens = async () => {
      if (output) {
        const count = await countTokens(output);
        setOutputTokens(count);
        if (inputTokens > 0) {
          setSavings(calculateSavings(inputTokens, count));
        }
      } else {
        setOutputTokens(0);
        setSavings(null);
      }
    };
    updateOutputTokens();
  }, [output, inputTokens]);

  // Handle shrink action
  const handleShrink = useCallback(() => {
    if (!inputCode.trim()) return;
    shrink(inputCode, mode, language);
  }, [inputCode, mode, language, shrink]);

  // Handle auto-mask all secrets
  const handleMaskAll = useCallback(() => {
    if (secrets.length === 0) return;
    const masked = maskAllSecrets(inputCode, secrets);
    setInputCode(masked);
  }, [inputCode, secrets]);

  // Handle copy output
  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = output;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [output]);

  // Handle download output
  const handleDownload = useCallback(() => {
    if (!output) return;
    const ext = fileName ? fileName.split(".").pop() : "txt";
    const downloadName = fileName
      ? fileName.replace(`.${ext}`, `.shrunk.${ext}`)
      : `shrunk.${ext}`;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadName;
    a.click();
    URL.revokeObjectURL(url);
  }, [output, fileName]);

  // Handle clear
  const handleClear = useCallback(() => {
    setInputCode("");
    setSecrets([]);
    setInputTokens(0);
    setOutputTokens(0);
    setSavings(null);
    setFileName("");
    reset();
  }, [reset]);

  // Handle file drop
  const handleFileDrop = useCallback((content: string, name: string) => {
    setInputCode(content);
    setFileName(name);
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg-primary text-text-primary">
      <Header
        mode={mode}
        onModeChange={setMode}
      />

      <main className="flex-1 flex flex-col overflow-hidden px-6 py-4 gap-3">
        <ServerStatusBanner />

        <Workspace
          inputCode={inputCode}
          onInputChange={setInputCode}
          output={output}
          isStreaming={isStreaming}
          language={language}
          onLanguageChange={setLanguage}
          inputTokens={inputTokens}
          outputTokens={outputTokens}
          onCopy={handleCopy}
          copied={copied}
          onClear={handleClear}
          onFileDrop={handleFileDrop}
          fileName={fileName}
        />

        <SecretScanner
          secrets={secrets}
          onMaskAll={handleMaskAll}
        />

        {savings && !isStreaming && (
          <TokenStats
            inputTokens={inputTokens}
            outputTokens={outputTokens}
            savings={savings}
          />
        )}

        <ActionBar
          onShrink={handleShrink}
          onCopy={handleCopy}
          onDownload={handleDownload}
          onAbort={abort}
          isStreaming={isStreaming}
          hasInput={!!inputCode.trim()}
          hasOutput={!!output}
          copied={copied}
          error={error}
        />
      </main>

      <Footer />
    </div>
  );
}
