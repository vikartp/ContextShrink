import "./globals.css";

export const metadata = {
  title: "ContextShrink — Scan, Scrub & Shrink Code for AI",
  description:
    "Zero-login, privacy-first tool that scans for secrets, scrubs PII, and compresses your code before sending to any AI. Save tokens, money, and prevent leaks.",
  keywords: [
    "AI", "token optimizer", "code compressor", "secret scanner",
    "LLM", "ChatGPT", "developer tools", "privacy",
  ],
  openGraph: {
    title: "ContextShrink — Scan, Scrub & Shrink Code for AI",
    description:
      "Save 30-60% of your AI token budget. Detect secrets. Compress code. Privacy-first.",
    type: "website",
  },
};

import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
