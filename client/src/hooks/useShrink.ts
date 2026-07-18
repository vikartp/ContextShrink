"use client";

import { useState, useCallback, useRef } from "react";

/**
 * Custom hook for streaming AI shrink results via SSE.
 * Handles connection, chunk assembly, error states, and abort.
 */
export function useShrink() {
  const [output, setOutput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const shrink = useCallback(
    async (code: string, mode: "code" | "text" | "prompt" | string = "code", language: string = "") => {
      // Abort any existing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setOutput("");
      setIsStreaming(true);
      setError(null);

      try {
        const response = await fetch(`${apiUrl}/api/shrink`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, mode, language }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Server error: ${response.status}`
          );
        }

        if (!response.body) {
          throw new Error("Response body is null");
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          
          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();

              if (data === "[DONE]") {
                setIsStreaming(false);
                return;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
                if (parsed.content) {
                  accumulated += parsed.content;
                  setOutput(accumulated);
                }
              } catch (parseErr: any) {
                if (parseErr?.message && !parseErr.message.includes("JSON")) {
                  throw parseErr;
                }
              }
            }
          }
        }

        setIsStreaming(false);
      } catch (err: any) {
        if (err.name === "AbortError") {
          // User cancelled — not an error
          setIsStreaming(false);
          return;
        }

        console.error("Shrink error:", err);
        setError(err.message || "Failed to connect to the server.");
        setIsStreaming(false);
      }
    },
    [apiUrl]
  );

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    setOutput("");
    setError(null);
    setIsStreaming(false);
  }, []);

  return { shrink, output, isStreaming, error, abort, reset };
}
