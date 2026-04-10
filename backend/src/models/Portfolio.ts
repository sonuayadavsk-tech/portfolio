import mongoose, { Schema, Document } from "mongoose";

interface IProject {
  _id?: string;
  name: string;
  description: string;
  skills: string[];
  link?: string;
  github?: string;
  image?: string;
  githubData?: {
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
  };
}

interface IExperience {
  _id?: string;
  company: string;
  role: string;
  description: string;
  duration: string;
  skills: string[];
  progressCardImage?: string;
}

interface ISkillCategory {
  title: string;
  skills: string[];
}

interface IPortfolio extends Document {
  bio: string;
  title?: string; // e.g., "Full Stack Developer"
  tagline?: string; // e.g., "Crafting Digital Experiences"
  stats?: Array<{ label: string; value: string }>;
  profileImage?: string;
  skills: string[];
  skillCategories?: ISkillCategory[];
  projects: IProject[];
  achievements?: Array<{
    title: string;
    issuer: string;
    date: string;
    description?: string;
    link?: string;
    image?: string;
  }>;
  experience: IExperience[];
  resumeUrl?: string;
  contact: {
    email?: string;
    phone?: string;
    location?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  updatedAt: Date;
}

const PortfolioSchema = new Schema<IPortfolio>(
  {
    bio: { type: String, required: true },
    title: String, // e.g., "Full Stack Developer"
    tagline: String, // e.g., "Crafting Digital Experiences"
    stats: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    profileImage: String,
    skills: [String],
    skillCategories: [
      {
        title: String,
        skills: [String],
      },
    ],
    resumeUrl: String,
    achievements: [
      {
        title: { type: String, required: true },
        issuer: { type: String, required: true },
        date: String,
        description: String,
        link: String,
        image: String,
      },
    ],
    projects: [
      {
        name: { type: String, required: true },
        description: { type: String, required: true },
        skills: [String],
        link: String,
        github: String,
        image: String,
        githubData: {
          owner: String,
          repo: String,
          url: String,
          description: String,
          language: String,
          stars: Number,
          topics: [String],
          readme: String,
          packageJson: {
            name: String,
            version: String,
            description: String,
            dependencies: Object,
            devDependencies: Object,
          },
          technologies: [String],
          fetchedAt: Date,
        },
      },
    ],
    experience: [
      {
        company: { type: String, required: true },
        role: { type: String, required: true },
        description: { type: String, required: true },
        duration: { type: String, required: true },
        skills: [String],
        progressCardImage: String,
        link: String,
      },
    ],
    contact: {
      email: String,
      phone: String,
      location: String,
      github: String,
      linkedin: String,
      twitter: String,
    },
  },
  { timestamps: true }
);

const Portfolio = mongoose.model<IPortfolio>("Portfolio", PortfolioSchema);

export default Portfolio;
