import express, { Request, Response } from "express";
import shrinkPrompts from "../prompts/shrinkPrompts";
import { streamChatCompletion } from "../services/openai";

const router = express.Router();

/**
 * POST /api/shrink
 * Accepts { code, mode, language } and streams the shrunk result via SSE.
 * Zero data retention — everything is ephemeral.
 */
router.post("/", async (req: Request, res: Response) => {
  const { code, mode = "code", language = "" } = req.body;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'code' field." });
  }

  if (!["code", "text", "prompt"].includes(mode)) {
    return res
      .status(400)
      .json({ error: "Invalid mode. Use 'code', 'text', or 'prompt'." });
  }

  if (code.length > 100000) {
    return res
      .status(413)
      .json({ error: "Input too large. Maximum 100,000 characters." });
  }

  // Set SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  try {
    const promptConfig = shrinkPrompts[mode];
    const systemPrompt = promptConfig.system;
    const userMessage =
      mode === "code"
        ? promptConfig.user(code, language)
        : promptConfig.user(code);

    const stream = await streamChatCompletion(systemPrompt, userMessage);

    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }

      // Check if stream is finished
      if (chunk.choices?.[0]?.finish_reason === "stop") {
        break;
      }
    }

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error: any) {
    console.error("Shrink error:", error.message);

    // If headers already sent, send error as SSE event
    if (res.headersSent) {
      res.write(
        `data: ${JSON.stringify({ error: error.message || "AI processing failed." })}\n\n`
      );
      res.end();
    } else {
      res.status(500).json({ error: "Failed to process. Check server logs." });
    }
  }
});

export default router;
