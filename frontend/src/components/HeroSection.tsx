import { useEffect, useState } from "react";
import { ArrowDown, Github, Linkedin, Mail } from "lucide-react";

const HeroSection = () => {
  const [loaded, setLoaded] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  useEffect(() => {
    setLoaded(true);
    fetchResumeUrl();
  }, []);

  const fetchResumeUrl = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/portfolio`);
      const data = await response.json();
      if (data.resumeUrl) {
        setResumeUrl(data.resumeUrl);
      }
    } catch (e) {
      console.error(e);
    }
  };

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
              Full Stack Developer
            </p>
            <h1 className="animate-fade-up stagger-2 font-heading text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              Hi, I'm{" "}
              <span className="text-gradient-primary glow-text">Sonu Yadav</span>
            </h1>
            <p className="animate-fade-up stagger-3 font-body text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Building scalable web applications with modern technologies.
              Passionate about clean code, cloud solutions & creating impact.
            </p>

            {resumeUrl && (
              <div className="animate-fade-up stagger-3 mb-8">
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3 rounded-full bg-transparent border border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300 tracking-wide text-sm"
                >
                  View Resume
                </a>
              </div>
            )}

            <div className="animate-fade-up stagger-4 flex items-center justify-center gap-4 mb-16">
              <a
                href="https://github.com/Sonusk4"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full border border-border hover:border-primary hover:text-primary transition-all duration-300 text-muted-foreground"
              >
                <Github size={20} />
              </a>
              <a
                href="https://linkedin.com/in/sonu-yadav-b1272a269"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full border border-border hover:border-primary hover:text-primary transition-all duration-300 text-muted-foreground"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="mailto:Sonuskyadav30@gmail.com"
                className="p-3 rounded-full border border-border hover:border-primary hover:text-primary transition-all duration-300 text-muted-foreground"
              >
                <Mail size={20} />
              </a>
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
