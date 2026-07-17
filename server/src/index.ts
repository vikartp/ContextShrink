import dotenv from "dotenv";
dotenv.config({ override: true });
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import shrinkRouter from "./routes/shrink";

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

// Middleware
app.use(
  cors({
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        CLIENT_ORIGIN,
        "http://localhost:3000",
        "http://localhost:3001",
      ];

      // Also allow any *.vercel.app origin for deployment
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "ContextShrink API",
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/shrink", shrinkRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n🔮 ContextShrink API running on http://localhost:${PORT}`);
  console.log(`   Model: ${process.env.OPENAI_MODEL || "gpt-4o-mini"}`);
  console.log(
    `   Base URL: ${process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"}`
  );
  console.log(`   Client: ${CLIENT_ORIGIN}\n`);
});
