import { useEffect, useState } from "react";
import { Github, Linkedin, Mail } from "lucide-react";

interface ContactData {
  email?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
}

interface PortfolioData {
  contact?: ContactData;
}

const Footer = () => {
  const [contact, setContact] = useState<ContactData>({
    github: "https://github.com/Sonusk4",
    linkedin: "https://linkedin.com/in/sonu-yadav-b1272a269",
    email: "Sonuskyadav30@gmail.com",
  });

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const response = await fetch(`${apiUrl}/api/portfolio`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data: PortfolioData = await response.json();
        if (data.contact) {
          setContact(data.contact);
        }
      } catch (error) {
        console.error("❌ Failed to fetch contact:", error);
      }
    };

    fetchContact();
    const interval = setInterval(fetchContact, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 border-t border-border">
      <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-body text-sm text-muted-foreground">
          © {currentYear} Sonu Yadav. All rights reserved.
        </p>
        <div className="flex gap-4">
          {contact.github && (
            <a href={contact.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Github size={18} />
            </a>
          )}
          {contact.linkedin && (
            <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Linkedin size={18} />
            </a>
          )}
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="text-muted-foreground hover:text-primary transition-colors">
              <Mail size={18} />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
