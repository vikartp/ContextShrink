# 🔮 ContextShrink — Architecture

## Overview

ContextShrink is a **privacy-first, zero-login tool** that helps developers optimize their code and text before sending it to AI models. It operates on a simple, decoupled architecture with a **Next.js frontend** and an **Express backend**.

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
│  │              React State (page.js)                    │  │
│  │   inputCode · output · mode · secrets · tokenCounts   │  │
│  └────────────────────────┬─────────────────────────────┘  │
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
│  │            POST /api/shrink                           │  │
│  │   Validates input → Selects prompt → Streams SSE      │  │
│  └────────────────────────┬─────────────────────────────┘  │
│                           │                                 │
│  ┌────────────────────────▼─────────────────────────────┐  │
│  │            OpenAI Service                             │  │
│  │   API Key, Base URL, Model — all from env vars        │  │
│  │   Streaming chat completion                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│                    ZERO DATA RETENTION                       │
│        (no database, no logs, no request storage)           │
└─────────────────────────────────────────────────────────────┘
                            │
                     OpenAI API
                            │
                    ┌───────▼───────┐
                    │   GPT-4o-mini  │
                    │  (configurable)│
                    └───────────────┘
```

---

## How It Works

### 1. Input — Paste or Drop Your Code

The user pastes code into the **CodeMirror 6** editor or drags & drops a file. The editor auto-detects the programming language from the file extension and applies syntax highlighting.

**What happens under the hood:**
- The `EditorPanel` component loads the appropriate CodeMirror language extension dynamically
- `detectLanguage()` maps file extensions to language modes (14 languages supported)
- The input text is stored in React state and shared with all dependent components

### 2. Scan — Client-Side Secret Detection

As the user types (debounced at 300ms), the **Secret Scanner** analyzes the code for sensitive data — entirely in the browser.

**Detection patterns (15+ types):**

| Category | Examples |
|---|---|
| Cloud Keys | AWS Access Keys (`AKIA...`), Google API Keys (`AIza...`) |
| API Tokens | OpenAI (`sk-...`), Stripe (`sk_live_...`), GitHub (`ghp_...`) |
| Auth Tokens | JWT (`eyJ...`), Slack (`xox...`), SendGrid (`SG.`) |
| Credentials | Database URLs (`postgres://...`), Generic passwords (`password=...`) |
| Crypto | Private key blocks (`-----BEGIN PRIVATE KEY-----`) |
| PII | Email addresses, IP addresses |

**How scanning works:**
```
User types → 300ms debounce → scanSecrets(code)
                                    │
                        For each SECRET_PATTERN:
                          regex.exec(code)
                                    │
                        Map matches to:
                          { type, severity, line, masked }
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

## Technology Choices

| Decision | Choice | Rationale |
|---|---|---|
| Frontend Framework | Next.js (App Router) | One-command Vercel deployment, SSR support, modern React |
| Code Editor | CodeMirror 6 via `@uiw/react-codemirror` | Lightweight, extensible, 14+ language modes |
| Tokenizer | `js-tiktoken` (pure JS) | Accurate GPT-4o tokenizer that works in-browser without WASM |
| Secret Detection | Custom regex engine | Runs client-side (privacy), zero dependencies, 15+ patterns |
| Backend | Express.js | Minimal footprint, native SSE support, proven reliability |
| AI Integration | OpenAI SDK with streaming | SSE streaming for real-time output, configurable model/endpoint |
| Styling | Vanilla CSS | Full control over glassmorphism, animations, no build-time overhead |
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
│  ✅ Settings (localStorage, never sent)          │
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
│  ✅ CORS restricts origins                      │
└─────────────────────────────────────────────────┘
```

---

## Project Structure

```
ContextShrink/
├── client/                          # Next.js Frontend → Vercel
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.js           # Root layout, fonts, SEO
│   │   │   ├── page.js             # Main workspace page
│   │   │   └── globals.css         # Design system (500+ lines)
│   │   ├── components/             # 11 React components
│   │   │   ├── Header.jsx          # Logo, mode selector, settings
│   │   │   ├── Workspace.jsx       # Split-pane orchestrator
│   │   │   ├── EditorPanel.jsx     # CodeMirror input (14 languages)
│   │   │   ├── ResultPanel.jsx     # Streaming output viewer
│   │   │   ├── DropZone.jsx        # Drag & drop file upload
│   │   │   ├── ModeSelector.jsx    # Code / Text / Prompt pills
│   │   │   ├── TokenStats.jsx      # Savings dashboard
│   │   │   ├── SecretScanner.jsx   # Findings panel + auto-mask
│   │   │   ├── ActionBar.jsx       # Shrink / Copy / Download
│   │   │   ├── SettingsModal.jsx   # API config (localStorage)
│   │   │   └── Footer.jsx          # Privacy notice
│   │   ├── utils/
│   │   │   ├── tokenCounter.js     # js-tiktoken wrapper
│   │   │   ├── secretScanner.js    # 15+ regex patterns
│   │   │   └── helpers.js          # Language detection, formatters
│   │   └── hooks/
│   │       └── useShrink.js        # SSE streaming hook
│   ├── Dockerfile
│   └── next.config.mjs
│
├── server/                          # Express Backend → Render
│   ├── src/
│   │   ├── index.js                # Express entry, CORS, health
│   │   ├── routes/shrink.js        # POST /api/shrink (SSE)
│   │   ├── services/openai.js      # OpenAI client (env config)
│   │   └── prompts/shrinkPrompts.js # System prompts per mode
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml               # One-command local setup
├── ARCHITECTURE.md                   # This file
└── README.md
```
