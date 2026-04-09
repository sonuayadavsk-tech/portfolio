import express, { Request, Response } from "express";
import Portfolio from "../models/Portfolio.js";
import { Groq } from "groq-sdk";
import { fetchGitHubRepoData, isValidGitHubUrl } from "../utils/github.js";

const router = express.Router();
const GITHUB_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function normalizeText(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function parseGitHubOwnerRepo(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/\.\?]+)(\.git)?/i);
  if (!match) return null;
  return { owner: match[1].toLowerCase(), repo: match[2].toLowerCase() };
}

function findMostRelevantProject(portfolio: any, userMessage: string): any | null {
  const projects = portfolio?.projects || [];
  if (!projects.length) return null;

  const normalizedMessage = normalizeText(userMessage);
  let bestMatch: any = null;
  let bestScore = 0;

  for (const project of projects) {
    let score = 0;
    const projectName = normalizeText(project.name || "");
    const description = normalizeText(project.description || "");
    const githubUrl = (project.github || "").toLowerCase();
    const parsedRepo = githubUrl ? parseGitHubOwnerRepo(githubUrl) : null;

    if (projectName && normalizedMessage.includes(projectName)) score += 10;
    if (parsedRepo?.repo && normalizedMessage.includes(parsedRepo.repo)) score += 8;
    if (parsedRepo?.owner && normalizedMessage.includes(parsedRepo.owner)) score += 4;
    if (githubUrl && userMessage.toLowerCase().includes(githubUrl)) score += 12;

    for (const keyword of projectName.split(" ").filter((k: string) => k.length > 2)) {
      if (normalizedMessage.includes(keyword)) score += 1;
    }
    for (const keyword of description.split(" ").filter((k: string) => k.length > 4).slice(0, 8)) {
      if (normalizedMessage.includes(keyword)) score += 0.5;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = project;
    }
  }

  return bestScore >= 3 ? bestMatch : null;
}

async function ensureProjectGitHubContext(project: any): Promise<any> {
  if (!project?.github || !isValidGitHubUrl(project.github)) {
    return project;
  }

  const isFresh =
    project.githubData?.fetchedAt &&
    Date.now() - new Date(project.githubData.fetchedAt).getTime() < GITHUB_CACHE_TTL_MS;

  if (isFresh && project.githubData) {
    return project;
  }

  const githubData = await fetchGitHubRepoData(project.github);
  if (!githubData) {
    return project;
  }

  project.githubData = githubData;
  return project;
}

// Helper function to build portfolio context
async function buildPortfolioContext(): Promise<string> {
  try {
    const portfolio = await Portfolio.findOne();
    if (!portfolio) return "";

    const projectsInfo = portfolio.projects
      .map((proj: any) => {
        let projectContent = `**${proj.name}**: ${proj.description}\nSkills: ${proj.skills || ""}`;
        
        // Add GitHub data if available
        if (proj.githubData) {
          const ghData = proj.githubData;
          projectContent += `\n\n**GitHub Repository**: ${ghData.url}`;
          projectContent += `\nRepository: ${ghData.owner}/${ghData.repo}`;
          projectContent += `\nStars: ⭐ ${ghData.stars}`;
          projectContent += `\nLanguage: ${ghData.language}`;
          projectContent += `\nTopics: ${ghData.topics.join(", ") || "N/A"}`;
          projectContent += `\nTechnologies: ${ghData.technologies.join(", ") || "N/A"}`;
          
          if (ghData.packageJson) {
            projectContent += `\n\nProject Details:`;
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
            // Include first 500 chars of README
            projectContent += `\n\nProject Overview:\n${ghData.readme.substring(0, 500)}...`;
          }
        }
        
        return projectContent;
      })
      .join("\n\n---\n\n");

    return `
# Portfolio Information

## Professional Summary
${portfolio.bio}

## Title & Tagline
${portfolio.title} - ${portfolio.tagline}

## Skills by Category
${(portfolio.skillCategories || [])
  .map((cat: any) => `**${cat.name}**: ${cat.skills || ""}`)
  .join("\n")}

## Professional Experience
${portfolio.experience
  .map(
    (exp: any) =>
      `**${exp.role}** at ${exp.company} (${exp.duration})\n${exp.description}`
  )
  .join("\n\n")}

## Projects
${projectsInfo}

## Contact Information
- Email: ${portfolio.contact.email}
- Phone: ${portfolio.contact.phone}
- Location: ${portfolio.contact.location}
- LinkedIn: ${portfolio.contact.linkedin}
- GitHub: ${portfolio.contact.github}

## Statistics
${portfolio.stats.map((s: any) => `- ${s.label}: ${s.value}`).join("\n")}
    `;
  } catch (error) {
    console.error("Error building context:", error);
    return "";
  }
}

// POST - Chat with AI using Groq (Fast & Free!)
router.post("/", async (req: Request, res: Response) => {
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

    // If user asks about a specific project, ensure its GitHub context is available/up-to-date
    const focusedProject = findMostRelevantProject(portfolio, message);
    if (focusedProject) {
      const enrichedProject = await ensureProjectGitHubContext(focusedProject);
      if (enrichedProject?.githubData) {
        await portfolio.save();
      }
    }

    // Build context with portfolio data
    const portfolioContext = await buildPortfolioContext();

    // System prompt with comprehensive context
    const systemPrompt = `You are an expert portfolio assistant for Sonu, a full-stack developer specializing in MERN (MongoDB, Express, React, Node.js) and Java development.

You have access to Sonu's complete portfolio information:
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
- If user asks about a specific project, prioritize details from that project's GitHub context (repo description, technologies, dependencies, README summary, and repo metadata) if available.`;

    // Call Groq API with context
    if (!process.env.GROQ_API_KEY) {
      console.error("❌ GROQ_API_KEY not found in environment");
      return res.status(500).json({
        error: "Groq API key not configured",
        details: "GROQ_API_KEY environment variable is missing",
      });
    }

    console.log("✅ GROQ_API_KEY found:", process.env.GROQ_API_KEY?.substring(0, 10) + "...");
    
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
      stop: null,
    });

    const assistantMessage =
      completion.choices[0]?.message?.content ||
      "I couldn't process your request. Please try again.";

    res.json({
      message: assistantMessage,
      source: "groq-with-portfolio-context",
      model: "llama-3.3-70b-versatile",
      hasContext: true,
      portfolioDataIncluded: true,
    });
  } catch (error: any) {
    console.error("Chat error:", error);

    const statusCode =
      error?.status || error?.response?.status || error?.cause?.status;

    if (statusCode === 429) {
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
    });
  }
});

export default router;
