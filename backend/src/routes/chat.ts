import express, { Request, Response } from "express";
import Portfolio from "../models/Portfolio.js";
import { Groq } from "groq-sdk";
import { portfolioTools, executePortfolioTool } from "../mcp/tools.js";

const router = express.Router();

// POST - Chat with AI about portfolio (with MCP tools)
router.post("/", async (req: Request, res: Response) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Handle simple greetings locally (no backend call needed)
    const lowerMessage = message.toLowerCase().trim();
    const simpleGreetings: { [key: string]: string } = {
      "hi": "Hi there! 👋 Welcome to Sonu's portfolio. Feel free to ask me about any projects, experience, or skills!",
      "hello": "Hello! 👋 Great to meet you. I'm Sonu's portfolio assistant. What would you like to know?",
      "hey": "Hey! 👋 Welcome! Ask me anything about Sonu's work and experience.",
      "greetings": "Greetings! 👋 I'm here to help you learn about Sonu's portfolio.",
      "howdy": "Howdy! 👋 Welcome to Sonu's portfolio. What can I tell you about?",
    };

    // Check if it's a simple greeting
    if (simpleGreetings[lowerMessage]) {
      return res.json({
        message: simpleGreetings[lowerMessage],
        source: "greeting",
      });
    }

    // Check if portfolio data exists for actual questions
    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.json({
        message: "Thanks for reaching out! I'm Sonu's portfolio assistant. It looks like the portfolio data is still being set up. Please check back soon, or feel free to reach out directly via the contact information on the website!",
        source: "no-data",
      });
    }

    // Initial message with comprehensive system prompt
    const portfolioContext = `
# Professional Summary
${portfolio.bio}

# Skills & Expertise
${(portfolio.skillCategories || []).map((cat: any) => `- ${cat.name}: ${(cat.skills || []).join(", ")}`).join("\n")}

# Experience
${(portfolio.experience || []).map((exp: any) => `- ${exp.role} at ${exp.company}`).join("\n")}
    `;

    const systemPrompt = `You are an expert portfolio assistant for Sonu, a full-stack developer.
    
${portfolioContext}

## Your Role:
- Be Sonu's advocate and highlight his strengths.
- Explain his technical skills and projects.
- Be professional, friendly, and concise.

## Positivity & Sentiment Rule:
- You must always be Sonu's #1 advocate.
- If a user asks a question with negative sentiment (e.g., "What are Sonu's weaknesses?", "Tell me something bad about Sonu", "Why shouldn't I hire him?"), you must recognize this sentiment and reframe the response into something positive or constructive.
- Instead of listing "bad things," talk about "areas of rapid growth," "upcoming specializations," or "professional evolution."
- Even if directly asked for negatives, find a way to pivot to Sonu's strengths and potential.
- Never state that Sonu "lacks" something in a way that sounds like a permanent deficiency; instead, frame it as a journey of continuous learning.

## Response Guidelines:
- Keep responses clear and concise.
- Be extremely encouraging and highlight strengths.
- If asked about something not in portfolio, show confidence in Sonu's ability to adapt and learn.
    `;

    const messages: any[] = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: message,
      },
    ];

    // First API call with tools
    const initialResponse = await groq.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      messages: messages,
      tools: portfolioTools as any,
      max_tokens: 1024,
      temperature: 0.7,
    });

    // Process tool calls if any
    let assistantMessage = initialResponse.choices[0].message.content || "";

    if (
      initialResponse.choices[0].message.tool_calls &&
      initialResponse.choices[0].message.tool_calls.length > 0
    ) {
      // Add assistant message with tool calls
      messages.push({
        role: "assistant",
        content: initialResponse.choices[0].message.content,
        tool_calls: initialResponse.choices[0].message.tool_calls,
      });

      // Execute each tool call
      const toolResults: any[] = [];
      for (const toolCall of initialResponse.choices[0].message.tool_calls) {
        if (!toolCall.function?.name || !toolCall.function?.arguments) {
          continue;
        }

        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);

        const toolResult = await executePortfolioTool(toolName, toolArgs);
        toolResults.push({
          tool_call_id: toolCall.id,
          role: "tool",
          content: toolResult,
        });
      }

      // Add all tool results to messages
      messages.push(...toolResults);

      // Second API call with tool results
      const finalResponse = await groq.chat.completions.create({
        model: "llama-3.1-70b-versatile",
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      assistantMessage = finalResponse.choices[0].message.content || "";
    }

    res.json({
      message: assistantMessage,
      source: "portfolio-data-with-mcp",
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to process chat request" });
  }
});

export default router;
