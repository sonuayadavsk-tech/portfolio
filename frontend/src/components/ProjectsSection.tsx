import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Github } from "lucide-react";
import "./ProjectsSection.css";

const ROTATE_MS = 5500;
const PORTFOLIO_PROJECTS_STORAGE_KEY = "portfolio_projects_refresh";

interface Project {
  _id?: string;
  title?: string;
  name?: string;
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/portfolio`, { cache: "no-store" });
      const data: Portfolio = await response.json();
      if (Array.isArray(data.projects)) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void fetchProjects();
    };
    const onFocus = () => void fetchProjects();
    const onStorage = (e: StorageEvent) => {
      if (e.key === PORTFOLIO_PROJECTS_STORAGE_KEY) void fetchProjects();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
  }, [fetchProjects]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void fetchProjects();
    }, 45000);
    return () => clearInterval(id);
  }, [fetchProjects]);

  const slides = useMemo(
    () =>
      projects.length > 0
        ? projects
        : (defaultProjects as unknown as Project[]),
    [projects]
  );

  useEffect(() => {
    if (slides.length <= 1) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    if (isPaused) return;

    const id = window.setInterval(() => {
      setCurrentIndex((i) => (i + 1) % slides.length);
    }, ROTATE_MS);

    return () => window.clearInterval(id);
  }, [slides.length, isPaused]);

  useEffect(() => {
    setCurrentIndex((i) => (slides.length === 0 ? 0 : Math.min(i, slides.length - 1)));
  }, [slides.length]);

  const goPrev = () => {
    if (slides.length <= 1) return;
    setCurrentIndex((i) => (i - 1 + slides.length) % slides.length);
  };

  const goNext = () => {
    if (slides.length <= 1) return;
    setCurrentIndex((i) => (i + 1) % slides.length);
  };

  const renderProjectCard = (
    project: {
      _id?: string;
      title: string;
      description: string;
      skills?: string[];
      link?: string;
      github?: string;
      image?: string;
      tech?: string[];
      subtitle?: string;
    },
    _idx: number
  ) => {
    const tags = project.skills || project.tech || [];
    const displayTitle = project.title || project.name || "Project";
    const projectImage =
      project.image ||
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80";

    return (
      <article
        key={project._id || displayTitle}
        className={`group laptop-project-card projects-carousel-slide ${isVisible ? "animate-scale-in stagger-2" : "opacity-0"}`}
      >
        <div className="desktop-setup">
          <div className="desktop-monitor">
            <div className="desktop-monitor-body">
              <div
                className="screen-wallpaper"
                style={{ backgroundImage: `url("${projectImage}")` }}
                aria-label={`${displayTitle} preview`}
              />
              <div className="screen-overlay">
                <h3>{displayTitle}</h3>
                <p>{project.subtitle || "Project Preview"}</p>
              </div>
            </div>
          </div>

          <div className="desktop-stand" />

          <div className="desktop-desk">
            <div className="desktop-keyboard" />
            <div className="desktop-mouse" />
          </div>
        </div>

        <div className="project-meta">
          <h4 className="font-heading text-lg font-semibold mb-2">{displayTitle}</h4>
          <p className="project-description font-body text-muted-foreground text-sm md:text-base leading-relaxed mb-5">
            {project.description}
          </p>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {tags.map((tag) => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}

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
      </article>
    );
  };

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

        <div
          className="projects-carousel max-w-6xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onKeyDown={(e) => {
            if (slides.length <= 1) return;
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              goPrev();
            } else if (e.key === "ArrowRight") {
              e.preventDefault();
              goNext();
            }
          }}
          role="region"
          aria-roledescription="carousel"
          aria-label="Featured projects"
          tabIndex={0}
        >
          {slides.length > 0 && (
            <>
              <div className="projects-carousel-row">
                {slides.length > 1 && (
                  <button
                    type="button"
                    className="projects-carousel-arrow"
                    onClick={goPrev}
                    aria-label="Previous project"
                  >
                    <ChevronLeft size={28} strokeWidth={2} />
                  </button>
                )}
                <div className="projects-carousel-main">
                  <div
                    className="projects-carousel-viewport"
                    key={slides[currentIndex]?._id || slides[currentIndex]?.title || slides[currentIndex]?.name || currentIndex}
                  >
                    {renderProjectCard(slides[currentIndex] as any, currentIndex)}
                  </div>
                  {slides.length > 1 && (
                    <div className="projects-carousel-dots" role="tablist" aria-label="Project slides">
                      {slides.map((p, i) => (
                        <button
                          key={p._id || `${p.title || p.name}-${i}`}
                          type="button"
                          role="tab"
                          aria-selected={i === currentIndex}
                          aria-label={`Show project ${i + 1}: ${p.title || p.name || "Project"}`}
                          className={`projects-carousel-dot ${i === currentIndex ? "active" : ""}`}
                          onClick={() => setCurrentIndex(i)}
                        />
                      ))}
                    </div>
                  )}
                  {slides.length > 1 && (
                    <p className="text-center text-xs text-muted-foreground mt-3">
                      {isPaused ? "Paused — move cursor away to resume" : "Auto-rotating — hover to pause"}
                    </p>
                  )}
                </div>
                {slides.length > 1 && (
                  <button
                    type="button"
                    className="projects-carousel-arrow"
                    onClick={goNext}
                    aria-label="Next project"
                  >
                    <ChevronRight size={28} strokeWidth={2} />
                  </button>
                )}
              </div>
            </>
          )}
          {!loading && slides.length === 0 && (
            <p className="text-center text-muted-foreground">No projects to show yet.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
