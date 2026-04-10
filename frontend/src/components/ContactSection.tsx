import { useState, useEffect } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Mail, MapPin, Phone, Send } from "lucide-react";

const ContactSection = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  const [contact, setContact] = useState({
    email: "Sonuskyadav30@gmail.com",
    phone: "+91-6363742403",
    location: "Belagavi, Karnataka",
  });

  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/portfolio`);
      const data = await response.json();
      if (data.contact) {
        setContact({
          email: data.contact.email || contact.email,
          phone: data.contact.phone || contact.phone,
          location: data.contact.location || contact.location,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <section id="contact" className="py-32 relative overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover object-bottom scale-[1.12] opacity-100 [filter:blur(5px)_saturate(1.12)_contrast(1.05)]"
        >
          <source src="https://res.cloudinary.com/dla0brxmi/video/upload/v1775728807/127487-738466726_kmdj9v.mp4" type="video/mp4" />
        </video>
        {/* Slightly darker / black-tinted over video for contrast */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: [
              "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.06) 45%, rgba(0,0,0,0.14) 100%)",
              "linear-gradient(to bottom, hsl(var(--background) / 0.94) 0%, hsl(var(--background) / 0.64) 34%, hsl(var(--background) / 0.4) 58%, hsl(var(--background) / 0.26) 100%)",
            ].join(", "),
          }}
        />
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
            { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
            { icon: Phone, label: "Phone", value: contact.phone, href: `tel:${contact.phone.replace(/[^0-9+]/g, "")}` },
            { icon: MapPin, label: "Location", value: contact.location, href: "#" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="group p-6 rounded-2xl text-center transition-all duration-300
                border border-white/[0.14] bg-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_10px_40px_rgba(0,0,0,0.22)]
                backdrop-blur-xl hover:border-primary/45 hover:bg-white/[0.11] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_14px_48px_rgba(0,0,0,0.28)]"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] backdrop-blur-sm transition-colors group-hover:border-primary/30 group-hover:bg-primary/15">
                <item.icon size={20} className="text-primary" />
              </div>
              <p className="font-heading mb-1 text-sm font-semibold text-foreground/95">{item.label}</p>
              <p className="font-body text-xs text-white/65">{item.value}</p>
            </a>
          ))}
        </div>

        <div className={`mt-12 text-center ${isVisible ? "animate-fade-up stagger-3" : "opacity-0"}`}>
          <a
            href={`mailto:${contact.email}`}
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
