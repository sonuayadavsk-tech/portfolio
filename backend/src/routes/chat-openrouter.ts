import express, { Request, Response } from "express";
import Portfolio from "../models/Portfolio.js";
import axios from "axios";
import { mongoMCPServer } from "../mcp/mongo-server.js";

const router = express.Router();

// Helper function to extract and format context from MongoDB MCP
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
# Portfolio Context

## About
${portfolio.bio}

## Skills by Category
${(portfolio.skillCategories || [])
  .map((cat: any) => `- **${cat.name}**: ${(cat.skills || []).join(", ")}`)
  .join("\n")}

## Experience
${portfolio.experience
  .map(
    (exp: any) =>
      `- **${exp.role}** at ${exp.company} (${exp.duration})\n  ${exp.description}`
  )
  .join("\n")}

## Projects
${projectsInfo}

## Contact
Email: ${portfolio.contact.email}
Phone: ${portfolio.contact.phone}
Location: ${portfolio.contact.location}
LinkedIn: ${portfolio.contact.linkedin}
GitHub: ${portfolio.contact.github}
    `;
  } catch (error) {
    console.error("Error building context:", error);
    return "";
  }
}

// POST - Chat with AI about portfolio using OpenRouter API
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

    // Build enhanced context with portfolio data
    const portfolioContext = await buildPortfolioContext();

    // System prompt with full context
    const systemPrompt = `You are an expert portfolio assistant for Sonu, a full-stack software developer specializing in MERN (MongoDB, Express, React, Node.js) and Java development.

You have access to the following context about Sonu's portfolio, skills, experience, and projects:

${portfolioContext}

## Your Role:
- Provide detailed explanations about Sonu's skills, experience, and projects
- Suggest relevant opportunities based on Sonu's expertise
- Explain technical concepts in the MERN and Java stacks
- Answer interview-style questions based on Sonu's background
- Be professional yet friendly
- Provide specific examples from the portfolio when relevant
- Help users understand Sonu's technical capabilities

## Technical Expertise:
- Full-stack web development with MERN
- Java backend development
- Database design and optimization
- API design and REST principles
- Frontend frameworks and component design
- Cloud deployment and DevOps
- Modern web technologies (TypeScript, Tailwind CSS, etc.)`;

    // Call OpenRouter API with enhanced context
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("❌ OPENROUTER_API_KEY is missing!");
      return res.status(500).json({
        error: "OpenRouter API key not configured",
      });
    }

    console.log("✅ Using OpenRouter API | Model: gpt-4-turbo");
    console.log("🔑 API Key configured:", !!process.env.OPENROUTER_API_KEY);

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "gpt-4-turbo",
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
        temperature: 0.7,
        max_tokens: 1500,
        top_p: 1,
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:8080",
          "X-OpenRouter-Title": "Portfolio Assistant",
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const assistantMessage =
      response.data.choices[0]?.message?.content ||
      "I couldn't process your request. Please try again.";

    res.json({
      message: assistantMessage,
      source: "openrouter-with-mcp-context",
      model: "gpt-4-turbo",
    });
  } catch (error) {
    console.error("Chat error:", error);

    if (axios.isAxiosError(error)) {
      console.error("OpenRouter API Error:", error.response?.data);
      return res.status(500).json({
        error: "Failed to process chat request",
        details: error.response?.data,
      });
    }

    res.status(500).json({ error: "Failed to process chat request" });
  }
});

export default router;
