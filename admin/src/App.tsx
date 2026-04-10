import React, { useState } from "react";
import AdminProfile from "./pages/Profile";
import AdminProjects from "./pages/Projects";
import AdminExperience from "./pages/Experience";
import AdminSkills from "./pages/Skills";
import AdminCertificates from "./pages/Certificates";
import "./App.css";

type Tab = "profile" | "projects" | "experience" | "skills" | "certificates";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  return (
    <div className="admin-app">
      <header className="admin-header">
        <div className="header-content">
          <h1>🔧 Portfolio Admin Dashboard</h1>
          <p>Manage your portfolio data - changes reflect instantly in your portfolio</p>
        </div>
      </header>

      <div className="container">
        <nav className="admin-nav">
          <button
            className={`nav-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            👤 Profile
          </button>
          <button
            className={`nav-btn ${activeTab === "projects" ? "active" : ""}`}
            onClick={() => setActiveTab("projects")}
          >
            📁 Projects
          </button>
          <button
            className={`nav-btn ${activeTab === "experience" ? "active" : ""}`}
            onClick={() => setActiveTab("experience")}
          >
            💼 Experience
          </button>
          <button
            className={`nav-btn ${activeTab === "skills" ? "active" : ""}`}
            onClick={() => setActiveTab("skills")}
          >
            🛠️ Skills
          </button>
          <button
            className={`nav-btn ${activeTab === "certificates" ? "active" : ""}`}
            onClick={() => setActiveTab("certificates")}
          >
            🏆 Certificates
          </button>
        </nav>

        <main className="admin-content">
          {activeTab === "profile" && <AdminProfile />}
          {activeTab === "projects" && <AdminProjects />}
          {activeTab === "experience" && <AdminExperience />}
          {activeTab === "skills" && <AdminSkills />}
          {activeTab === "certificates" && <AdminCertificates />}
        </main>
      </div>

      <footer className="admin-footer">
        <p>💡 Tip: All changes are saved to the database and will be reflected in your portfolio immediately!</p>
      </footer>
    </div>
  );
};

export default App;
