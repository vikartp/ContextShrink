# 🔮 ContextShrink — Architecture

## Overview

ContextShrink is a **privacy-first, zero-login tool** that helps developers optimize their code and text before sending it to AI models. It operates on a simple, decoupled architecture with a **Next.js 16 frontend** (TypeScript, TailwindCSS) and an **Express backend** (TypeScript).

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Secret       │  │ Token        │  │ Code Editor      │  │
│  │ Scanner      │  │ Counter      │  │ (CodeMirror 6)   │  │
│  │ (regex)      │  │ (js-tiktoken)│  │                  │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │            │
│         ▼                 ▼                    ▼            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              React State (page.tsx)                   │  │
│  │   inputCode · output · mode · secrets · tokenCounts   │  │
│  └────────────────────────┬─────────────────────────────┘  │
│                           │                                 │
│  ┌────────────────────────▼─────────────────────────────┐  │
│  │          Theme System (next-themes)                   │  │
│  │   Dark / Light / System · CSS custom properties       │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│                    SSE Stream (fetch)                        │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │
                     HTTPS / SSE
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                    EXPRESS SERVER                            │
│                           │                                 │
│  ┌────────────────────────▼─────────────────────────────┐  │
│  │            GET /api/health                            │  │
│  │   Returns: status, model, timestamp                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            POST /api/shrink                           │  │
│  │   Validates input → Selects prompt → Streams SSE      │  │
│  └────────────────────────┬─────────────────────────────┘  │
│                           │                                 │
│  ┌────────────────────────▼─────────────────────────────┐  │
│  │            OpenAI Service                             │  │
│  │   API Key, Base URL, Model — all from env vars        │  │
│  │   Streaming chat completion (temperature: 0.3)        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Logger Middleware                           │  │
│  │   Timestamped request logging (IST timezone)          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│                    ZERO DATA RETENTION                       │
│        (no database, no logs, no request storage)           │
└─────────────────────────────────────────────────────────────┘
                            │
                     OpenAI API
                            │
                    ┌───────▼───────┐
                    │  gpt-4o-mini   │
                    │ (configurable) │
                    └───────────────┘
```

---

## How It Works

### 1. Input — Paste or Drop Your Code

The user pastes code into the **CodeMirror 6** editor or drags & drops a file. The editor auto-detects the programming language from the file extension and applies syntax highlighting.

**What happens under the hood:**
- The `EditorPanel` component loads the appropriate CodeMirror language extension dynamically
- `detectLanguage()` maps 25+ file extensions to language modes
- The `DropZone` component validates file types against `ACCEPTED_EXTENSIONS`
- The input text is stored in React state and shared with all dependent components

### 2. Scan — Client-Side Secret Detection

As the user types (debounced at 300ms), the **Secret Scanner** analyzes the code for sensitive data — entirely in the browser.

**Detection patterns (15+ types):**

| Category | Examples |
|---|---|
| Cloud Keys | AWS Access Keys (`AKIA...`), AWS Secret Keys, Google API Keys (`AIza...`) |
| API Tokens | OpenAI (`sk-...`), Stripe (`sk_live_...`), GitHub (`ghp_...`, `github_pat_...`) |
| Auth Tokens | JWT (`eyJ...`), Slack (`xox...`), SendGrid (`SG.`), Twilio (`SK...`) |
| Credentials | Database URLs (`postgres://...`), Generic passwords (`password=...`) |
| Crypto | Private key blocks (`-----BEGIN PRIVATE KEY-----`) |
| PII | Email addresses, IP addresses |
| Platform Keys | Heroku API keys (UUID format) |

**How scanning works:**
```
User types → 300ms debounce → scanSecrets(code)
                                    │
                        For each SECRET_PATTERN:
                          regex.exec(code)
                                    │
                        Map matches to:
                          { type, severity, line, column, masked, start, end }
                                    │
                        Deduplicate overlapping matches
                                    │
                        Sort by line number → setSecrets(findings)
```

The scanner displays results with severity badges (🔴 Critical / 🟠 High / 🟡 Medium / 🔵 Info) and offers **Auto-Mask All** — which replaces every secret with `[REDACTED_TYPE]` placeholders.

> **Privacy guarantee:** Secret scanning runs 100% in the browser. No data is sent to any server during this step.

### 3. Shrink — AI-Powered Compression

When the user clicks **"🔮 Shrink It"**, the cleaned code is sent to the backend for AI compression via Server-Sent Events (SSE).

**Flow:**
```
[Browser]                          [Express Server]                [OpenAI API]
    │                                     │                              │
    │─── POST /api/shrink ──────────────▶ │                              │
    │    { code, mode, language }          │                              │
    │                                     │── Validate input             │
    │                                     │── Select system prompt       │
    │                                     │   (code / text / prompt)     │
    │                                     │                              │
    │                                     │── streamChatCompletion() ──▶ │
    │                                     │                              │
    │    ◀── SSE: data: {"content":"..."}─│◀── streaming chunks ────────│
    │    ◀── SSE: data: {"content":"..."}─│◀── streaming chunks ────────│
    │    ◀── SSE: data: {"content":"..."}─│◀── streaming chunks ────────│
    │    ◀── SSE: data: [DONE] ──────────│                              │
    │                                     │                              │
```

**Three Shrink Modes:**

| Mode | System Prompt Strategy | What Gets Removed |
|---|---|---|
| 🧑‍💻 **Code** | Strip noise, preserve logic | Comments, dead imports, `console.log`, unused vars, excessive whitespace |
| 📝 **Text** | Compress to essential meaning | Filler words, redundant phrases, verbose transitions |
| 🎯 **Prompt** | Maximize token efficiency | Polite fluff, redundant instructions, verbose constraint descriptions |

### 4. Compare — Side-by-Side Results

The output streams in real-time into the **Result Panel** (right side), with a blinking cursor animation during streaming. Once complete:

- **Token Stats Bar** shows: Original tokens → Shrunk tokens → Savings % → Cost saved
- Token counting uses `js-tiktoken` with the `o200k_base` encoding (same tokenizer as GPT-4o)
- Cost estimation based on GPT-4o pricing ($2.50 per 1M input tokens)

### 5. Export — Copy or Download

The user can:
- **📋 Copy** the shrunk output to clipboard
- **💾 Download** as a `.shrunk.<ext>` file
- The result is ready to paste into ChatGPT, Claude, or any AI tool

---

## Theme System

ContextShrink supports **Dark**, **Light**, and **System** themes using `next-themes`:

```
ThemeProvider (next-themes)
    │
    ├── Stores preference in localStorage
    ├── Adds `class="dark"` or `class="light"` to <html>
    │
    └── CSS Custom Properties (globals.css)
        ├── :root         → Light theme tokens
        └── .dark         → Dark theme tokens
            │
            └── TailwindCSS config maps these to utility classes
                e.g. bg-bg-primary → var(--bg-primary)
```

The `ThemeToggle` component uses Lucide React icons (`Sun` / `Moon`) and provides instant switching.

---

## Server Status Monitoring

The `ServerStatusBanner` component provides real-time server health feedback:

```
Page Load → GET /api/health
                │
        ┌───────┴───────┐
        │               │
     Success          Failure
     (hide)       Show "waking up" banner
                        │
                  Poll every 5s
                        │
                     Success
                  Show "back online" banner
                        │
                  Auto-hide after 5s
```

This is especially useful when the backend is deployed on platforms like Render that spin down idle instances.

---

## Technology Choices

| Decision | Choice | Rationale |
|---|---|---|
| Language | TypeScript (strict) | Type safety across both client and server |
| Frontend Framework | Next.js 16 (App Router) | One-command Vercel deployment, SSR support, modern React |
| Styling | TailwindCSS + CSS Custom Properties | Utility-first with design token theming |
| Theme System | next-themes | SSR-safe dark/light/system with no flash |
| Code Editor | CodeMirror 6 via `@uiw/react-codemirror` | Lightweight, extensible, 14+ language modes |
| Icons | Lucide React | Tree-shakeable, consistent SVG icon set |
| Tokenizer | `js-tiktoken` (pure JS) | Accurate GPT-4o tokenizer that works in-browser without WASM |
| Secret Detection | Custom regex engine | Runs client-side (privacy), zero dependencies, 15+ patterns |
| Backend | Express.js + TypeScript | Minimal footprint, native SSE support, proven reliability |
| AI Integration | OpenAI SDK with streaming | SSE streaming for real-time output, configurable model/endpoint |
| State Management | React `useState` + custom hooks | Simple enough for single-page app, no Redux/Zustand needed |

---

## Security Model

```
┌─────────────────────────────────────────────────┐
│                   BROWSER                       │
│                                                 │
│  ✅ Secret scanning      (never leaves browser) │
│  ✅ Token counting        (never leaves browser) │
│  ✅ Secret masking         (never leaves browser) │
│  ✅ Theme preference  (localStorage, never sent) │
│                                                 │
│  ⚠️ Code sent to backend ONLY on "Shrink It"   │
│    (after user has had chance to mask secrets)   │
└─────────────────────────────────────────────────┘
                        │
                 Only cleaned code
                        │
┌─────────────────────────────────────────────────┐
│                EXPRESS SERVER                   │
│                                                 │
│  ✅ No database, no file system writes          │
│  ✅ No request logging of code content          │
│  ✅ Ephemeral processing — stream and forget    │
│  ✅ API key stays server-side (never in browser)│
│  ✅ CORS restricts origins (+ *.vercel.app)     │
│  ✅ Request size limited to 1MB                 │
│  ✅ Input capped at 100,000 characters          │
└─────────────────────────────────────────────────┘
```

---

## API Endpoints

### `GET /api/health`

Returns server status, configured model, and timestamp.

```json
{
  "status": "ok",
  "service": "ContextShrink API",
  "model": "gpt-4o-mini",
  "timestamp": "2026-07-18T07:00:00.000Z"
}
```

### `POST /api/shrink`

Accepts code/text/prompt and streams the compressed result via SSE.

**Request:**
```json
{
  "code": "string (required, max 100K chars)",
  "mode": "code | text | prompt (default: code)",
  "language": "string (optional, e.g. 'javascript')"
}
```

**Response:** `text/event-stream`
```
data: {"content": "compressed chunk 1"}
data: {"content": "compressed chunk 2"}
data: [DONE]
```

**Error codes:** `400` (invalid input), `413` (too large), `500` (server error)

---

## Project Structure

```
ContextShrink/
├── client/                          # Next.js 16 Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx           # Root layout, fonts, SEO, ThemeProvider
│   │   │   ├── page.tsx             # Main workspace page (state orchestrator)
│   │   │   └── globals.css          # Design system (CSS custom properties)
│   │   ├── components/              # 16 React components
│   │   │   ├── Header.tsx           # Logo, help, theme toggle, repo link
│   │   │   ├── Workspace.tsx        # Split-pane orchestrator
│   │   │   ├── EditorPanel.tsx      # CodeMirror input (14+ languages)
│   │   │   ├── ResultPanel.tsx      # Streaming output viewer
│   │   │   ├── DropZone.tsx         # Drag & drop file upload
│   │   │   ├── ModeSelector.tsx     # Code / Text / Prompt pills
│   │   │   ├── TokenStats.tsx       # Savings dashboard
│   │   │   ├── SecretScanner.tsx    # Findings panel + auto-mask
│   │   │   ├── ActionBar.tsx        # Shrink / Copy / Download / Abort
│   │   │   ├── SettingsModal.tsx    # API config (localStorage)
│   │   │   ├── HelpModal.tsx        # Quick reference guide & usage tips
│   │   │   ├── SampleDataModal.tsx  # Categorized sample data loader
│   │   │   ├── ServerStatusBanner.tsx  # Live health-check indicator
│   │   │   ├── ThemeProvider.tsx    # next-themes wrapper
│   │   │   ├── ThemeToggle.tsx      # Dark/Light mode switch (Lucide icons)
│   │   │   └── Footer.tsx          # Privacy notice
│   │   ├── utils/
│   │   │   ├── tokenCounter.ts     # js-tiktoken wrapper (o200k_base)
│   │   │   ├── secretScanner.ts    # 15+ regex patterns, dedup, masking
│   │   │   └── helpers.ts          # Language detection, formatters, debounce
│   │   └── hooks/
│   │       └── useShrink.ts        # SSE streaming hook with abort support
│   ├── tailwind.config.ts          # TailwindCSS with CSS variable mapping
│   ├── postcss.config.js           # PostCSS for TailwindCSS
│   ├── tsconfig.json               # TypeScript config (strict, path aliases)
│   ├── next.config.mjs             # Standalone output for Docker
│   └── Dockerfile                  # Multi-stage production build
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── index.ts                # Express entry — CORS, logger, health, 404/500
│   │   ├── routes/shrink.ts        # POST /api/shrink (SSE streaming)
│   │   ├── services/openai.ts      # OpenAI client (lazy singleton, env config)
│   │   └── prompts/shrinkPrompts.ts # System prompts per mode (code/text/prompt)
│   ├── tsconfig.json               # TypeScript config (ES2022, commonjs)
│   ├── .env.example                # Environment variable template
│   └── Dockerfile                  # Multi-stage production build
│
├── sample_data/                     # Example files for testing
│   ├── code_sample.js              # JavaScript with comments & dead code
│   ├── text_sample.txt             # Verbose text for compression
│   ├── prompt_sample.txt           # Unoptimized LLM prompt
│   └── secrets_sample.js           # File with fake secrets for scanner testing
│
├── docker-compose.yml               # One-command local setup (server + client)
├── check-build.js                   # Build verification script
├── package.json                     # Workspace root (scripts, no dependencies)
├── ARCHITECTURE.md                  # This file
└── README.md                        # Quick start & project overview
```
