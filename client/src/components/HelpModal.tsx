"use client";

interface HelpModalProps {
  onClose: () => void;
}

export default function HelpModal({ onClose }: HelpModalProps) {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-[4px] flex items-center justify-center z-[1000] animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="w-[80vw] h-[80vh] animate-slide-up bg-bg-elevated backdrop-blur-lg border border-border-default rounded-lg shadow-md flex flex-col">
        <div className="p-6 flex items-center justify-between border-b border-border-subtle shrink-0">
          <h2 className="text-lg font-semibold">
            ℹ️ Know More About ContextShrink
          </h2>
          <button
            className="btn btn-ghost btn-icon text-xl"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 text-sm text-text-secondary space-y-6 leading-relaxed">
          <p>
            <strong>ContextShrink</strong> helps you compress your code and text before sending it to Large Language Models (LLMs).
          </p>

          <div>
            <h3 className="font-semibold text-text-primary mb-2">Why is it useful?</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Save Tokens:</strong> Reduce costs and avoid hitting context limits.</li>
              <li><strong>Increase Capacity:</strong> Fit more files and larger codebases into a single prompt.</li>
              <li><strong>Security:</strong> Scan and mask secrets (like API keys) locally before they leave your machine.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-text-primary mb-2">How does it work?</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your code is scanned for secrets entirely in your browser.</li>
              <li>The payload is sent to our backend where an LLM (or algorithms) intelligently strips out non-essential syntax, formatting, and comments based on your selected mode.</li>
              <li>The minified output retains the logical structure needed for another LLM to understand it perfectly!</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-text-primary mb-2">🚀 Pro Tip: Best Use Case</h3>
            <div className="bg-bg-surface border border-border-subtle rounded-md p-4 space-y-3">
              <p>
                Run ContextShrink locally and integrate it directly into your VS Code workflow:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Press <kbd className="bg-bg-elevated px-1 py-0.5 rounded text-xs border border-border-default font-mono">Ctrl+Shift+P</kbd> (or <kbd className="bg-bg-elevated px-1 py-0.5 rounded text-xs border border-border-default font-mono">Cmd+Shift+P</kbd> on Mac) in VS Code.</li>
                <li>Search for and select <strong>Simple Browser: Show</strong>.</li>
                <li>Enter your local ContextShrink URL (e.g., <code className="bg-bg-elevated px-1 py-0.5 rounded text-xs border border-border-default">http://localhost:3000</code>).</li>
                <li>Now you have ContextShrink open right next to your code! You can easily copy/paste code back and forth, and copy the minified output to send directly to GitHub Copilot Chat or Claude Code.</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-text-primary mb-2">💡 Cost Savings Example</h3>
            <div className="bg-bg-surface border border-border-subtle rounded-md p-4 space-y-3">
              <p>
                Imagine iterating on a feature with an LLM (like ChatGPT or Claude) where you need to include a 1,000-line codebase in your prompt.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Without ContextShrink:</strong> You send ~20,000 tokens per message. In a 10-message back-and-forth conversation, you pay for <strong>200,000 tokens</strong> just for the context!</li>
                <li><strong>With ContextShrink:</strong> We strip the non-essential boilerplate down to ~8,000 tokens. That same 10-message conversation now only costs <strong>80,000 tokens</strong>.</li>
              </ul>
              <p className="pt-1 text-accent-cyan font-medium">
                That's a 60% reduction in API costs, and it leaves much more room in the context window for the LLM's actual response!
              </p>
            </div>
          </div>

        </div>

        <div className="p-6 flex justify-end shrink-0 border-t border-border-subtle">
          <button className="btn btn-primary min-w-[100px]" onClick={onClose}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
