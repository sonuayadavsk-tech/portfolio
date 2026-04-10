import express, { Request, Response } from "express";
import Portfolio from "../models/Portfolio.js";
import { Groq } from "groq-sdk";
import { fetchGitHubRepoData, isValidGitHubUrl } from "../utils/github.js";
import { groqChatTools, executeGroqChatTool } from "../mcp/tools.js";

const CHAT_MODEL = "llama-3.3-70b-versatile";
const MAX_TOOL_ROUNDS = 5;
const MAX_TOOL_OUTPUT_CHARS = 48000;

const router = express.Router();
const GITHUB_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Fetches/refreshes GitHub metadata for one project when missing or stale. Returns true if DB should be saved. */
async function ensureProjectGitHubContext(project: any): Promise<boolean> {
  if (!project?.github || !isValidGitHubUrl(project.github)) {
    return false;
  }

  const isFresh =
    project.githubData?.fetchedAt &&
    Date.now() - new Date(project.githubData.fetchedAt).getTime() < GITHUB_CACHE_TTL_MS;

  if (isFresh && project.githubData) {
    return false;
  }

  const githubData = await fetchGitHubRepoData(project.github);
  if (!githubData) {
    return false;
  }

  project.githubData = githubData;
  return true;
}

/** Load cached GitHub data from DB for every project with a repo URL; refresh when stale. Persists once if anything changed. */
async function syncAllProjectsGitHubFromDb(portfolio: any): Promise<void> {
  const projects = portfolio?.projects || [];
  let anyUpdated = false;

  for (const proj of projects) {
    if (await ensureProjectGitHubContext(proj)) {
      anyUpdated = true;
    }
  }

  if (anyUpdated && typeof portfolio.markModified === "function") {
    portfolio.markModified("projects");
    await portfolio.save();
    console.log("💾 Saved refreshed GitHub metadata for one or more projects");
  }
}

function formatProjectForContext(proj: any): string {
  const skills = Array.isArray(proj.skills) ? proj.skills.join(", ") : proj.skills || "";
  let projectContent = `**${proj.name}**: ${proj.description}\nSkills: ${skills}`;

  if (proj.github) {
    projectContent += `\nGitHub URL (admin): ${proj.github}`;
  }
  if (proj.link) {
    projectContent += `\nLive / hosted: ${proj.link}`;
  }

  if (proj.githubData) {
    const ghData = proj.githubData;
    projectContent += `\n\n**GitHub (from DB / API)**`;
    projectContent += `\nRepository: ${ghData.url || `${ghData.owner}/${ghData.repo}`}`;
    projectContent += `\nStars: ⭐ ${ghData.stars ?? "N/A"}`;
    projectContent += `\nLanguage: ${ghData.language || "N/A"}`;
    projectContent += `\nTopics: ${(ghData.topics || []).join(", ") || "N/A"}`;
    projectContent += `\nTechnologies: ${(ghData.technologies || []).join(", ") || "N/A"}`;

    if (ghData.packageJson) {
      projectContent += `\n\nProject Details (package.json):`;
      projectContent += `\n- Name: ${ghData.packageJson.name}`;
      projectContent += `\n- Version: ${ghData.packageJson.version}`;
      if (ghData.packageJson.description) {
        projectContent += `\n- Description: ${ghData.packageJson.description}`;
      }

      const deps = Object.keys(ghData.packageJson.dependencies || {});
      if (deps.length > 0) {
        projectContent += `\n- Key Dependencies: ${deps.slice(0, 8).join(", ")}${deps.length > 8 ? ", ..." : ""}`;
      }
    }

    if (ghData.readme) {
      projectContent += `\n\nREADME excerpt:\n${ghData.readme.substring(0, 500)}...`;
    }
  } else if (proj.github && isValidGitHubUrl(proj.github)) {
    projectContent += `\n(GitHub metadata not yet cached — repo may be private or API rate-limited.)`;
  }

  return projectContent;
}

/** Build Groq system context from an already-loaded Mongoose portfolio document (same object we synced GitHub on). */
function buildPortfolioContextFromDoc(portfolio: any): string {
  try {
    if (!portfolio) return "";

    const projectsInfo = (portfolio.projects || []).map(formatProjectForContext).join("\n\n---\n\n");

    const skillLines = (portfolio.skillCategories || []).map((cat: any) => {
      const title = cat.title || cat.name || "Category";
      const sk = Array.isArray(cat.skills) ? cat.skills.join(", ") : cat.skills || "";
      return `**${title}**: ${sk}`;
    });

    return `
# Portfolio Information

## Professional Summary
${portfolio.bio}

## Title & Tagline
${portfolio.title} - ${portfolio.tagline}

## Skills by Category
${skillLines.join("\n")}

## Professional Experience
${(portfolio.experience || [])
        .map(
          (exp: any) =>
            `**${exp.role}** at ${exp.company} (${exp.duration})\n${exp.description}`
        )
        .join("\n\n")}

## Projects
${projectsInfo}

## Certificates & Achievements
${(portfolio.achievements || [])
        .map(
          (ach: any) =>
            `**${ach.title}** from ${ach.issuer} (${ach.date || 'N/A'})\n${ach.description || ''}\nLink: ${ach.link || ''}`
        )
        .join("\n\n")}

## Resume Link
${portfolio.resumeUrl || "Not strictly available right now"}

## Contact Information
- Email: ${portfolio.contact?.email}
- Phone: ${portfolio.contact?.phone}
- Location: ${portfolio.contact?.location}
- LinkedIn: ${portfolio.contact?.linkedin}
- GitHub: ${portfolio.contact?.github}

## Statistics
${(portfolio.stats || []).map((s: any) => `- ${s.label}: ${s.value}`).join("\n")}
    `;
  } catch (error) {
    console.error("Error building context:", error);
    return "";
  }
}

// POST - Chat with AI using Groq (Fast & Free!)
router.post("/", async (req: Request, res: Response) => {
  let messages: any[] = [];
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Handle simple greetings locally
    const lowerMessage = message.toLowerCase().trim();
    const simpleGreetings: { [key: string]: string } = {
      hi: "Hi there! 👋 Welcome to Sonu's portfolio. Feel free to ask me about any projects, experience, or skills!",
      hello:
        "Hello! 👋 Great to meet you. I'm Sonu's portfolio assistant. What would you like to know?",
      hey: "Hey! 👋 Welcome! Ask me anything about Sonu's work and experience.",
      greetings:
        "Greetings! 👋 I'm here to help you learn about Sonu's portfolio.",
      howdy:
        "Howdy! 👋 Welcome to Sonu's portfolio. What can I tell you about?",
    };

    if (simpleGreetings[lowerMessage]) {
      return res.json({
        message: simpleGreetings[lowerMessage],
        source: "greeting",
      });
    }

    // Check if portfolio data exists
    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.json({
        message:
          "Thanks for reaching out! I'm Sonu's portfolio assistant. It looks like the portfolio data is still being set up. Please check back soon!",
        source: "no-data",
      });
    }

    // Refresh stale/missing GitHub metadata for all projects (from DB + GitHub API), then answer from that data
    await syncAllProjectsGitHubFromDb(portfolio);

    const portfolioContext = buildPortfolioContextFromDoc(portfolio);

    // System prompt with comprehensive context
    const systemPrompt = `You are an expert portfolio assistant for Sonu, a full-stack developer specializing in MERN (MongoDB, Express, React, Node.js) and Java development.

You have access to Sonu's complete portfolio information (stored in MongoDB). Project GitHub details (stars, language, README excerpt, dependencies) are loaded from the database and refreshed from the GitHub API when stale.

${portfolioContext}

## Your Responsibilities:
1. Answer questions about Sonu's skills, experience, and projects with specific details
2. Explain technical concepts in MERN and Java stacks
3. Provide interview preparation assistance based on Sonu's background
4. Be professional, friendly, and concise
5. Always reference specific examples from the portfolio when relevant
6. Help users understand Sonu's technical capabilities and potential

## Areas of Expertise to Emphasize:
- Full-stack MERN development (MongoDB, Express, React, Node.js)
- Java backend development
- Frontend design with React and modern CSS
- Database design with MongoDB
- RESTful API design
- Cloud deployment (AWS, DigitalOcean)
- Agile development practices

## Response Guidelines:
- Keep responses clear and concise
- Use the portfolio data to provide specific examples
- For interview questions, relate answers to Sonu's actual experience
- Be encouraging and highlight strengths
- If asked about something not in portfolio, be honest but try to relate to what is known

## Project Question Rule:
- If user asks about a specific project, prioritize details from that project's GitHub context (repo description, technologies, dependencies, README summary, and repo metadata) if available.

## GitHub tools (MCP-style, portfolio repos only)
You can call tools to browse and read **source code** from GitHub repositories that are **already linked** to portfolio projects (admin-configured). Use \`list_portfolio_repo_files\` to explore folders, then \`read_portfolio_repo_file\` to read a file. Pass \`project_name\` matching a portfolio project. Private repos need \`GITHUB_TOKEN\` on the server. Do not invent file paths — list first when unsure.`;

    if (!process.env.GROQ_API_KEY) {
      console.error("❌ GROQ_API_KEY not found in environment");
      return res.status(500).json({
        error: "Groq API key not configured",
        details: "GROQ_API_KEY environment variable is missing",
      });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ];

    let usedTools = false;
    let rounds = 0;

    while (rounds < MAX_TOOL_ROUNDS) {
      rounds += 1;
      let completion: any;
      try {
        completion = await groq.chat.completions.create({
          model: CHAT_MODEL,
          messages,
          tools: groqChatTools as any,
          temperature: 0.7,
          max_tokens: 1024,
          top_p: 1,
          stream: false,
        } as any);
      } catch (err: any) {
        if (err?.error?.error?.code === "tool_use_failed" || err?.status === 400) {
          console.warn("Groq failed to use tools correctly, retrying without tools.");
          completion = await groq.chat.completions.create({
            model: CHAT_MODEL,
            messages,
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 1,
            stream: false,
          } as any);
        } else {
          throw err;
        }
      }

      const choice = completion.choices[0]?.message;
      if (!choice) {
        break;
      }

      const toolCalls = choice.tool_calls;
      if (!toolCalls?.length) {
        const text = choice.content?.trim() || "I couldn't process your request. Please try again.";
        return res.json({
          message: text,
          source: usedTools ? "groq-with-portfolio-github-tools" : "groq-with-portfolio-context",
          model: CHAT_MODEL,
          hasContext: true,
          portfolioDataIncluded: true,
          usedGithubTools: usedTools,
        });
      }

      usedTools = true;
      messages.push({
        role: "assistant",
        content: choice.content || null,
        tool_calls: toolCalls,
      });

      for (const tc of toolCalls) {
        const fn = tc.function;
        const name = fn?.name || "";
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(fn?.arguments || "{}") as Record<string, unknown>;
        } catch {
          args = {};
        }
        let out = await executeGroqChatTool(name, args as Record<string, any>, portfolio);
        if (out.length > MAX_TOOL_OUTPUT_CHARS) {
          out = out.slice(0, MAX_TOOL_OUTPUT_CHARS) + "\n...[truncated for length]";
        }
        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: out,
        });
      }
    }

    const finalCompletion = await groq.chat.completions.create({
      model: CHAT_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    } as any);

    const assistantMessage =
      finalCompletion.choices[0]?.message?.content?.trim() ||
      "I couldn't process your request. Please try again.";

    res.json({
      message: assistantMessage,
      source: "groq-with-portfolio-github-tools",
      model: CHAT_MODEL,
      hasContext: true,
      portfolioDataIncluded: true,
      usedGithubTools: usedTools,
    });
  } catch (error: any) {
    console.error("Chat error:", error);

    const statusCode =
      error?.status || error?.response?.status || error?.cause?.status;

    if (statusCode === 429) {
      if (process.env.OPENROUTER_API_KEY) {
        console.log("Groq rate limited. Falling back to OpenRouter...");
        try {
          // Strip tool calls for safety on OpenRouter fallback
          const cleanMessages = messages.filter(m => m.role !== "tool").map(m => {
            if (m.role === "assistant") {
              return { role: "assistant", content: m.content || "" };
            }
            return m;
          });

          const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY.trim()}`,
              "HTTP-Referer": "http://localhost:5000",
              "X-Title": "Portfolio Chatbot"
            },
            body: JSON.stringify({
              model: "meta-llama/llama-3.3-70b-instruct",
              messages: cleanMessages,
            })
          });
          const orData: any = await orResponse.json();
          if (orData.choices && orData.choices.length > 0) {
            return res.json({
              message: orData.choices[0].message.content,
              source: "openrouter-fallback",
              model: orData.model || "meta-llama/llama-3.3-70b-instruct",
              hasContext: true,
              portfolioDataIncluded: true,
              usedGithubTools: false,
            });
          } else {
            console.error("OpenRouter returned invalid data:", JSON.stringify(orData, null, 2));
            return res.status(502).json({
              error: "OpenRouter Fallback Failed",
              message: "The OpenRouter API failed to complete the request: " + (orData.error?.message || JSON.stringify(orData))
            });
          }
        } catch (orError) {
          console.error("OpenRouter fallback crashed:", orError);
          return res.status(500).json({ error: "OpenRouter crash", message: String(orError) });
        }
      }

      const retryAfterHeader =
        error?.response?.headers?.["retry-after"] ||
        error?.headers?.["retry-after"];
      const retryAfter = Number.parseInt(retryAfterHeader, 10);

      return res.status(429).json({
        error: "Too many requests",
        message:
          "You are sending requests too quickly. Please try again shortly.",
        retryAfterSeconds: Number.isFinite(retryAfter) ? retryAfter : undefined,
      });
    }

    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }

    res.status(500).json({
      error: "Failed to process chat request",
      hint: "Make sure GROQ_API_KEY is set in backend/.env",
      actualError: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
});

export default router;
