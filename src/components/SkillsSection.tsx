import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useEffect, useState } from "react";
import { Code2, Database, Cloud, Wrench } from "lucide-react";

interface SkillsData {
  skills?: string[];
  skillCategories?: Array<{
    title: string;
    skills: string[];
  }>;
}

interface SkillCategory {
  icon: any;
  title: string;
  skills: string[];
}

const iconMap: { [key: string]: any } = {
  "Languages & Web": Code2,
  "Backend & Database": Database,
  "Cloud & DevOps": Cloud,
  "Tools & Practices": Wrench,
};

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

const SkillsSection = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  const [skillCategories, setSkillCategories] = useState(defaultSkillCategories);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        console.log("📡 Fetching skills from:", apiUrl);
        const response = await fetch(`${apiUrl}/api/portfolio`);
        const data: SkillsData = await response.json();
        
        console.log("✅ Data received:", data);
        
        // If skillCategories exist in API response, use them directly
        if (data.skillCategories && Array.isArray(data.skillCategories) && data.skillCategories.length > 0) {
          console.log("📊 Using categorized skills from DB:", data.skillCategories);
          const categorized = data.skillCategories.map((cat: any) => ({
            icon: iconMap[cat.title] || Wrench,
            title: cat.title,
            skills: cat.skills,
          }));
          setSkillCategories(categorized);
        } else if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
          // Fallback: organize flat array into categories based on keywords
          console.log("✅ Skills data received, organizing:", data.skills);
          const organized = [
            {
              icon: Code2,
              title: "Languages & Web",
              skills: data.skills.filter(s => /javascript|typescript|react|next|html|css|java/i.test(s)),
            },
            {
              icon: Database,
              title: "Backend & Database",
              skills: data.skills.filter(s => /node|express|mongodb|postgres|sql|api|rest/i.test(s)),
            },
            {
              icon: Cloud,
              title: "Cloud & DevOps",
              skills: data.skills.filter(s => /aws|digitalocean|linux|docker|devops|cloud|dns/i.test(s)),
            },
            {
              icon: Wrench,
              title: "Tools & Practices",
              skills: data.skills.filter(s => !/javascript|typescript|react|next|html|css|java|node|express|mongodb|postgres|sql|api|rest|aws|digitalocean|linux|docker|devops|cloud|dns/i.test(s)),
            },
          ].filter(cat => cat.skills.length > 0);
          
          const finalCategories = organized.length > 0 ? organized : defaultSkillCategories;
          console.log("📊 Setting skill categories:", finalCategories);
          setSkillCategories(finalCategories);
        } else {
          console.log("⚠️ No skills found, using defaults");
          setSkillCategories(defaultSkillCategories);
        }
      } catch (error) {
        console.error("❌ Failed to fetch skills:", error);
        setSkillCategories(defaultSkillCategories);
      }
    };

    fetchSkills();
    const interval = setInterval(fetchSkills, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="skills" className="py-32 relative overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-20">
          <source src="https://res.cloudinary.com/dla0brxmi/video/upload/v1775728279/85590-590014592_medium_f3qxlv.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/85" />
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skillCategories.map((cat, i) => (
            <div
              key={cat.title}
              className={`group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-500 hover:glow-primary ${
                isVisible ? `animate-fade-up stagger-${i + 2}` : "opacity-0"
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
      </div>
    </section>
  );
};

export default SkillsSection;
