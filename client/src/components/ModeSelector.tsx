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
    <div className="pill-group">
      {MODES.map((m) => (
        <div key={m.key} className="tooltip-wrapper">
          <button
            className={`pill ${mode === m.key ? "pill-active" : ""}`}
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
