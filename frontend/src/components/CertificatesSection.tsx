import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useEffect, useState } from "react";
import { Award, ExternalLink } from "lucide-react";

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

    useEffect(() => {
        fetchAchievements();
    }, []);

    const fetchAchievements = async () => {
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
    };

    if (!loading && achievements.length === 0) {
        return null; // hide section if no certificates
    }

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

            {/* Background decoration */}
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {achievements.map((ach, i) => (
                        <div
                            key={ach._id || i}
                            className={`project-card group rounded-2xl overflow-hidden glass-card transition-all duration-300 relative ${isVisible ? `animate-fade-up stagger-${(i % 5) + 2}` : "opacity-0"
                                }`}
                        >
                            {ach.image ? (
                                <div className="relative h-48 overflow-hidden bg-muted">
                                    <img
                                        src={ach.image}
                                        alt={ach.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {ach.link && (
                                        <a
                                            href={ach.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="absolute top-4 right-4 p-2 bg-background/80 hover:bg-primary hover:text-white backdrop-blur-sm rounded-full transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                                        >
                                            <ExternalLink size={18} />
                                        </a>
                                    )}
                                </div>
                            ) : (
                                <div className="relative h-32 overflow-hidden bg-primary/10 flex items-center justify-center">
                                    <Award size={40} className="text-primary/50" />
                                    {ach.link && (
                                        <a
                                            href={ach.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="absolute top-4 right-4 p-2 bg-background/80 hover:bg-primary hover:text-white backdrop-blur-sm rounded-full transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                                        >
                                            <ExternalLink size={18} />
                                        </a>
                                    )}
                                </div>
                            )}

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-heading text-xl font-bold group-hover:text-primary transition-colors">
                                        {ach.title}
                                    </h3>
                                </div>
                                <p className="text-sm font-medium text-primary/80 mb-2">{ach.issuer}</p>
                                {ach.date && (
                                    <p className="text-xs text-muted-foreground mb-4">📅 {ach.date}</p>
                                )}
                                {ach.description && (
                                    <p className="text-sm text-muted-foreground font-body line-clamp-3 mb-4">
                                        {ach.description}
                                    </p>
                                )}
                                {ach.link && (
                                    <a
                                        href={ach.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium mt-auto"
                                    >
                                        View Certificate <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CertificatesSection;
