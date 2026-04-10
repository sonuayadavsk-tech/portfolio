import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useEffect, useState } from "react";
import { Briefcase, GraduationCap, BookOpen } from "lucide-react";

interface Experience {
  role?: string;
  company?: string;
  duration?: string;
  description?: string;
  skills?: string[];
  progressCardImage?: string;
  link?: string;
  // Additional fields for compatibility
  title?: string;
  org?: string;
  period?: string;
  points?: string[];
}

interface Portfolio {
  experience?: Experience[];
}

const defaultTimeline = [
  {
    icon: Briefcase,
    title: "Web Development Intern",
    org: "Madhwa Infotech (Remote)",
    period: "Sep 2025 – Dec 2025",
    points: [
      "Developed responsive web apps with React.js & Node.js",
      "Implemented backend APIs using Express.js",
      "Collaborated in Agile teams with Git workflows",
    ],
  },
  {
    icon: Briefcase,
    title: "Cloud Intern",
    org: "Softmusk Pvt Ltd, Belagavi",
    period: "Jun 2024 – Aug 2024",
    points: [
      "Deployed cloud instances on AWS & DigitalOcean",
      "Configured Linux VMs, networking & DNS",
      "Managed cloud monitoring & security practices",
    ],
  },
  {
    icon: BookOpen,
    title: "IEEE Publication",
    org: "NKCon 2025, Hubballi",
    period: "2025",
    points: [
      "Agentic AI in Action: Multi-Agent Systems review",
      "DOI: 10.1109/NKCon66957.2025.11345772",
    ],
  },
  {
    icon: GraduationCap,
    title: "B.Tech in CSE",
    org: "Jain College of Engineering, Belagavi",
    period: "Dec 2022 – Jun 2026",
    points: ["CGPA: 8.3 / 10"],
  },
];

const ExperienceSection = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExperience();
  }, []);

  const fetchExperience = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/portfolio`);
      const data: Portfolio = await response.json();
      if (data.experience && data.experience.length > 0) {
        setExperience(data.experience);
      }
    } catch (error) {
      console.error("Failed to fetch experience:", error);
    } finally {
      setLoading(false);
    }
  };

  const displayExperience = experience.length > 0 ? experience : [];

  return (
    <section id="experience" className="py-32 relative overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-20">
          <source src="https://res.cloudinary.com/dla0brxmi/video/upload/v1775728280/132210-752685101_medium_dfp5ue.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/85" />
      </div>
      <div ref={ref} className="relative z-10 container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-16">
          <p className={`text-primary font-body text-sm tracking-[0.2em] uppercase mb-3 ${isVisible ? "animate-fade-up" : "opacity-0"}`}>
            Journey
          </p>
          <h2 className={`font-heading text-4xl md:text-5xl font-bold ${isVisible ? "animate-fade-up stagger-1" : "opacity-0"}`}>
            Experience & <span className="text-gradient-primary">Education</span>
          </h2>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-10">
            {displayExperience.length > 0
              ? displayExperience.map((item, i) => (
                <div
                  key={`${item.role || item.title}-${i}`}
                  className={`relative pl-16 ${isVisible ? `animate-fade-up stagger-${(i % 10) + 2}` : "opacity-0"}`}
                >
                  {/* Icon */}
                  <div className="absolute left-0 w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center">
                    <Briefcase size={20} className="text-primary" />
                  </div>

                  <div className="p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                      <h3 className="font-heading text-lg font-semibold">{item.role || item.title}</h3>
                      <span className="text-xs text-primary font-body">{item.duration || item.period}</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-muted-foreground font-body">{item.company || item.org}</p>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          Visit <BookOpen size={12} />
                        </a>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground font-body mb-3">{item.description}</p>
                    )}
                    {item.skills && item.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.skills.map((skill) => (
                          <span
                            key={skill}
                            className="text-xs px-2.5 py-1 rounded-full border border-primary/30 text-primary"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.progressCardImage && (
                      <div className="mt-4 rounded-xl overflow-hidden border border-border">
                        <img
                          src={item.progressCardImage}
                          alt={`${item.role || item.title} progress`}
                          className="w-full h-48 md:h-64 object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))
              : defaultTimeline.map((item, i) => (
                <div
                  key={item.title + item.org}
                  className={`relative pl-16 ${isVisible ? `animate-fade-up stagger-${i + 2}` : "opacity-0"}`}
                >
                  {/* Icon */}
                  <div className="absolute left-0 w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center">
                    <item.icon size={20} className="text-primary" />
                  </div>

                  <div className="p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                      <h3 className="font-heading text-lg font-semibold">{item.title}</h3>
                      <span className="text-xs text-primary font-body">{item.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-body mb-3">{item.org}</p>
                    <ul className="space-y-1.5">
                      {item.points.map((pt) => (
                        <li key={pt} className="text-sm text-muted-foreground font-body flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-primary mt-2 shrink-0" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
