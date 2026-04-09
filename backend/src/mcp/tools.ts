import Portfolio from "../models/Portfolio.js";
import { Groq } from "groq-sdk";

interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

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

// Execute tool calls
export async function executePortfolioTool(
  toolName: string,
  toolArgs: Record<string, any>
): Promise<string> {
  const portfolio = await Portfolio.findOne();

  if (!portfolio) {
    return JSON.stringify({ error: "No portfolio data found" });
  }

  switch (toolName) {
    case "get_portfolio_data":
      return JSON.stringify({
        bio: portfolio.bio,
        skills: portfolio.skills,
        projects: portfolio.projects.map((p) => ({
          name: p.name,
          description: p.description,
          skills: p.skills,
          link: p.link,
        })),
        experience: portfolio.experience.map((e) => ({
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
        (p) =>
          p.name.toLowerCase().includes(keyword) ||
          p.description.toLowerCase().includes(keyword) ||
          p.skills.some((s) => s.toLowerCase().includes(keyword))
      );
      const matchedExperience = portfolio.experience.filter(
        (e) =>
          e.company.toLowerCase().includes(keyword) ||
          e.role.toLowerCase().includes(keyword) ||
          e.description.toLowerCase().includes(keyword)
      );
      const matchedSkills = portfolio.skills.filter((s) =>
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
        projects: portfolio.projects.map((p) => ({
          name: p.name,
          description: p.description,
          skills: p.skills,
        })),
      });

    case "get_experience_summary":
      return JSON.stringify({
        total: portfolio.experience.length,
        experience: portfolio.experience.map((e) => ({
          company: e.company,
          role: e.role,
          duration: e.duration,
        })),
      });

    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }
}
