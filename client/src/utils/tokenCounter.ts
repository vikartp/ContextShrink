/**
 * Client-side token counter using js-tiktoken.
 * Uses o200k_base encoding (GPT-4o family).
 * All counting happens in the browser — no data sent anywhere.
 */

let encoder: any = null;

async function getEncoder() {
  if (encoder) return encoder;

  try {
    const { Tiktoken } = await import("js-tiktoken/lite");
    const { default: o200k_base } = await import("js-tiktoken/ranks/o200k_base");
    encoder = new Tiktoken(o200k_base);
    return encoder;
  } catch (error: any) {
    console.warn("Tiktoken failed to load, using estimation:", error.message);
    return null;
  }
}

/**
 * Count tokens in text using the GPT-4o tokenizer.
 * Falls back to word-based estimation if tiktoken fails.
 */
export async function countTokens(text: string): Promise<number> {
  if (!text) return 0;

  const enc = await getEncoder();
  if (enc) {
    try {
      return enc.encode(text).length;
    } catch {
      // Fallback
    }
  }

  // Rough estimation: ~4 chars per token for English, ~3 for code
  return Math.ceil(text.length / 3.5);
}

/**
 * Synchronous token count using estimation (for real-time UI).
 * ~4 characters per token is a reasonable approximation.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 3.5);
}

/**
 * Estimate cost in USD based on token count.
 * Based on GPT-4o pricing: $2.50 per 1M input tokens.
 */
export function estimateCost(tokens: number): string {
  const costPer1M = 2.5;
  const cost = (tokens / 1_000_000) * costPer1M;

  if (cost < 0.001) return "<$0.001";
  if (cost < 0.01) return `~$${cost.toFixed(4)}`;
  return `~$${cost.toFixed(3)}`;
}

/**
 * Calculate savings between original and shrunk token counts.
 */
export function calculateSavings(originalTokens: number, shrunkTokens: number) {
  if (originalTokens === 0) return { saved: 0, percentage: 0, cost: "$0" };

  const saved = originalTokens - shrunkTokens;
  const percentage = Math.round((saved / originalTokens) * 100);
  const cost = estimateCost(saved);

  return { saved, percentage, cost };
}
