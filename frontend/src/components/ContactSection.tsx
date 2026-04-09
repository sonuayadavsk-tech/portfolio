import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Mail, MapPin, Phone, Send } from "lucide-react";

const ContactSection = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <section id="contact" className="py-32 relative overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-20">
          <source src="https://res.cloudinary.com/dla0brxmi/video/upload/v1775728807/127487-738466726_kmdj9v.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/85" />
      </div>
      <div ref={ref} className="relative z-10 container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <p className={`text-primary font-body text-sm tracking-[0.2em] uppercase mb-3 ${isVisible ? "animate-fade-up" : "opacity-0"}`}>
            Get In Touch
          </p>
          <h2 className={`font-heading text-4xl md:text-5xl font-bold ${isVisible ? "animate-fade-up stagger-1" : "opacity-0"}`}>
            Let's <span className="text-gradient-primary">Connect</span>
          </h2>
        </div>

        <div className={`grid md:grid-cols-3 gap-6 ${isVisible ? "animate-fade-up stagger-2" : "opacity-0"}`}>
          {[
            { icon: Mail, label: "Email", value: "Sonuskyadav30@gmail.com", href: "mailto:Sonuskyadav30@gmail.com" },
            { icon: Phone, label: "Phone", value: "+91-6363742403", href: "tel:+916363742403" },
            { icon: MapPin, label: "Location", value: "Belagavi, Karnataka", href: "#" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 text-center hover:glow-primary"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <item.icon size={20} className="text-primary" />
              </div>
              <p className="font-heading text-sm font-semibold mb-1">{item.label}</p>
              <p className="font-body text-xs text-muted-foreground">{item.value}</p>
            </a>
          ))}
        </div>

        <div className={`mt-12 text-center ${isVisible ? "animate-fade-up stagger-3" : "opacity-0"}`}>
          <a
            href="mailto:Sonuskyadav30@gmail.com"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground font-heading font-semibold text-sm hover:opacity-90 transition-opacity glow-primary"
          >
            <Send size={16} /> Say Hello
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
