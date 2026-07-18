"use client";

import { useState } from "react";
import ModeSelector from "./ModeSelector";
import ThemeToggle from "./ThemeToggle";
import HelpModal from "./HelpModal";

interface HeaderProps {
  mode: string;
  onModeChange: (mode: string) => void;
}

export default function Header({ mode, onModeChange }: HeaderProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
    <header className="app-header">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔮</span>
          <h1 className="gradient-text text-lg font-bold tracking-tight">
            ContextShrink
          </h1>
        </div>
        <span className="text-xs text-text-tertiary px-2 py-0.5 bg-accent-purple-soft rounded-full font-medium">
          beta
        </span>
      </div>

      <ModeSelector mode={mode} onModeChange={onModeChange} />

      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsHelpOpen(true)}
          className="btn btn-ghost btn-icon text-lg"
          title="Help"
        >
          ❓
        </button>
        <ThemeToggle />
        <a
          href="https://github.com/vikartp/ContextShrink"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-icon text-lg"
          title="Repo"
        >
          ⟨/⟩
        </a>
      </div>
    </header>
    {isHelpOpen && <HelpModal onClose={() => setIsHelpOpen(false)} />}
    </>
  );
}
