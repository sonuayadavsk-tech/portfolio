import React, { useState, useEffect } from "react";
import { portfolioAPI, uploadAPI } from "../api";
import "./Admin.css";

interface Experience {
  _id?: string;
  company: string;
  role: string;
  description: string;
  duration: string;
  skills: string[];
  progressCardImage?: string;
}

const AdminExperience: React.FC = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [newExperience, setNewExperience] = useState<Experience>({
    company: "",
    role: "",
    description: "",
    duration: "",
    skills: [],
    progressCardImage: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchExperience();
  }, []);

  const fetchExperience = async () => {
    try {
      setLoading(true);
      const response = await portfolioAPI.getPortfolio();
      setExperiences(response.data.experience || []);
    } catch (error) {
      setMessage("❌ Failed to fetch experience");
    } finally {
      setLoading(false);
    }
  };

  const handleAddExperience = async () => {
    if (!newExperience.company || !newExperience.role || !newExperience.duration || !newExperience.description) {
      setMessage("⚠️ Please fill in all required fields (Company, Role, Duration, Description)");
      return;
    }

    try {
      setLoading(true);
      const updatedExperiences = [...experiences, newExperience];
      await portfolioAPI.updateSection("experience", { experience: updatedExperiences });
      setMessage("✅ Experience added successfully!");
      setNewExperience({
        company: "",
        role: "",
        description: "",
        duration: "",
        skills: [],
        progressCardImage: "",
      });
      fetchExperience();
    } catch (error) {
      setMessage("❌ Failed to add experience");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExperience = async (index: number) => {
    try {
      setLoading(true);
      const updatedExperiences = experiences.filter((_, i) => i !== index);
      await portfolioAPI.updateSection("experience", { experience: updatedExperiences });
      setMessage("✅ Experience deleted successfully!");
      fetchExperience();
    } catch (error) {
      setMessage("❌ Failed to delete experience");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewExperience({ ...newExperience, [name]: value });
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(",").map((skill) => skill.trim());
    setNewExperience({ ...newExperience, skills });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setLoading(true);
      setMessage("⏳ Uploading image...");
      const res = await uploadAPI.uploadProgressCardImage(files[0]);
      setNewExperience({ ...newExperience, progressCardImage: res.data.imageUrl });
      setMessage("✅ Image uploaded!");
    } catch (error) {
      setMessage("❌ Image upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-section">
      <h2>💼 Manage Experience</h2>

      {message && <p className={`message ${message.includes("✅") ? "success" : "error"}`}>{message}</p>}

      <div className="form-group">
        <h3>Add New Experience</h3>
        <input
          type="text"
          name="company"
          placeholder="Company Name"
          value={newExperience.company}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="role"
          placeholder="Job Role"
          value={newExperience.role}
          onChange={handleInputChange}
        />
        <textarea
          name="description"
          placeholder="Job Description"
          value={newExperience.description}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="duration"
          placeholder="Duration (e.g., Jan 2023 - Dec 2024)"
          value={newExperience.duration}
          onChange={handleInputChange}
        />
        <input
          type="text"
          placeholder="Skills (comma-separated)"
          value={newExperience.skills.join(", ")}
          onChange={handleSkillsChange}
        />
        <div className="progress-card-upload mt-4 mb-4">
          <label className="file-input-label">Upload Progress Card (Optional)</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} disabled={loading} />
          {newExperience.progressCardImage && (
            <p className="image-url text-xs mt-1 text-green-500">Image successfully uploaded and attached.</p>
          )}
        </div>
        <button onClick={handleAddExperience} disabled={loading}>
          {loading ? "Adding..." : "➕ Add Experience"}
        </button>
      </div>

      <div className="experiences-list">
        <h3>Current Experience</h3>
        {experiences.length === 0 ? (
          <p>No experience yet. Add one above!</p>
        ) : (
          experiences.map((exp, index) => (
            <div key={index} className="experience-card">
              <div className="experience-info">
                <h4>{exp.role}</h4>
                <p className="company">{exp.company}</p>
                <p>{exp.description}</p>
                <p className="duration">📅 {exp.duration}</p>
                <p className="skills">Skills: {exp.skills.join(", ")}</p>
                {exp.progressCardImage && <p className="image-url mt-2 font-semibold">🖼️ Progress Card Linked</p>}
              </div>
              <button
                onClick={() => handleDeleteExperience(index)}
                disabled={loading}
                className="delete-btn mt-4"
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

export default AdminExperience;
