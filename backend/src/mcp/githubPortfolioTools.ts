import {
  listGitHubRepoPath,
  readGitHubRepoFile,
  parseOwnerRepoFromUrl,
} from "../utils/githubRepoContents.js";

/** Groq/OpenAI-style tool definitions for GitHub repo access (portfolio-linked repos only). */
export const githubPortfolioMcpTools = [
  {
    type: "function" as const,
    function: {
      name: "list_portfolio_repo_files",
      description:
        "List files and folders at a path in a GitHub repository that is linked to a portfolio project (from the admin dashboard). Use this to explore repo structure before reading files. Only works for repos registered on a project.",
      parameters: {
        type: "object",
        properties: {
          project_name: {
            type: "string",
            description:
              'Portfolio project name (e.g. "Career Hub") — fuzzy match against MongoDB projects',
          },
          path: {
            type: "string",
            description: "Directory path inside the repo, e.g. src or src/components. Use empty string for repository root.",
          },
          max_entries: {
            type: "integer",
            description: "Maximum entries to return (default 50, max 80)",
          },
        },
        required: ["project_name"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "read_portfolio_repo_file",
      description:
        "Read the text content of a source file from a GitHub repository linked to a portfolio project. Use for code questions (components, APIs, config). Only textual/source files; binary files are rejected. Path is relative to repo root.",
      parameters: {
        type: "object",
        properties: {
          project_name: {
            type: "string",
            description: "Portfolio project name — must match a project with a GitHub URL",
          },
          file_path: {
            type: "string",
            description: "File path from repo root, e.g. src/App.tsx or package.json",
          },
          max_chars: {
            type: "integer",
            description: "Max characters of file content (default 16000, max 32000)",
          },
        },
        required: ["project_name", "file_path"],
      },
    },
  },
];

function findProjectByName(portfolio: any, name: string): any | null {
  const q = (name || "").trim().toLowerCase();
  if (!q) return null;
  const projects = portfolio?.projects || [];
  const byExact = projects.find((p: any) => (p.name || "").toLowerCase() === q);
  if (byExact) return byExact;
  const byIncludes = projects.find(
    (p: any) =>
      (p.name || "").toLowerCase().includes(q) || q.includes((p.name || "").toLowerCase())
  );
  return byIncludes || null;
}

export async function executeGithubPortfolioMcpTool(
  toolName: string,
  toolArgs: Record<string, any>,
  portfolio: any
): Promise<string> {
  const project = findProjectByName(portfolio, toolArgs.project_name || "");
  if (!project) {
    return JSON.stringify({
      error: "No portfolio project matched that name, or portfolio has no projects.",
      hint: "Use the exact or partial project name from the portfolio.",
    });
  }

  const githubUrl = project.github;
  if (!githubUrl || typeof githubUrl !== "string") {
    return JSON.stringify({
      error: `Project "${project.name}" has no GitHub URL in the portfolio.`,
    });
  }

  const parsed = parseOwnerRepoFromUrl(githubUrl);
  if (!parsed) {
    return JSON.stringify({ error: "Invalid GitHub URL on this project.", githubUrl });
  }

  const { owner, repo } = parsed;

  if (toolName === "list_portfolio_repo_files") {
    const path = typeof toolArgs.path === "string" ? toolArgs.path : "";
    let max = Number(toolArgs.max_entries) || 50;
    if (max < 1) max = 50;
    if (max > 80) max = 80;

    const { entries, error } = await listGitHubRepoPath(owner, repo, path, max);
    if (error) {
      return JSON.stringify({
        project: project.name,
        owner,
        repo,
        path: path || "(root)",
        error,
      });
    }
    return JSON.stringify({
      project: project.name,
      owner,
      repo,
      path: path || "(root)",
      count: entries.length,
      entries,
      truncated_list: entries.length >= max,
    });
  }

  if (toolName === "read_portfolio_repo_file") {
    const filePath = typeof toolArgs.file_path === "string" ? toolArgs.file_path : "";
    if (!filePath.trim()) {
      return JSON.stringify({ error: "file_path is required." });
    }
    let maxChars = Number(toolArgs.max_chars) || 16000;
    if (maxChars < 500) maxChars = 500;
    if (maxChars > 32000) maxChars = 32000;

    const { content, truncated, error } = await readGitHubRepoFile(
      owner,
      repo,
      filePath,
      maxChars
    );
    if (error) {
      return JSON.stringify({
        project: project.name,
        owner,
        repo,
        file_path: filePath,
        error,
      });
    }
    return JSON.stringify({
      project: project.name,
      owner,
      repo,
      file_path: filePath,
      truncated,
      content,
    });
  }

  return JSON.stringify({ error: `Unknown GitHub tool: ${toolName}` });
}
