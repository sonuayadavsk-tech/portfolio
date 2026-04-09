import React, { useState, useEffect } from "react";
import { portfolioAPI } from "../api";
import "./Admin.css";

interface Project {
  _id?: string;
  name: string;
  description: string;
  skills: string[];
  link?: string;
  github?: string;
  image?: string;
}

const AdminProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProject, setNewProject] = useState<Project>({
    name: "",
    description: "",
    skills: [],
    link: "",
    github: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await portfolioAPI.getPortfolio();
      setProjects(response.data.projects);
    } catch (error) {
      setMessage("❌ Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async () => {
    if (!newProject.name || !newProject.description) {
      setMessage("⚠️ Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      await portfolioAPI.addProject(newProject);
      setMessage("✅ Project added successfully!");
      setNewProject({
        name: "",
        description: "",
        skills: [],
        link: "",
        github: "",
        image: "",
      });
      fetchProjects();
    } catch (error) {
      setMessage("❌ Failed to add project");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      setLoading(true);
      await portfolioAPI.deleteProject(projectId);
      setMessage("✅ Project deleted successfully!");
      fetchProjects();
    } catch (error) {
      setMessage("❌ Failed to delete project");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProject({ ...newProject, [name]: value });
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(",").map((skill) => skill.trim());
    setNewProject({ ...newProject, skills });
  };

  return (
    <div className="admin-section">
      <h2>📁 Manage Projects</h2>

      {message && <p className={`message ${message.includes("✅") ? "success" : "error"}`}>{message}</p>}

      <div className="form-group">
        <h3>Add New Project</h3>
        <input
          type="text"
          name="name"
          placeholder="Project Name"
          value={newProject.name}
          onChange={handleInputChange}
        />
        <textarea
          name="description"
          placeholder="Project Description"
          value={newProject.description}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="link"
          placeholder="Project Link (optional)"
          value={newProject.link}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="github"
          placeholder="GitHub Link (optional)"
          value={newProject.github}
          onChange={handleInputChange}
        />
        <input
          type="text"
          placeholder="Skills (comma-separated)"
          value={newProject.skills.join(", ")}
          onChange={handleSkillsChange}
        />
        <button onClick={handleAddProject} disabled={loading}>
          {loading ? "Adding..." : "➕ Add Project"}
        </button>
      </div>

      <div className="projects-list">
        <h3>Current Projects</h3>
        {projects.length === 0 ? (
          <p>No projects yet. Add one above!</p>
        ) : (
          projects.map((project) => (
            <div key={project._id} className="project-card">
              <div className="project-info">
                <h4>{project.name}</h4>
                <p>{project.description}</p>
                <p className="skills">Skills: {project.skills.join(", ")}</p>
              </div>
              <button
                onClick={() => handleDeleteProject(project._id!)}
                disabled={loading}
                className="delete-btn"
              >
                🗑️ Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminProjects;
