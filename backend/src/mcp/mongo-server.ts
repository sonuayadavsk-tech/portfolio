import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import Portfolio from "../models/Portfolio.js";
import mongoose from "mongoose";

// MCP MongoDB Server for Portfolio Data
export class MongoMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "portfolio-mongodb-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "get_portfolio_data",
            description:
              "Get complete portfolio data including all sections (bio, skills, projects, experience, contact)",
            inputSchema: {
              type: "object" as const,
              properties: {},
              required: [],
            },
          },
          {
            name: "get_skills_by_category",
            description: "Get skills organized by category",
            inputSchema: {
              type: "object" as const,
              properties: {
                category: {
                  type: "string",
                  description:
                    "Skill category (Languages & Web, Backend & Database, Cloud & DevOps, Tools & Practices)",
                },
              },
              required: ["category"],
            },
          },
          {
            name: "get_experience",
            description: "Get all work experience entries",
            inputSchema: {
              type: "object" as const,
              properties: {},
              required: [],
            },
          },
          {
            name: "get_projects",
            description: "Get all projects with details",
            inputSchema: {
              type: "object" as const,
              properties: {},
              required: [],
            },
          },
          {
            name: "get_contact_info",
            description: "Get contact information",
            inputSchema: {
              type: "object" as const,
              properties: {},
              required: [],
            },
          },
          {
            name: "search_portfolio",
            description: "Search portfolio data by keyword",
            inputSchema: {
              type: "object" as const,
              properties: {
                keyword: {
                  type: "string",
                  description: "Search term",
                },
              },
              required: ["keyword"],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request: any) => {
        try {
          const { name, arguments: args } = request.params;
          return await this.executeTool(name, args);
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error executing tool: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  private async executeTool(
    name: string,
    args: Record<string, any>
  ): Promise<any> {
    const portfolio = await Portfolio.findOne();

    if (!portfolio) {
      return {
        content: [
          {
            type: "text",
            text: "No portfolio data found",
          },
        ],
      };
    }

    switch (name) {
      case "get_portfolio_data":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  bio: portfolio.bio,
                  title: portfolio.title,
                  tagline: portfolio.tagline,
                  stats: portfolio.stats,
                  skills: portfolio.skills,
                  skillCategories: portfolio.skillCategories,
                  projects: portfolio.projects,
                  experience: portfolio.experience,
                  contact: portfolio.contact,
                },
                null,
                2
              ),
            },
          ],
        };

      case "get_skills_by_category":
        const category = args.category || "";
        const categories = portfolio.skillCategories || [];
        const found = categories.find(
          (c: any) => c.name.toLowerCase() === category.toLowerCase()
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(found || { message: "Category not found" }, null, 2),
            },
          ],
        };

      case "get_experience":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(portfolio.experience, null, 2),
            },
          ],
        };

      case "get_projects":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(portfolio.projects, null, 2),
            },
          ],
        };

      case "get_contact_info":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(portfolio.contact, null, 2),
            },
          ],
        };

      case "search_portfolio":
        const keyword = (args.keyword || "").toLowerCase();
        const results = {
          skills: portfolio.skills.filter((s: string) =>
            s.toLowerCase().includes(keyword)
          ),
          projects: portfolio.projects.filter(
            (p: any) =>
              p.name.toLowerCase().includes(keyword) ||
              p.description.toLowerCase().includes(keyword)
          ),
          experience: portfolio.experience.filter(
            (e: any) =>
              e.company.toLowerCase().includes(keyword) ||
              e.role.toLowerCase().includes(keyword) ||
              e.description.toLowerCase().includes(keyword)
          ),
        };
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(results, null, 2),
            },
          ],
        };

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
  }

  getServer(): Server {
    return this.server;
  }
}

// Export singleton instance
export const mongoMCPServer = new MongoMCPServer();
