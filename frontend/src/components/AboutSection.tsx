import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useEffect, useState } from "react";
import profileImg from "@/assets/sonu_blazer.jpg";

interface Stat {
  label: string;
  value: string;
}

interface Portfolio {
  bio: string;
  title?: string;
  tagline?: string;
  stats?: Stat[];
  profileImage?: string;
  contact?: {
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
  };
  projects?: any[];
  skills?: string[];
  experience?: any[];
}

const defaultStats: Stat[] = [
  { label: "CGPA", value: "8.3" },
  { label: "Internships", value: "2+" },
  { label: "IEEE Paper", value: "1" },
];

const AboutSection = () => {
  const { ref, isVisible } = useScrollAnimation(0.2);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/portfolio`);
      const data = await response.json();
      setPortfolio(data);
    } catch (error) {
      console.error("Failed to fetch portfolio:", error);
    } finally {
      setLoading(false);
    }
  };

  // Use dynamic data or fallback to defaults
  const displayTitle = portfolio?.title || "Full Stack Developer";
  const displayTagline = portfolio?.tagline || "Crafting Digital Experiences";
  const displayBio = portfolio?.bio || "I'm a Computer Science Engineering undergraduate at Jain College of Engineering, Belagavi with a CGPA of 8.3/10. I specialize in Full Stack Development using the MERN Stack, Next.js, and Cloud Computing with AWS.";
  const profileImage = portfolio?.profileImage || profileImg;
  const displayStats = portfolio?.stats && portfolio.stats.length > 0 ? portfolio.stats : defaultStats;

  return (
    <section id="about" className="relative py-32 overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-30"
        >
          <source
            src="https://res.cloudinary.com/dla0brxmi/video/upload/v1775626314/12681526_3840_2160_30fps_1_eh8njg.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-background/80" />
      </div>

      <div ref={ref} className="relative z-10 container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className={`${isVisible ? "animate-slide-right" : "opacity-0"}`}>
            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl bg-primary/10 blur-2xl" />
              <img
                src={profileImage}
                alt="Sonu Yadav"
                className="relative rounded-2xl w-full max-w-md mx-auto object-cover aspect-square glow-primary"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <p className={`text-primary font-body text-sm tracking-[0.2em] uppercase mb-3 ${isVisible ? "animate-fade-up" : "opacity-0"}`}>
              About Me
            </p>
            <h2 className={`font-heading text-4xl md:text-5xl font-bold mb-6 ${isVisible ? "animate-fade-up stagger-1" : "opacity-0"}`}>
              {displayTagline.split('\n').map((line, i) => (
                <div key={i}>
                  {i === displayTagline.split('\n').length - 1 ? (
                    <span className="text-gradient-primary">{line}</span>
                  ) : (
                    line
                  )}
                </div>
              ))}
            </h2>
            <p className={`text-lg font-semibold text-muted-foreground mb-6 ${isVisible ? "animate-fade-up stagger-2" : "opacity-0"}`}>
              {displayTitle}
            </p>
            <p className={`font-body text-muted-foreground leading-relaxed mb-6 ${isVisible ? "animate-fade-up stagger-2" : "opacity-0"}`}>
              {displayBio}
            </p>

            {portfolio?.bio && (
              <p className={`font-body text-muted-foreground leading-relaxed mb-8 ${isVisible ? "animate-fade-up stagger-3" : "opacity-0"}`}>
                I've published research on Agentic AI at IEEE NKCon 2025 and have hands-on internship experience
                in both web development and cloud infrastructure. I thrive in Agile teams and love building
                products that make a difference.
              </p>
            )}

            <div className={`grid grid-cols-3 gap-6 ${isVisible ? "animate-fade-up stagger-4" : "opacity-0"}`}>
              {displayStats.map((stat) => (
                <div key={stat.label} className="text-center p-4 rounded-xl bg-secondary/50">
                  <div className="font-heading text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="font-body text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
