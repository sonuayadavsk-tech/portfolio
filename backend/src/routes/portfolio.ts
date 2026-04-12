import express, { Request, Response } from "express";
import Portfolio from "../models/Portfolio.js";
import { fetchGitHubRepoData, isValidGitHubUrl } from "../utils/github.js";

const router = express.Router();

// GET - Fetch all portfolio data
router.get("/", async (req: Request, res: Response) => {
  try {
    let portfolio = await Portfolio.findOne();

    // If no portfolio exists, create default one
    if (!portfolio) {
      portfolio = new Portfolio({
        bio: "Full Stack Developer",
        skills: [],
        projects: [],
        experience: [],
        contact: {
          email: "your@email.com",
          github: "github.com/...",
          linkedin: "linkedin.com/...",
        },
      });
      await portfolio.save();
    }

    res.set("Cache-Control", "no-store, no-cache, must-revalidate");
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch portfolio" });
  }
});

// PUT - Update entire portfolio
router.put("/", async (req: Request, res: Response) => {
  try {
    const { password } = req.query;

    // Simple password protection
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // CRITICAL: Strip immutable fields that might be sent from frontend
    // This prevents "Immutable field _id was found to have been modified" errors
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.__v;

    // Filter out empty stats
    if (updateData.stats) {
      updateData.stats = updateData.stats.filter((stat: any) => stat.label && stat.value);
    }

    let portfolio = await Portfolio.findOne();

    if (!portfolio) {
      portfolio = new Portfolio(updateData);
    } else {
      Object.assign(portfolio, updateData);
    }

    await portfolio.save();
    res.json({ message: "Portfolio updated successfully", portfolio });
  } catch (error: any) {
    console.error("❌ Portfolio update error:", error.message);
    console.error("Full error:", error);
    res.status(500).json({ error: "Failed to update portfolio", details: error.message });
  }
});

// PUT - Update specific section (projects, experience, skills, etc)
router.put("/:section", async (req: Request, res: Response) => {
  try {
    const { password } = req.query;
    const { section } = req.params;

    // Password protection
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Strip immutable fields
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.__v;

    // Validate section
    const validSections = ["projects", "experience", "skills", "bio", "contact", "achievements"];
    if (!validSections.includes(section)) {
      return res.status(400).json({ error: "Invalid section" });
    }

    let portfolio = await Portfolio.findOne();

    if (!portfolio) {
      return res.status(404).json({ error: "Portfolio not found" });
    }

    // Update the specific section
    if (section === "projects") {
      // Fetch GitHub data for projects with GitHub URLs
      const updatedProjects = await Promise.all(
        updateData.projects.map(async (project: any) => {
          // ... (existing GitHub logic remains same, but use project variable)
          if (project.github && isValidGitHubUrl(project.github)) {
            if (
              project.githubData &&
              project.githubData.fetchedAt &&
              Date.now() - new Date(project.githubData.fetchedAt).getTime() < 24 * 60 * 60 * 1000
            ) {
              return project;
            }
            const githubData = await fetchGitHubRepoData(project.github);
            if (githubData) {
              project.githubData = githubData;
            }
          }
          return project;
        })
      );
      portfolio.projects = updatedProjects;
    } else if (section === "experience") {
      portfolio.experience = updateData.experience;
      portfolio.markModified("experience");
    } else if (section === "achievements") {
      portfolio.achievements = updateData.achievements;
    } else if (section === "skills") {
      if (updateData.skillCategories) {
        portfolio.skillCategories = updateData.skillCategories;
      } else if (updateData.skills) {
        portfolio.skills = updateData.skills;
      }
    } else if (section === "bio") {
      portfolio.bio = updateData.bio;
    } else if (section === "contact") {
      portfolio.contact = updateData.contact;
    }

    await portfolio.save();
    res.json({ message: `${section} updated successfully`, portfolio });
  } catch (error: any) {
    console.error(`❌ Error updating ${req.params.section}:`, error.message);
    console.error("Full error:", error);
    res.status(500).json({ error: `Failed to update ${req.params.section}`, details: error.message });
  }
});

// POST - Add project
router.post("/projects", async (req: Request, res: Response) => {
  try {
    const { password } = req.query;

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.status(404).json({ error: "Portfolio not found" });
    }

    const project = req.body;

    // Fetch GitHub data if GitHub URL is provided
    if (project.github && isValidGitHubUrl(project.github)) {
      console.log(`📡 Fetching GitHub data for new project: ${project.name}`);
      const githubData = await fetchGitHubRepoData(project.github);
      if (githubData) {
        project.githubData = githubData;
        console.log(`✅ GitHub data fetched for ${project.name}`);
      } else {
        console.warn(`⚠️ Could not fetch GitHub data for ${project.name}`);
      }
    }

    portfolio.projects.push(project);
    await portfolio.save();
    res.json({ message: "Project added successfully", project });
  } catch (error: any) {
    console.error("❌ Error adding project:", error.message);
    res.status(500).json({ error: "Failed to add project", details: error.message });
  }
});

// PUT - Update one project by id
router.put("/projects/:id", async (req: Request, res: Response) => {
  try {
    const { password } = req.query;

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.status(404).json({ error: "Portfolio not found" });
    }

    const projectIndex = portfolio.projects.findIndex(
      (p) => p._id?.toString() === req.params.id
    );

    if (projectIndex === -1) {
      return res.status(404).json({ error: "Project not found" });
    }

    const existing = portfolio.projects[projectIndex] as any;
    const body = req.body || {};

    const allowed = ["name", "description", "skills", "link", "github", "image"] as const;
    for (const key of allowed) {
      if (body[key] !== undefined) {
        existing[key] = body[key];
      }
    }

    if (body.github && isValidGitHubUrl(body.github)) {
      const githubData = await fetchGitHubRepoData(body.github);
      if (githubData) {
        existing.githubData = githubData;
      }
    } else if (body.github === "" || body.github === null) {
      existing.githubData = undefined;
    }

    portfolio.projects[projectIndex] = existing;
    await portfolio.save();
    res.json({ message: "Project updated successfully", portfolio, project: existing });
  } catch (error: any) {
    console.error("❌ Error updating project:", error.message);
    res.status(500).json({ error: "Failed to update project", details: error.message });
  }
});

// DELETE - Delete project
router.delete("/projects/:id", async (req: Request, res: Response) => {
  try {
    const { password } = req.query;

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.status(404).json({ error: "Portfolio not found" });
    }

    portfolio.projects = portfolio.projects.filter(
      (p) => p._id?.toString() !== req.params.id
    );
    await portfolio.save();
    res.json({ message: "Project deleted", portfolio });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete project" });
  }
});

export default router;
