import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useEffect, useState } from "react";
import { Code2, Database, Cloud, Wrench } from "lucide-react";

const defaultSkillCategories = [
  {
    icon: Code2,
    title: "Languages & Web",
    skills: ["JavaScript", "Java (OOP)", "HTML", "CSS", "React.js", "Next.js", "TypeScript"],
  },
  {
    icon: Database,
    title: "Backend & Database",
    skills: ["Node.js", "Express.js", "MongoDB", "PostgreSQL", "REST APIs", "SQL"],
  },
  {
    icon: Cloud,
    title: "Cloud & DevOps",
    skills: ["AWS", "DigitalOcean", "Linux", "DNS", "Cloud Monitoring"],
  },
  {
    icon: Wrench,
    title: "Tools & Practices",
    skills: ["Git", "GitHub", "Postman", "VS Code", "Agile", "JWT Auth"],
  },
];

interface Portfolio {
  skills?: string[];
}

const SkillsSection = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/portfolio`);
      const data: Portfolio = await response.json();
      if (data.skills && data.skills.length > 0) {
        setSkills(data.skills);
      }
    } catch (error) {
      console.error("Failed to fetch skills:", error);
    } finally {
      setLoading(false);
    }
  };

  // Use dynamic skills if available, otherwise use default categories
  const displaySkills = skills.length > 0 ? skills : [];
  const skillCategories = displaySkills.length > 0
    ? defaultSkillCategories.map(cat => ({
      ...cat,
      skills: displaySkills
    }))
    : defaultSkillCategories;

  return (
    <section id="skills" className="py-32 relative overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-40">
          <source src="https://res.cloudinary.com/dentbtrzb/video/upload/v1775814872/201779-916357991_q6xqmf.mp4" type="video/mp4" />
        </video>
        {/* Cinematic blend: Subdued blackish-red top gradient to match the flow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0505]/30 via-background/85 to-background/90" />
      </div>
      <div ref={ref} className="relative z-10 container mx-auto px-6">
        <div className="text-center mb-16">
          <p className={`text-primary font-body text-sm tracking-[0.2em] uppercase mb-3 ${isVisible ? "animate-fade-up" : "opacity-0"}`}>
            Expertise
          </p>
          <h2 className={`font-heading text-4xl md:text-5xl font-bold ${isVisible ? "animate-fade-up stagger-1" : "opacity-0"}`}>
            Technical <span className="text-gradient-primary">Skills</span>
          </h2>
        </div>

        {displaySkills.length > 0 ? (
          // Display skills as a flat grid when fetched from backend
          <div className="flex flex-wrap gap-3 justify-center">
            {displaySkills.map((skill, i) => (
              <span
                key={skill}
                className={`text-sm font-body px-4 py-2 rounded-full bg-secondary text-secondary-foreground border border-primary/20 hover:border-primary/50 transition-all ${isVisible ? `animate-fade-up stagger-${(i % 10) + 2}` : "opacity-0"
                  }`}
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          // Display default categorized skills
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {skillCategories.map((cat, i) => (
              <div
                key={cat.title}
                className={`group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-500 hover:glow-primary ${isVisible ? `animate-fade-up stagger-${i + 2}` : "opacity-0"
                  }`}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <cat.icon size={24} className="text-primary" />
                </div>
                <h3 className="font-heading text-lg font-semibold mb-4">{cat.title}</h3>
                <div className="flex flex-wrap gap-2">
                  {cat.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs font-body px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SkillsSection;
