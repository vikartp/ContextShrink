"use client";

const MODES = [
  { key: "code", label: "🧑‍💻 Code", tooltip: "Strip comments, dead imports, boilerplate" },
  { key: "text", label: "📝 Text", tooltip: "Compress text to essential meaning" },
  { key: "prompt", label: "🎯 Prompt", tooltip: "Optimize prompts for token efficiency" },
];

interface ModeSelectorProps {
  mode: string;
  onModeChange: (mode: string) => void;
}

export default function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex gap-[2px] bg-bg-surface border border-border-subtle rounded-full p-[3px]">
      {MODES.map((m) => (
        <div key={m.key} className="tooltip-wrapper">
          <button
            className={`px-4 py-1 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              mode === m.key
                ? "text-white bg-gradient-to-br from-accent-cyan to-accent-purple shadow-[0_0_20px_rgba(0,212,255,0.15)] hover:text-white"
                : "text-text-secondary bg-transparent hover:text-text-primary hover:bg-bg-surface-hover"
            }`}
            onClick={() => onModeChange(m.key)}
          >
            {m.label}
          </button>
          <span className="tooltip">{m.tooltip}</span>
        </div>
      ))}
    </div>
  );
}
