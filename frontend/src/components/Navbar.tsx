import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Certificates", href: "#certificates" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "glass py-3" : "py-5"
          }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <a href="#home" className="font-heading text-xl font-bold text-gradient-primary">
            SY
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-body text-muted-foreground hover:text-primary transition-colors duration-300"
              >
                {item.label}
              </a>
            ))}
          </div>

          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Backdrop & Content - Floating Box Version */}
      {mobileOpen && (
        <div className="fixed top-20 left-4 right-4 z-[100] md:hidden animate-fade-in overflow-hidden rounded-[2rem] border-2 border-white/10 shadow-2xl">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <img
              src="https://res.cloudinary.com/dentbtrzb/image/upload/v1775815897/marjonhorn-animal-10157664_bquhmk.jpg"
              alt="Menu Background"
              className="w-full h-full object-cover object-top"
            />
            {/* Cinematic Gradient: Clear at the top (face/eyes) to dark at the bottom (links) */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-background/60 to-background/95 backdrop-blur-[2px]" />
          </div>

          {/* Close Button Inside Menu */}
          <div className="relative z-10 flex justify-end p-4">
            <button onClick={() => setMobileOpen(false)} className="text-white hover:text-primary transition-colors p-2">
              <X size={24} />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="relative z-10 flex flex-col items-center justify-center py-10 gap-6">
            {navItems.map((item, i) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="text-xl font-heading font-bold text-white hover:text-primary transition-all duration-300 transform hover:scale-105 animate-fade-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
