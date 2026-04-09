import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useEffect, useState } from "react";
import { ExternalLink, Github } from "lucide-react";

interface Project {
  _id?: string;
  name: string;
  description: string;
  skills: string[];
  link?: string;
  github?: string;
  image?: string;
}

interface ProjectsData {
  projects?: Project[];
}

const defaultProjects = [
  {
    name: "Career Hub",
    description:
      "Full-stack career platform with AI-powered resume analysis and interview practice using Gemini API. Features JWT authentication, role-based access, and scalable backend APIs.",
    skills: ["Next.js", "React.js", "Node.js", "Express.js", "MongoDB", "Gemini API"],
    link: "#",
    github: "#",
  },
  {
    name: "ERP System",
    description:
      "Enterprise Resource Planning system with role-based access control, user management, inventory tracking, and reporting modules. Built with TypeScript for type safety.",
    skills: ["MERN Stack", "TypeScript", "Tailwind CSS"],
    link: "#",
    github: "#",
  },
];

const gradients = ["from-primary/20 to-accent/20", "from-accent/20 to-primary/20"];

const ProjectsSection = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  const [projects, setProjects] = useState<Project[]>(defaultProjects);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        console.log("📡 Fetching projects from:", apiUrl);
        const response = await fetch(`${apiUrl}/api/portfolio`);
        if (!response.ok) throw new Error("API error");
        const data: ProjectsData = await response.json();
        
        console.log("✅ Projects data received:", data.projects);
        
        // Update with fetched projects if available, otherwise keep defaults
        if (data.projects && data.projects.length > 0) {
          const mappedProjects = data.projects.map((p) => ({
            name: p.name || "",
            description: p.description || "",
            skills: p.skills || [],
            link: p.link || "#",
            github: p.github || "#",
          }));
          console.log("📊 Updating projects with:", mappedProjects);
          setProjects(mappedProjects);
        }
      } catch (error) {
        console.error("❌ Failed to fetch projects:", error);
        setProjects(defaultProjects);
      }
    };

    fetchProjects();
    const interval = setInterval(fetchProjects, 5000);
    return () => clearInterval(interval);
  }, []);

  console.log("🔍 Current projects state:", projects);

  return (
    <section id="projects" className="py-32 relative overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-20">
          <source src="https://res.cloudinary.com/dla0brxmi/video/upload/v1775728280/132212-752685110_medium_jakqvk.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/85" />
      </div>
      <div ref={ref} className="relative z-10 container mx-auto px-6">
        <div className="text-center mb-16">
          <p className={`text-primary font-body text-sm tracking-[0.2em] uppercase mb-3 ${isVisible ? "animate-fade-up" : "opacity-0"}`}>
            Portfolio
          </p>
          <h2 className={`font-heading text-4xl md:text-5xl font-bold ${isVisible ? "animate-fade-up stagger-1" : "opacity-0"}`}>
            Featured <span className="text-gradient-primary">Projects</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {projects && projects.length > 0 ? (
            projects.map((project, i) => (
              <div
                key={project.name}
                className={`group relative rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-500 ${
                  isVisible ? `animate-scale-in stagger-${i + 2}` : "opacity-0"
                }`}
              >
                {/* Gradient top */}
                <div className={`h-48 bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center`}>
                  <h3 className="font-heading text-3xl font-bold text-foreground text-center px-4">{project.name}</h3>
                </div>

                <div className="p-6 bg-card">
                  <p className="font-body text-muted-foreground text-sm leading-relaxed mb-5">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {project.skills.map((t) => (
                      <span key={t} className="text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    {project.github && project.github !== "#" && (
                      <a href={project.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Github size={16} /> Code
                      </a>
                    )}
                    {project.link && project.link !== "#" && (
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <ExternalLink size={16} /> Live
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              <p>No projects yet. Add some in the admin dashboard!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
