import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Octokit } from "octokit";

// MCP GitHub Server for Repository Access
export class GitHubMCPServer {
  private server: Server;
  private octokit: Octokit;

  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    this.server = new Server(
      {
        name: "portfolio-github-mcp",
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
            name: "read_file",
            description:
              "Read the contents of a file from the GitHub repository",
            inputSchema: {
              type: "object" as const,
              properties: {
                path: {
                  type: "string",
                  description: "Path to the file relative to repo root",
                },
              },
              required: ["path"],
            },
          },
          {
            name: "list_files",
            description: "List files in a directory from the repository",
            inputSchema: {
              type: "object" as const,
              properties: {
                path: {
                  type: "string",
                  description:
                    "Path to the directory relative to repo root (empty for root)",
                },
              },
              required: ["path"],
            },
          },
          {
            name: "get_repository_info",
            description: "Get basic information about the repository",
            inputSchema: {
              type: "object" as const,
              properties: {},
              required: [],
            },
          },
          {
            name: "search_files",
            description: "Search for files by extension or pattern",
            inputSchema: {
              type: "object" as const,
              properties: {
                extension: {
                  type: "string",
                  description: "File extension to search for (e.g., tsx, ts, java)",
                },
              },
              required: ["extension"],
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
                text: `Error executing GitHub tool: ${error instanceof Error ? error.message : String(error)}`,
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
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;

    if (!owner || !repo) {
      return {
        content: [
          {
            type: "text",
            text: "GitHub credentials not configured. Please set GITHUB_OWNER and GITHUB_REPO environment variables.",
          },
        ],
        isError: true,
      };
    }

    try {
      switch (name) {
        case "read_file": {
          const path = args.path || "";
          const response = await this.octokit.rest.repos.getContent({
            owner,
            repo,
            path,
          });

          if (Array.isArray(response.data)) {
            return {
              content: [
                {
                  type: "text",
                  text: "Path is a directory. Use list_files instead.",
                },
              ],
            };
          }

          const content =
            "content" in response.data
              ? Buffer.from(response.data.content, "base64").toString("utf-8")
              : "";

          return {
            content: [
              {
                type: "text",
                text: content,
              },
            ],
          };
        }

        case "list_files": {
          const path = args.path || "";
          const response = await this.octokit.rest.repos.getContent({
            owner,
            repo,
            path,
          });

          if (!Array.isArray(response.data)) {
            return {
              content: [
                {
                  type: "text",
                  text: "Path is a file, not a directory.",
                },
              ],
            };
          }

          const files = response.data.map((item: any) => ({
            name: item.name,
            path: item.path,
            type: item.type,
          }));

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(files, null, 2),
              },
            ],
          };
        }

        case "get_repository_info": {
          const response = await this.octokit.rest.repos.get({
            owner,
            repo,
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    name: response.data.name,
                    description: response.data.description,
                    url: response.data.html_url,
                    language: response.data.language,
                    stars: response.data.stargazers_count,
                    topics: response.data.topics,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        case "search_files": {
          const extension = args.extension || "tsx|ts|jsx|js|java";
          try {
            const response = await this.octokit.rest.search.code({
              q: `repo:${owner}/${repo} extension:${extension}`,
              per_page: 20,
            });

            const files = response.data.items.map((item: any) => ({
              name: item.name,
              path: item.path,
              url: item.html_url,
            }));

            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(files, null, 2),
                },
              ],
            };
          } catch (searchError) {
            // Fallback: list files manually with basic filtering
            return {
              content: [
                {
                  type: "text",
                  text: "Search API rate limited. Please use read_file or list_files instead.",
                },
              ],
            };
          }
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
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `GitHub API error: ${error instanceof Error ? error.message : String(error)}`,
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
export const gitHubMCPServer = new GitHubMCPServer();
