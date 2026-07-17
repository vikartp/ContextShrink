import OpenAI from "openai";

/**
 * Creates an OpenAI client using environment variables.
 * Supports custom base URLs for Azure OpenAI, proxies, etc.
 */
function createClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is required. Set it in your .env file."
    );
  }

  const config: { apiKey: string; baseURL?: string } = { apiKey };

  if (process.env.OPENAI_BASE_URL) {
    config.baseURL = process.env.OPENAI_BASE_URL;
  }

  return new OpenAI(config);
}

let clientInstance: OpenAI | null = null;

export function getClient(): OpenAI {
  if (!clientInstance) {
    clientInstance = createClient();
  }
  return clientInstance;
}

export function getModel(): string {
  return process.env.OPENAI_MODEL || "gpt-4o-mini";
}

/**
 * Streams a chat completion from OpenAI.
 * Returns an async iterable of content chunks.
 */
export async function streamChatCompletion(systemPrompt: string, userMessage: string) {
  const client = getClient();
  const model = getModel();

  const stream = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    stream: true,
    temperature: 0.3,
    max_tokens: 16000,
  });

  return stream;
}


