import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useEffect, useState } from "react";
import { ExternalLink, Github } from "lucide-react";

interface Project {
  _id?: string;
  title: string;
  description: string;
  skills?: string[];
  link?: string;
  github?: string;
  image?: string;
}

interface Portfolio {
  projects?: Project[];
}

const defaultProjects = [
  {
    title: "Career Hub",
    subtitle: "AI-Powered Career Platform",
    description:
      "Full-stack career platform with AI-powered resume analysis and interview practice using Gemini API. Features JWT authentication, role-based access, and scalable backend APIs.",
    tech: ["Next.js", "React.js", "Node.js", "Express.js", "MongoDB", "Gemini API"],
    gradient: "from-primary/20 to-accent/20",
  },
  {
    title: "ERP System",
    subtitle: "Enterprise Resource Planning",
    description:
      "Enterprise Resource Planning system with role-based access control, user management, inventory tracking, and reporting modules. Built with TypeScript for type safety.",
    tech: ["MERN Stack", "TypeScript", "Tailwind CSS"],
    gradient: "from-accent/20 to-primary/20",
  },
];

const ProjectsSection = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/portfolio`);
      const data: Portfolio = await response.json();
      if (data.projects && data.projects.length > 0) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const displayProjects = projects.length > 0 ? projects : [];

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
          {displayProjects.length > 0
            ? displayProjects.map((project, i) => (
                <div
                  key={project._id || project.title}
                  className={`group relative rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-500 ${
                    isVisible ? `animate-scale-in stagger-${i + 2}` : "opacity-0"
                  }`}
                >
                  {/* Image or Gradient */}
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    {project.image ? (
                      <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                    ) : (
                      <h3 className="font-heading text-3xl font-bold text-foreground text-center px-4">{project.title}</h3>
                    )}
                  </div>

                  <div className="p-6 bg-card">
                    <h4 className="font-heading text-lg font-semibold mb-2">{project.title}</h4>
                    <p className="font-body text-muted-foreground text-sm leading-relaxed mb-5">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {project.skills?.map((tech) => (
                        <span key={tech} className="text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      {project.github && (
                        <a href={project.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                          <Github size={16} /> Code
                        </a>
                      )}
                      {project.link && (
                        <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                          <ExternalLink size={16} /> Live
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            : defaultProjects.map((project, i) => (
                <div
                  key={project.title}
                  className={`group relative rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-500 ${
                    isVisible ? `animate-scale-in stagger-${i + 2}` : "opacity-0"
                  }`}
                >
                  {/* Gradient top */}
                  <div className={`h-48 bg-gradient-to-br ${project.gradient} flex items-center justify-center`}>
                    <h3 className="font-heading text-3xl font-bold text-foreground">{project.title}</h3>
                  </div>

                  <div className="p-6 bg-card">
                    <p className="text-primary font-body text-sm mb-2">{project.subtitle}</p>
                    <p className="font-body text-muted-foreground text-sm leading-relaxed mb-5">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {project.tech.map((t) => (
                        <span key={t} className="text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <a href="#" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Github size={16} /> Code
                      </a>
                      <a href="#" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <ExternalLink size={16} /> Live
                      </a>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
