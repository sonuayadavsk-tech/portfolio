import axios from "axios";
import { parseGitHubUrl } from "./github.js";

const DEFAULT_TIMEOUT_MS = 15000;

function githubHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return h;
}

async function githubGet<T>(url: string): Promise<{ data: T; ok: true } | { ok: false; error: string }> {
  try {
    const res = await axios.get<T>(url, {
      headers: githubHeaders(),
      timeout: DEFAULT_TIMEOUT_MS,
    });
    return { data: res.data, ok: true };
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ||
      e?.message ||
      "GitHub API request failed";
    const status = e?.response?.status;
    return { ok: false, error: status ? `${status}: ${msg}` : msg };
  }
}

export interface RepoPathEntry {
  name: string;
  path: string;
  type: "file" | "dir";
  size?: number;
}

function contentsUrl(owner: string, repo: string, path: string): string {
  const base = `https://api.github.com/repos/${owner}/${repo}/contents`;
  const normalized = path.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!normalized) return base;
  const tail = normalized.split("/").filter(Boolean).map(encodeURIComponent).join("/");
  return `${base}/${tail}`;
}

/**
 * List immediate children of a path in a public (or token-accessible) GitHub repo.
 */
export async function listGitHubRepoPath(
  owner: string,
  repo: string,
  path: string,
  maxEntries: number
): Promise<{ entries: RepoPathEntry[]; error?: string }> {
  const normalized = path.replace(/^\/+/, "").replace(/\/+$/, "");
  const url = contentsUrl(owner, repo, normalized);
  const result = await githubGet<unknown>(url);
  if (!result.ok) {
    return { entries: [], error: result.error };
  }

  const data = result.data;
  if (!Array.isArray(data)) {
    return {
      entries: [],
      error: "Path is a file, not a directory — use read_portfolio_repo_file instead.",
    };
  }

  const entries: RepoPathEntry[] = data.slice(0, maxEntries).map((item: any) => ({
    name: item.name,
    path: item.path,
    type: item.type === "dir" ? "dir" : "file",
    size: typeof item.size === "number" ? item.size : undefined,
  }));

  return { entries };
}

const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".yml",
  ".yaml",
  ".html",
  ".css",
  ".scss",
  ".less",
  ".vue",
  ".svelte",
  ".java",
  ".kt",
  ".py",
  ".go",
  ".rs",
  ".rb",
  ".php",
  ".c",
  ".h",
  ".cpp",
  ".hpp",
  ".cs",
  ".swift",
  ".sql",
  ".sh",
  ".env",
  ".gitignore",
  ".toml",
  ".xml",
  ".svg",
  ".txt",
]);

function looksTextual(path: string, reportedEncoding?: string): boolean {
  if (reportedEncoding && reportedEncoding !== "base64") return false;
  const lower = path.toLowerCase();
  const dot = lower.lastIndexOf(".");
  const ext = dot >= 0 ? lower.slice(dot) : "";
  if (TEXT_EXTENSIONS.has(ext)) return true;
  if (!ext && lower.includes("dockerfile")) return true;
  if (lower.endsWith("dockerfile") || lower.endsWith("makefile")) return true;
  return false;
}

/**
 * Read a single file from GitHub (contents API). Truncates large text.
 */
export async function readGitHubRepoFile(
  owner: string,
  repo: string,
  filePath: string,
  maxChars: number
): Promise<{ content: string; truncated: boolean; error?: string }> {
  const normalized = filePath.replace(/^\/+/, "");
  const url = contentsUrl(owner, repo, normalized);

  const result = await githubGet<any>(url);
  if (!result.ok) {
    return { content: "", truncated: false, error: result.error };
  }

  const data = result.data;
  if (Array.isArray(data)) {
    return {
      content: "",
      truncated: false,
      error: "Path is a directory — use list_portfolio_repo_files first.",
    };
  }

  if (data.type !== "file") {
    return { content: "", truncated: false, error: "Not a file." };
  }

  if (data.encoding !== "base64" || typeof data.content !== "string") {
    return { content: "", truncated: false, error: "Unsupported content encoding." };
  }

  if (!looksTextual(normalized, data.encoding)) {
    return {
      content: "",
      truncated: false,
      error: `File appears binary or unknown type; refusing to decode (${normalized}).`,
    };
  }

  let text: string;
  try {
    text = Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf-8");
  } catch {
    return { content: "", truncated: false, error: "Failed to decode file content." };
  }

  const truncated = text.length > maxChars;
  const content = truncated ? text.slice(0, maxChars) : text;
  return { content, truncated };
}

export function parseOwnerRepoFromUrl(githubUrl: string): { owner: string; repo: string } | null {
  return parseGitHubUrl(githubUrl);
}
