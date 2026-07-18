"use client";

export default function Footer() {
  return (
    <footer className="flex-shrink-0 px-6 py-3 border-t border-border-subtle flex items-center justify-between text-xs text-text-tertiary">
      <div className="flex items-center gap-2">
        <span>🔒</span>
        <span>
          Secrets are scanned in your browser — they never leave your machine
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="px-2.5 py-0.5 bg-accent-purple-soft rounded-full text-accent-purple font-medium">
          Open Source
        </span>
        <span>·</span>
        <span>Powered by OpenAI</span>
      </div>
    </footer>
  );
}
