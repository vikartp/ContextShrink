<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38BDF8?logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white" alt="Node.js 20" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white" alt="Docker Ready" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License" />
</p>

# 🔮 ContextShrink

> **Scan, Scrub & Shrink your code before sending to AI** — save tokens, money, and prevent secret leaks.

## The Problem

Every developer pastes code into LLMs daily — but they're burning **30-60% of their token budget** on comments, boilerplate, dead imports, and verbose formatting. Worse, they risk **leaking API keys, passwords, and PII** into third-party AI tools.

## The Solution

**ContextShrink** is a zero-login, privacy-first tool that:

1. 🛡️ **Scans** — Detects 15+ types of secrets (AWS keys, GitHub tokens, JWTs, DB passwords, PII) — all client-side, nothing leaves your browser
2. 🔒 **Scrubs** — Auto-masks detected secrets with safe `[REDACTED]` placeholders
3. ✨ **Shrinks** — AI-powered compression strips comments, dead code, and boilerplate while preserving all functional logic

## Features

- **3 Shrink Modes** — Code compression, Text condensing, Prompt optimization
- **Try Sample Data** — Quickly load categorized samples (Code/Text/Prompt) to test the tool, with automatic mode switching
- **Drag & Drop** — Drop any code file directly into the editor
- **Real-time Token Counter** — Exact token counts using GPT-4o tokenizer (`o200k_base` encoding)
- **Side-by-side View** — Compare original vs. shrunk code with live streaming
- **Streaming Output** — Watch AI compress your code in real-time via SSE
- **Cost Calculator** — See how much money you're saving per request
- **Dark / Light Theme** — System-aware theme toggle with smooth transitions
- **Server Status Banner** — Live health-check indicator with automatic reconnection
- **Privacy First** — Secret scanning happens 100% in your browser
- **Zero Login** — No accounts, no auth, no data stored

## Architecture

For a deep dive into how ContextShrink works — data flow, security model, technology choices, and project structure — see **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router, TypeScript) |
| Styling | TailwindCSS 3.4 + CSS Custom Properties |
| Theme | next-themes (dark/light/system) |
| Code Editor | CodeMirror 6 via `@uiw/react-codemirror` |
| Icons | Lucide React |
| Token Counting | js-tiktoken (client-side, `o200k_base`) |
| Secret Detection | Custom regex engine (client-side, 15+ patterns) |
| Backend | Node.js 20 + Express + TypeScript |
| AI | OpenAI SDK with streaming (SSE) |

## Quick Start

### Option 1: Docker Compose (Recommended)

The fastest way to get running. Requires [Docker](https://docs.docker.com/get-docker/) installed.

```bash
# Clone the repo
git clone https://github.com/vikartp/ContextShrink.git
cd ContextShrink

# Configure backend environment
cp server/.env.example server/.env
# Edit server/.env and add your OPENAI_API_KEY

# Start everything
docker compose up --build
```

That's it! Open `http://localhost:3000` in your browser.

> **Optional:** You can also set `OPENAI_BASE_URL`, `OPENAI_MODEL`, and `OPENAI_MAX_TOKENS` in `server/.env` to use a custom endpoint, model, or token limit.

### Option 2: Manual Setup

Requires Node.js 20+ and npm 9+.

```bash
# Clone the repo
git clone https://github.com/vikartp/ContextShrink.git
cd ContextShrink

# Install all dependencies (client + server)
npm run install:all

# Configure backend
cp server/.env.example server/.env
# Edit server/.env and add your OPENAI_API_KEY

# Start server (Terminal 1)
npm run s:server

# Start client (Terminal 2)
npm run s:client
```

Frontend runs on `http://localhost:3000`, backend on `http://localhost:3001`.

### Build Verification

Before pushing, you can run the build check script to ensure both projects compile cleanly:

```bash
npm run check
```

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | ✅ | — | Your OpenAI API key |
| `OPENAI_BASE_URL` | ❌ | `https://api.openai.com/v1` | Custom base URL (Azure, proxies) |
| `OPENAI_MODEL` | ❌ | `gpt-4o-mini` | Model to use for compression |
| `OPENAI_MAX_TOKENS` | ❌ | `16000` | Maximum tokens for AI response |
| `PORT` | ❌ | `3001` | Server port |
| `CLIENT_ORIGIN` | ❌ | `http://localhost:3000` | Frontend origin for CORS |
| `NEXT_PUBLIC_API_URL` | ❌ | `http://localhost:3001` | Backend URL (client-side) |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check — returns status, model, timestamp |
| `POST` | `/api/shrink` | Shrink code/text/prompt — streams result via SSE |

### `POST /api/shrink`

```json
{
  "code": "your code here",
  "mode": "code | text | prompt",
  "language": "javascript"
}
```

Response: Server-Sent Events stream with `data: {"content": "..."}` chunks, ending with `data: [DONE]`.

## Deployment

### Docker (Production)

```bash
# Production build
docker compose up --build -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

### Manual Deployment

#### Frontend → Vercel
```bash
cd client
npx vercel --prod
```
Set `NEXT_PUBLIC_API_URL` to your backend URL.

#### Backend → Render / Railway
1. Create a new Web Service
2. Set root directory to `server`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables: `OPENAI_API_KEY`, `CLIENT_ORIGIN`

## Scripts

| Script | Description |
|---|---|
| `npm run s:server` | Start the backend dev server (with hot-reload) |
| `npm run s:client` | Start the Next.js dev server |
| `npm run install:all` | Install dependencies for both client and server |
| `npm run check` | Build both projects to verify compilation |

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT
