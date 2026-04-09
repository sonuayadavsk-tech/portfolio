import {
  Server,
  StdioServerTransport,
  Tool,
  TextContent,
  ToolResultBlockParam,
} from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import Portfolio from "../models/Portfolio.js";

// Initialize MCP Server
const server = new Server({
  name: "portfolio-mcp-server",
  version: "1.0.0",
});

// Define portfolio tools
const tools: Tool[] = [
  {
    name: "get_portfolio",
    description:
      "Retrieve complete portfolio data including projects, experience, skills, and bio",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_projects",
    description: "Get only the projects from portfolio",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of projects to return (default: all)",
        },
      },
      required: [],
    },
  },
  {
    name: "get_experience",
    description: "Get work experience entries",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of experiences to return (default: all)",
        },
      },
      required: [],
    },
  },
  {
    name: "get_skills",
    description: "Get list of technical skills",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "search_portfolio",
    description:
      "Search portfolio data by keyword (searches projects, experience, and skills)",
    inputSchema: {
      type: "object",
      properties: {
        keyword: {
          type: "string",
          description: "Keyword to search for",
        },
      },
      required: ["keyword"],
    },
  },
  {
    name: "get_contact",
    description: "Get contact information",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];

// List available tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request;

    let result: object;

    switch (name) {
      case "get_portfolio": {
        const portfolio = await Portfolio.findOne();
        if (!portfolio) {
          return {
            content: [
              {
                type: "text",
                text: "No portfolio data found",
              },
            ],
            isError: true,
          };
        }
        result = portfolio.toObject();
        break;
      }

      case "get_projects": {
        const portfolio = await Portfolio.findOne();
        if (!portfolio) {
          return {
            content: [
              {
                type: "text",
                text: "No portfolio data found",
              },
            ],
            isError: true,
          };
        }
        const limit = (args as any)?.limit || portfolio.projects.length;
        result = portfolio.projects.slice(0, limit);
        break;
      }

      case "get_experience": {
        const portfolio = await Portfolio.findOne();
        if (!portfolio) {
          return {
            content: [
              {
                type: "text",
                text: "No portfolio data found",
              },
            ],
            isError: true,
          };
        }
        const limit = (args as any)?.limit || portfolio.experience.length;
        result = portfolio.experience.slice(0, limit);
        break;
      }

      case "get_skills": {
        const portfolio = await Portfolio.findOne();
        if (!portfolio) {
          return {
            content: [
              {
                type: "text",
                text: "No portfolio data found",
              },
            ],
            isError: true,
          };
        }
        result = { skills: portfolio.skills };
        break;
      }

      case "search_portfolio": {
        const keyword = ((args as any)?.keyword || "").toLowerCase();
        if (!keyword) {
          return {
            content: [
              {
                type: "text",
                text: "Keyword is required for search",
              },
            ],
            isError: true,
          };
        }

        const portfolio = await Portfolio.findOne();
        if (!portfolio) {
          return {
            content: [
              {
                type: "text",
                text: "No portfolio data found",
              },
            ],
            isError: true,
          };
        }

        const matchedProjects = portfolio.projects.filter((p) =>
          JSON.stringify(p).toLowerCase().includes(keyword)
        );
        const matchedExperience = portfolio.experience.filter((e) =>
          JSON.stringify(e).toLowerCase().includes(keyword)
        );
        const matchedSkills = portfolio.skills.filter((s) =>
          s.toLowerCase().includes(keyword)
        );

        result = {
          projects: matchedProjects,
          experience: matchedExperience,
          skills: matchedSkills,
        };
        break;
      }

      case "get_contact": {
        const portfolio = await Portfolio.findOne();
        if (!portfolio) {
          return {
            content: [
              {
                type: "text",
                text: "No portfolio data found",
              },
            ],
            isError: true,
          };
        }
        result = portfolio.contact;
        break;
      }

      default:
        return {
          content: [
            {
              type: "text",
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
      isError: true,
    };
  }
});

// Expose tools to client
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Already handled above
  throw new Error("Tool handler not implemented");
});

// List tools
const listToolsHandler = async () => {
  return { tools };
};

export { server, listToolsHandler };
