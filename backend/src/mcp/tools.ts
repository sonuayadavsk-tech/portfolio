import Portfolio from "../models/Portfolio.js";
import {
  githubPortfolioMcpTools,
  executeGithubPortfolioMcpTool,
} from "./githubPortfolioTools.js";

// Portfolio tools that can be called
export const portfolioTools = [
  {
    type: "function",
    function: {
      name: "get_portfolio_data",
      description:
        "Retrieve complete portfolio including projects, experience, and skills",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_portfolio",
      description:
        "Search portfolio by keyword (projects, experience, or skills)",
      parameters: {
        type: "object",
        properties: {
          keyword: {
            type: "string",
            description: "What to search for",
          },
        },
        required: ["keyword"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_projects_summary",
      description: "Get a summary of all projects",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_experience_summary",
      description: "Get a summary of work experience",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
];

/** All tools exposed to Groq chat (portfolio + GitHub repo MCP-style). */
export const groqChatTools = [...portfolioTools, ...githubPortfolioMcpTools];

// Execute tool calls
export async function executePortfolioTool(
  toolName: string,
  toolArgs: Record<string, any>,
  portfolioDoc?: any
): Promise<string> {
  const portfolio = portfolioDoc ?? (await Portfolio.findOne());

  if (!portfolio) {
    return JSON.stringify({ error: "No portfolio data found" });
  }

  switch (toolName) {
    case "get_portfolio_data":
      return JSON.stringify({
        bio: portfolio.bio,
        skills: portfolio.skills,
        projects: portfolio.projects.map((p: any) => ({
          name: p.name,
          description: p.description,
          skills: p.skills,
          link: p.link,
          github: p.github,
        })),
        experience: portfolio.experience.map((e: any) => ({
          company: e.company,
          role: e.role,
          duration: e.duration,
          description: e.description,
        })),
        contact: portfolio.contact,
      });

    case "search_portfolio": {
      const keyword = (toolArgs.keyword || "").toLowerCase();
      const matchedProjects = portfolio.projects.filter(
        (p: any) =>
          p.name.toLowerCase().includes(keyword) ||
          p.description.toLowerCase().includes(keyword) ||
          (p.github && String(p.github).toLowerCase().includes(keyword)) ||
          (Array.isArray(p.skills) &&
            p.skills.some((s: string) => s.toLowerCase().includes(keyword)))
      );
      const matchedExperience = portfolio.experience.filter(
        (e: any) =>
          e.company.toLowerCase().includes(keyword) ||
          e.role.toLowerCase().includes(keyword) ||
          e.description.toLowerCase().includes(keyword)
      );
      const matchedSkills = portfolio.skills.filter((s: string) =>
        s.toLowerCase().includes(keyword)
      );
      return JSON.stringify({
        keyword,
        projects: matchedProjects,
        experience: matchedExperience,
        skills: matchedSkills,
      });
    }

    case "get_projects_summary":
      return JSON.stringify({
        total: portfolio.projects.length,
        projects: portfolio.projects.map((p: any) => ({
          name: p.name,
          description: p.description,
          skills: p.skills,
          github: p.github,
        })),
      });

    case "get_experience_summary":
      return JSON.stringify({
        total: portfolio.experience.length,
        experience: portfolio.experience.map((e: any) => ({
          company: e.company,
          role: e.role,
          duration: e.duration,
        })),
      });

    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }
}

/** Dispatch portfolio tools + GitHub repo tools (GitHub limited to linked projects). */
export async function executeGroqChatTool(
  toolName: string,
  toolArgs: Record<string, any>,
  portfolio: any
): Promise<string> {
  if (toolName === "list_portfolio_repo_files" || toolName === "read_portfolio_repo_file") {
    return executeGithubPortfolioMcpTool(toolName, toolArgs, portfolio);
  }
  return executePortfolioTool(toolName, toolArgs, portfolio);
}
