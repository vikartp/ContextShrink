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

- **3 Modes:** Code compression, Text condensing, Prompt optimization
- **Drag & Drop:** Drop any code file directly into the editor
- **Real-time Token Counter:** See exact token counts using GPT-4o tokenizer
- **Side-by-side View:** Compare original vs. shrunk code
- **Streaming Output:** Watch AI compress your code in real-time
- **Cost Calculator:** See how much money you're saving per request
- **Privacy First:** Secret scanning happens 100% in your browser
- **Zero Login:** No accounts, no auth, no data stored

## Architecture

For a deep dive into how ContextShrink works — data flow, security model, technology choices, and project structure — see **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Code Editor | CodeMirror 6 |
| Token Counting | js-tiktoken (client-side) |
| Secret Detection | Custom regex engine (client-side) |
| Backend | Node.js + Express |
| AI | OpenAI API |
| Styling | Vanilla CSS (Glassmorphism dark theme) |

## Quick Start

### Option 1: Docker Compose (Recommended)

The fastest way to get running. Requires [Docker](https://docs.docker.com/get-docker/) installed.

```bash
# Clone the repo
git clone https://github.com/your-username/context-shrink.git
cd context-shrink

# Set your OpenAI API key
echo "OPENAI_API_KEY=sk-your-key-here" > .env

# Start everything
docker compose up --build
```

That's it! Open `http://localhost:3000` in your browser.

> **Optional:** You can also set `OPENAI_BASE_URL` and `OPENAI_MODEL` in the `.env` file to use a custom endpoint or model.

### Option 2: Manual Setup

Requires Node.js 18+ and npm 9+.

```bash
# Clone the repo
git clone https://github.com/your-username/context-shrink.git
cd context-shrink

# Install all dependencies
npm run install:all

# Configure backend
cp server/.env.example server/.env
# Edit server/.env and add your OPENAI_API_KEY

# Start development (both client + server)
npm run dev
```

Frontend runs on `http://localhost:3000`, backend on `http://localhost:3001`.

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | ✅ | — | Your OpenAI API key |
| `OPENAI_BASE_URL` | ❌ | `https://api.openai.com/v1` | Custom base URL (Azure, proxies) |
| `OPENAI_MODEL` | ❌ | `gpt-4o-mini` | Model to use |
| `PORT` | ❌ | `3001` | Server port |
| `CLIENT_ORIGIN` | ❌ | `http://localhost:3000` | Frontend origin for CORS |

## Deployment

### Docker

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

#### Backend → Render
1. Create a new Web Service on Render
2. Set root directory to `server`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables: `OPENAI_API_KEY`, `CLIENT_ORIGIN`

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT
