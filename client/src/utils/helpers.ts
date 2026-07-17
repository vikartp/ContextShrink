/**
 * Utility helpers for ContextShrink
 */

/**
 * Detect programming language from filename extension.
 */
export function detectLanguage(filename: string): string {
  if (!filename) return "text";

  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const languageMap: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    java: "java",
    rb: "ruby",
    go: "go",
    rs: "rust",
    cpp: "cpp",
    c: "cpp",
    h: "cpp",
    cs: "csharp",
    php: "php",
    swift: "swift",
    kt: "kotlin",
    scala: "scala",
    r: "r",
    sql: "sql",
    html: "html",
    css: "css",
    scss: "css",
    less: "css",
    json: "json",
    xml: "xml",
    yaml: "yaml",
    yml: "yaml",
    md: "markdown",
    txt: "text",
    sh: "shell",
    bash: "shell",
    zsh: "shell",
    dockerfile: "docker",
    toml: "toml",
    ini: "ini",
    env: "shell",
  };

  return languageMap[ext] || "text";
}

/**
 * Get a display label for a language.
 */
export function getLanguageLabel(language: string): string {
  const labels: Record<string, string> = {
    javascript: "JavaScript",
    typescript: "TypeScript",
    python: "Python",
    java: "Java",
    ruby: "Ruby",
    go: "Go",
    rust: "Rust",
    cpp: "C/C++",
    csharp: "C#",
    php: "PHP",
    swift: "Swift",
    kotlin: "Kotlin",
    scala: "Scala",
    r: "R",
    sql: "SQL",
    html: "HTML",
    css: "CSS",
    json: "JSON",
    xml: "XML",
    yaml: "YAML",
    markdown: "Markdown",
    text: "Plain Text",
    shell: "Shell",
    docker: "Dockerfile",
    toml: "TOML",
    ini: "INI",
  };

  return labels[language] || "Text";
}

/**
 * Format a number with commas: 1234 → "1,234"
 */
export function formatNumber(n: number | any): string {
  if (typeof n !== "number" || isNaN(n)) return "0";
  return n.toLocaleString("en-US");
}

/**
 * Format file size: 1024 → "1.0 KB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Debounce a function call.
 */
export function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Accepted file extensions for drag & drop.
 */
export const ACCEPTED_EXTENSIONS = [
  ".js", ".jsx", ".ts", ".tsx", ".py", ".java", ".rb", ".go", ".rs",
  ".cpp", ".c", ".h", ".cs", ".php", ".swift", ".kt", ".scala",
  ".sql", ".html", ".css", ".scss", ".less", ".json", ".xml",
  ".yaml", ".yml", ".md", ".txt", ".sh", ".bash", ".toml", ".ini",
  ".env", ".dockerfile", ".r",
];

/**
 * Check if a file extension is accepted.
 */
export function isAcceptedFile(filename: string): boolean {
  const ext = "." + filename.split(".").pop()?.toLowerCase();
  return ACCEPTED_EXTENSIONS.includes(ext);
}
