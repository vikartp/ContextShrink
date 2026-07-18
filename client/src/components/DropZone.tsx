"use client";

import { useState, useCallback, useRef } from "react";
import { isAcceptedFile } from "@/utils/helpers";

interface DropZoneProps {
  onDrop: (content: string, name: string) => void;
  onPaste: () => void;
}

export default function DropZone({ onDrop, onPaste }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      const file = files[0];
      if (!isAcceptedFile(file.name)) {
        alert(
          "Unsupported file type. Please drop a code or text file (.js, .py, .ts, .java, .txt, etc.)"
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === "string") {
          onDrop(event.target.result, file.name);
        }
      };
      reader.readAsText(file);
    },
    [onDrop]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === "string") {
          onDrop(event.target.result, file.name);
        }
      };
      reader.readAsText(file);
    },
    [onDrop]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-md transition-all cursor-pointer ${
        isDragging
          ? "border-accent-cyan bg-accent-cyan-soft"
          : "border-border-default hover:border-accent-cyan hover:bg-accent-cyan-soft"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".js,.jsx,.ts,.tsx,.py,.java,.rb,.go,.rs,.cpp,.c,.h,.cs,.php,.swift,.kt,.sql,.html,.css,.json,.xml,.yaml,.yml,.md,.txt,.sh,.toml,.ini,.env"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      <span className="text-4xl opacity-60">📂</span>

      <div className="text-sm text-text-secondary text-center">
        <strong className="text-accent-cyan font-bold">Drop a file</strong> or click to browse
        <br />
        <span className="text-xs mt-1 block">
          .js · .ts · .py · .java · .go · .rs · .txt · and more
        </span>
      </div>

      <div className="flex gap-2 mt-2">
        <button
          className="btn btn-ghost btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            onPaste();
          }}
        >
          📋 Paste from Clipboard
        </button>
      </div>
    </div>
  );
}
