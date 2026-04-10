import axios from "axios";

interface GitHubRepoData {
  owner: string;
  repo: string;
  url: string;
  description: string;
  language: string;
  stars: number;
  topics: string[];
  readme?: string;
  packageJson?: {
    name: string;
    version: string;
    description: string;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };
  technologies: string[];
  fetchedAt: Date;
}

// Extract owner and repo from GitHub URL
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    // Handle multiple GitHub URL formats
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/\.]+)(\.git)?$/i,
      /github\.com\/([^\/]+)\/([^\/\.]+)\/?$/i,
      /https?:\/\/github\.com\/([^\/]+)\/([^\/\.]+)/i,
      /git@github\.com:([^\/]+)\/([^\/\.]+)(\.git)?$/i,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return {
          owner: match[1],
          repo: match[2],
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error parsing GitHub URL:", error);
    return null;
  }
}

// Fetch GitHub repository data
export async function fetchGitHubRepoData(
  githubUrl: string
): Promise<GitHubRepoData | null> {
  try {
    const parsed = parseGitHubUrl(githubUrl);
    if (!parsed) {
      console.error("❌ Invalid GitHub URL format");
      return null;
    }

    const { owner, repo } = parsed;
    console.log(`📡 Fetching GitHub data for ${owner}/${repo}...`);

    // Helper function to make API calls with fallback to unauthenticated
    const fetchWithFallback = async (url: string) => {
      try {
        return await axios.get(url, {
          headers: process.env.GITHUB_TOKEN
            ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
            : {},
          timeout: 10000,
        });
      } catch (error: any) {
        // If auth fails, try without authentication
        if (error.response?.status === 401 && process.env.GITHUB_TOKEN) {
          console.warn(`⚠️ GitHub token failed, falling back to unauthenticated request`);
          return await axios.get(url, { timeout: 10000 });
        }
        throw error;
      }
    };

    // Fetch repository info
    const repoResponse = await fetchWithFallback(
      `https://api.github.com/repos/${owner}/${repo}`
    );

    const repoData = repoResponse.data;

    // Fetch README
    let readme = "";
    try {
      const readmeResponse = await fetchWithFallback(
        `https://api.github.com/repos/${owner}/${repo}/contents/README.md`
      );
      readme = Buffer.from(readmeResponse.data.content, "base64").toString(
        "utf-8"
      );
    } catch (error) {
      console.warn("⚠️ Could not fetch README");
    }

    // Fetch package.json
    let packageJson = null;
    try {
      const pkgResponse = await fetchWithFallback(
        `https://api.github.com/repos/${owner}/${repo}/contents/package.json`
      );
      const pkgContent = Buffer.from(pkgResponse.data.content, "base64").toString(
        "utf-8"
      );
      const parsed = JSON.parse(pkgContent);
      packageJson = {
        name: parsed.name || "",
        version: parsed.version || "",
        description: parsed.description || "",
        dependencies: parsed.dependencies || {},
        devDependencies: parsed.devDependencies || {},
      };
    } catch (error) {
      console.warn("⚠️ Could not fetch package.json");
    }

    // Extract technologies from package.json and language
    const technologies: Set<string> = new Set();

    if (repoData.language) {
      technologies.add(repoData.language);
    }

    if (packageJson) {
      // Common tech stacks to identify
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      const techMap: Record<string, string> = {
        react: "React",
        "next.js": "Next.js",
        vue: "Vue",
        angular: "Angular",
        express: "Express.js",
        "fastify": "Fastify",
        nestjs: "NestJS",
        django: "Django",
        flask: "Flask",
        fastapi: "FastAPI",
        mongodb: "MongoDB",
        mongoose: "Mongoose",
        postgresql: "PostgreSQL",
        mysql: "MySQL",
        typescript: "TypeScript",
        python: "Python",
        java: "Java",
        rust: "Rust",
        graphql: "GraphQL",
        apollo: "Apollo",
        webpack: "Webpack",
        vite: "Vite",
        tailwindcss: "Tailwind CSS",
        "material-ui": "Material UI",
        bootstrap: "Bootstrap",
        docker: "Docker",
        kubernetes: "Kubernetes",
        aws: "AWS",
        firebase: "Firebase",
        redis: "Redis",
        jest: "Jest",
        mocha: "Mocha",
        pytest: "Pytest",
      };

      for (const [dep, tech] of Object.entries(techMap)) {
        if (Object.keys(allDeps).some((key) => key.toLowerCase().includes(dep))) {
          technologies.add(tech);
        }
      }
    }

    const result: GitHubRepoData = {
      owner,
      repo,
      url: repoData.html_url,
      description: repoData.description || "",
      language: repoData.language || "Unknown",
      stars: repoData.stargazers_count || 0,
      topics: repoData.topics || [],
      readme: readme || undefined,
      packageJson: packageJson || undefined,
      technologies: Array.from(technologies),
      fetchedAt: new Date(),
    };

    console.log(`✅ Successfully fetched GitHub data for ${owner}/${repo}`);
    return result;
  } catch (error) {
    console.error("❌ Error fetching GitHub data:", error instanceof Error ? error.message : error);
    return null;
  }
}

// Validate if URL is a valid GitHub URL
export function isValidGitHubUrl(url: string): boolean {
  return parseGitHubUrl(url) !== null;
}
