import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

// Resolve the sample_data directory relative to the project root
const SAMPLE_DIR = path.resolve(__dirname, "../../sample_data");

/** Determine the mode category for a sample file based on its name */
function detectCategory(filename: string): "code" | "text" | "prompt" {
  const lower = filename.toLowerCase();
  if (lower.includes("prompt")) return "prompt";
  if (lower.includes("text")) return "text";
  // Code extensions
  const ext = path.extname(lower);
  if ([".js", ".ts", ".jsx", ".tsx", ".py", ".java", ".go", ".rs", ".cpp", ".c", ".cs", ".php", ".rb", ".kt", ".swift", ".scala"].includes(ext)) {
    return "code";
  }
  return "text";
}

/**
 * GET /api/samples
 * Lists all sample files available for demo purposes, grouped by category.
 */
router.get("/", (_req: Request, res: Response) => {
  try {
    if (!fs.existsSync(SAMPLE_DIR)) {
      return res.status(404).json({ error: "Sample data directory not found." });
    }

    const entries = fs.readdirSync(SAMPLE_DIR, { withFileTypes: true });
    const files = entries
      .filter((e) => e.isFile() && !e.name.startsWith("."))
      .map((e) => {
        const stats = fs.statSync(path.join(SAMPLE_DIR, e.name));
        return { name: e.name, size: stats.size, category: detectCategory(e.name) };
      });

    res.json({ files });
  } catch (err: any) {
    console.error("Error listing samples:", err.message);
    res.status(500).json({ error: "Failed to list sample files." });
  }
});

/**
 * GET /api/samples/:filename
 * Returns the content of a specific sample file.
 */
router.get("/:filename", (req: Request, res: Response) => {
  try {
    const filename = req.params.filename as string;

    // Sanitize: prevent directory traversal
    const safeName = path.basename(filename);
    const filePath = path.join(SAMPLE_DIR, safeName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: `Sample file '${safeName}' not found.` });
    }

    const content = fs.readFileSync(filePath, "utf-8");
    res.json({ name: safeName, content, category: detectCategory(safeName) });
  } catch (err: any) {
    console.error("Error reading sample:", err.message);
    res.status(500).json({ error: "Failed to read sample file." });
  }
});

export default router;

