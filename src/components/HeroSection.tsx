import { useEffect, useState } from "react";
import { ArrowDown, Github, Linkedin, Mail } from "lucide-react";

interface ContactData {
  email?: string;
  linkedin?: string;
  github?: string;
}

interface PortfolioData {
  title?: string;
  bio?: string;
  contact?: ContactData;
}

const HeroSection = () => {
  const [loaded, setLoaded] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioData>({
    title: "Full Stack Developer",
    bio: "Building scalable web applications with modern technologies. Passionate about clean code, cloud solutions & creating impact.",
    contact: {
      github: "https://github.com/Sonusk4",
      linkedin: "https://linkedin.com/in/sonu-yadav-b1272a269",
      email: "Sonuskyadav30@gmail.com",
    },
  });

  useEffect(() => {
    setLoaded(true);
  }, []);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const response = await fetch(`${apiUrl}/api/portfolio`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data: PortfolioData = await response.json();
        setPortfolio(data);
      } catch (error) {
        console.error("❌ Failed to fetch portfolio:", error);
      }
    };

    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source
            src="https://res.cloudinary.com/dla0brxmi/video/upload/v1775712523/3260-167695252_dqqadp.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 bg-background/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        {loaded && (
          <>
            <p className="animate-fade-up stagger-1 font-body text-sm tracking-[0.3em] uppercase text-primary mb-6">
              {portfolio.title || "Full Stack Developer"}
            </p>
            <h1 className="animate-fade-up stagger-2 font-heading text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              Hi, I'm{" "}
              <span className="text-gradient-primary glow-text">Sonu Yadav</span>
            </h1>
            <p className="animate-fade-up stagger-3 font-body text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              {portfolio.bio || "Building scalable web applications with modern technologies. Passionate about clean code, cloud solutions & creating impact."}
            </p>

            <div className="animate-fade-up stagger-4 flex items-center justify-center gap-4 mb-16">
              {portfolio.contact?.github && (
                <a
                  href={portfolio.contact.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full border border-border hover:border-primary hover:text-primary transition-all duration-300 text-muted-foreground"
                >
                  <Github size={20} />
                </a>
              )}
              {portfolio.contact?.linkedin && (
                <a
                  href={portfolio.contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full border border-border hover:border-primary hover:text-primary transition-all duration-300 text-muted-foreground"
                >
                  <Linkedin size={20} />
                </a>
              )}
              {portfolio.contact?.email && (
                <a
                  href={`mailto:${portfolio.contact.email}`}
                  className="p-3 rounded-full border border-border hover:border-primary hover:text-primary transition-all duration-300 text-muted-foreground"
                >
                  <Mail size={20} />
                </a>
              )}
            </div>

            <a
              href="#about"
              className="animate-fade-up stagger-5 inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors animate-float"
            >
              <ArrowDown size={20} />
            </a>
          </>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
