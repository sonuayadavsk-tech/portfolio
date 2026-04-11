import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useEffect, useState, useCallback } from "react";
import { Award, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import "./CertificatesSection.css";

const ROTATE_MS = 6000;

interface Achievement {
    _id?: string;
    title: string;
    issuer: string;
    date: string;
    description?: string;
    link?: string;
    image?: string;
}

const CertificatesSection = () => {
    const { ref, isVisible } = useScrollAnimation(0.1);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const fetchAchievements = useCallback(async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const response = await fetch(`${apiUrl}/api/portfolio`);
            const data = await response.json();
            if (data.achievements && data.achievements.length > 0) {
                setAchievements(data.achievements);
            }
        } catch (error) {
            console.error("Failed to fetch achievements:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAchievements();
    }, [fetchAchievements]);

    // Carousel Logic
    const goPrev = useCallback(() => {
        if (achievements.length <= 1) return;
        setCurrentIndex((i) => (i - 1 + achievements.length) % achievements.length);
    }, [achievements.length]);

    const goNext = useCallback(() => {
        if (achievements.length <= 1) return;
        setCurrentIndex((i) => (i + 1) % achievements.length);
    }, [achievements.length]);

    useEffect(() => {
        if (achievements.length <= 1 || isPaused) return;
        const id = setInterval(goNext, ROTATE_MS);
        return () => clearInterval(id);
    }, [achievements.length, isPaused, goNext]);

    if (!loading && achievements.length === 0) {
        return null;
    }

    const currentAch = achievements[currentIndex];

    return (
        <section id="certificates" className="py-24 relative overflow-hidden">
            {/* Image Background */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://res.cloudinary.com/dentbtrzb/image/upload/v1775812288/luis-vasconcelos-wxj729MaPRY-unsplash_b4zzvn.jpg"
                    alt="Background"
                    className="w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-background/85" />
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none z-0" />

            <div ref={ref} className="relative z-10 container mx-auto px-6 max-w-6xl">
                <div className="text-center mb-16">
                    <p className={`text-primary font-body text-sm tracking-[0.2em] uppercase mb-3 ${isVisible ? "animate-fade-up" : "opacity-0"}`}>
                        Awards & Recognitions
                    </p>
                    <h2 className={`font-heading text-4xl md:text-5xl font-bold ${isVisible ? "animate-fade-up stagger-1" : "opacity-0"}`}>
                        Certificates & <span className="text-gradient-primary">Achievements</span>
                    </h2>
                </div>

                <div
                    className="certificate-carousel mx-auto"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <div className="certificate-carousel-row">
                        {achievements.length > 1 && (
                            <button className="certificate-carousel-arrow hidden md:grid" onClick={goPrev} aria-label="Previous">
                                <ChevronLeft size={24} />
                            </button>
                        )}

                        <div className="certificate-carousel-main">
                            <div className="certificate-carousel-viewport" key={currentIndex}>
                                {currentAch && (
                                    <div className={`certificate-card group relative ${isVisible ? "animate-fade-up" : "opacity-0"}`}>
                                        <div className="certificate-card-inner">
                                            {currentAch.image ? (
                                                <div className="certificate-image-container">
                                                    <img
                                                        src={currentAch.image}
                                                        alt={currentAch.title}
                                                        className="certificate-image"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="certificate-image-container flex items-center justify-center">
                                                    <Award size={40} className="text-primary/50" />
                                                </div>
                                            )}

                                            <div className="certificate-details">
                                                <h3 className="font-heading text-xl font-bold group-hover:text-primary transition-colors">
                                                    {currentAch.title}
                                                </h3>
                                                <p className="text-sm font-medium text-primary/80 mb-2">{currentAch.issuer}</p>
                                                {currentAch.date && (
                                                    <p className="text-xs text-muted-foreground mb-4">📅 {currentAch.date}</p>
                                                )}
                                                {currentAch.description && (
                                                    <p className="text-sm text-muted-foreground font-body line-clamp-3 mb-4">
                                                        {currentAch.description}
                                                    </p>
                                                )}
                                                {currentAch.link && (
                                                    <a
                                                        href={currentAch.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium mt-auto"
                                                    >
                                                        View Link <ExternalLink size={14} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {achievements.length > 1 && (
                            <button className="certificate-carousel-arrow hidden md:grid" onClick={goNext} aria-label="Next">
                                <ChevronRight size={24} />
                            </button>
                        )}
                    </div>

                    {achievements.length > 1 && (
                        <div className="certificate-carousel-dots">
                            {achievements.map((_, i) => (
                                <button
                                    key={i}
                                    className={`certificate-carousel-dot ${i === currentIndex ? "active" : ""}`}
                                    onClick={() => setCurrentIndex(i)}
                                    aria-label={`Go to slide ${i + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CertificatesSection;
