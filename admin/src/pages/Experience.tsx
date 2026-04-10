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
  link?: string;
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
    link: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [skillsStr, setSkillsStr] = useState("");

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Experience | null>(null);
  const [editSkillsStr, setEditSkillsStr] = useState("");

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
    const skills = skillsStr.split(",").map(s => s.trim()).filter(Boolean);
    if (!newExperience.company || !newExperience.role || !newExperience.duration || !newExperience.description) {
      setMessage("⚠️ Please fill in all required fields (Company, Role, Duration, Description)");
      return;
    }

    try {
      setLoading(true);
      const updatedExperiences = [...experiences, { ...newExperience, skills }];
      console.log("📤 Admin: Sending updated experience section:", JSON.stringify(updatedExperiences, null, 2));
      await portfolioAPI.updateSection("experience", { experience: updatedExperiences });
      setMessage("✅ Experience added successfully!");
      setNewExperience({
        company: "",
        role: "",
        description: "",
        duration: "",
        skills: [],
        progressCardImage: "",
        link: "",
      });
      setSkillsStr("");
      fetchExperience();
    } catch (error) {
      setMessage("❌ Failed to add experience");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (index: number) => {
    const exp = experiences[index];
    setEditingIndex(index);
    setEditDraft({ ...exp });
    setEditSkillsStr((exp.skills || []).join(", "));
    setMessage("");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditDraft(null);
    setEditSkillsStr("");
  };

  const saveEdit = async () => {
    if (editingIndex === null || !editDraft) return;

    const skills = editSkillsStr.split(",").map(s => s.trim()).filter(Boolean);
    const updatedExperiences = [...experiences];
    updatedExperiences[editingIndex] = { ...editDraft, skills };

    try {
      setLoading(true);
      console.log("📤 Admin: Saving edited experience section:", JSON.stringify(updatedExperiences, null, 2));
      await portfolioAPI.updateSection("experience", { experience: updatedExperiences });
      setMessage("✅ Experience updated successfully!");
      cancelEdit();
      fetchExperience();
    } catch (error) {
      setMessage("❌ Failed to update experience");
    } finally {
      setLoading(false);
    }
  };

  const handleMoveExperience = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= experiences.length) return;

    const updatedExperiences = [...experiences];
    const temp = updatedExperiences[index];
    updatedExperiences[index] = updatedExperiences[newIndex];
    updatedExperiences[newIndex] = temp;

    try {
      setLoading(true);
      await portfolioAPI.updateSection("experience", { experience: updatedExperiences });
      setMessage(`✅ Experience moved ${direction}!`);
      fetchExperience();
    } catch (error) {
      setMessage("❌ Failed to reorder experience");
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, mode: 'new' | 'edit' = 'new') => {
    const { name, value } = e.target;
    if (mode === 'new') {
      setNewExperience({ ...newExperience, [name]: value });
    } else if (editDraft) {
      setEditDraft({ ...editDraft, [name]: value });
    }
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>, mode: 'new' | 'edit' = 'new') => {
    if (mode === 'new') {
      setSkillsStr(e.target.value);
    } else {
      setEditSkillsStr(e.target.value);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, mode: 'new' | 'edit' = 'new') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setLoading(true);
      setMessage("⏳ Uploading image...");
      const res = await uploadAPI.uploadProgressCardImage(files[0]);
      if (mode === 'new') {
        setNewExperience({ ...newExperience, progressCardImage: res.data.imageUrl });
      } else if (editDraft) {
        setEditDraft({ ...editDraft, progressCardImage: res.data.imageUrl });
      }
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
          placeholder="Duration (e.g., Jan 2022 - Present)"
          value={newExperience.duration}
          onChange={handleInputChange}
        />
        <input
          type="url"
          name="link"
          placeholder="Company/Academy Website URL (Optional)"
          value={newExperience.link || ""}
          onChange={handleInputChange}
        />
        <input
          type="text"
          placeholder="Skills (comma-separated)"
          value={skillsStr}
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
              {editingIndex === index && editDraft ? (
                <div className="edit-form-inline">
                  <h4>Edit Experience</h4>
                  <input
                    type="text"
                    name="company"
                    placeholder="Company Name"
                    value={editDraft.company}
                    onChange={(e) => handleInputChange(e, 'edit')}
                  />
                  <input
                    type="text"
                    name="role"
                    placeholder="Job Role"
                    value={editDraft.role}
                    onChange={(e) => handleInputChange(e, 'edit')}
                  />
                  <textarea
                    name="description"
                    placeholder="Job Description"
                    value={editDraft.description}
                    onChange={(e) => handleInputChange(e, 'edit')}
                  />
                  <input
                    type="text"
                    name="duration"
                    placeholder="Duration"
                    value={editDraft.duration}
                    onChange={(e) => handleInputChange(e, 'edit')}
                  />
                  <input
                    type="url"
                    name="link"
                    placeholder="Website URL"
                    value={editDraft.link || ""}
                    onChange={(e) => handleInputChange(e, 'edit')}
                  />
                  <input
                    type="text"
                    placeholder="Skills (comma-separated)"
                    value={editSkillsStr}
                    onChange={(e) => handleSkillsChange(e, 'edit')}
                  />
                  <div className="progress-card-upload mt-2 mb-2">
                    <label className="text-xs">Update Image (Optional)</label>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'edit')} />
                  </div>
                  <div className="admin-btn-row mt-4">
                    <button onClick={saveEdit} className="btn-primary">Save Changes</button>
                    <button onClick={cancelEdit} className="btn-secondary">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="experience-info">
                    <h4>{exp.role}</h4>
                    <p className="company">{exp.company}</p>
                    <p>{exp.description}</p>
                    <p className="duration">📅 {exp.duration}</p>
                    <p className="skills">Skills: {exp.skills.join(", ")}</p>
                    {exp.progressCardImage && <p className="image-url mt-2 font-semibold">🖼️ Progress Card Linked</p>}
                  </div>
                  <div className="admin-btn-row flex gap-2 mt-4">
                    <div className="reorder-btns flex gap-1">
                      <button
                        onClick={() => handleMoveExperience(index, 'up')}
                        disabled={loading || index === 0}
                        className="btn-icon"
                        title="Move Up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => handleMoveExperience(index, 'down')}
                        disabled={loading || index === experiences.length - 1}
                        className="btn-icon"
                        title="Move Down"
                      >
                        ↓
                      </button>
                    </div>
                    <button
                      onClick={() => startEdit(index)}
                      className="btn-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteExperience(index)}
                      disabled={loading}
                      className="delete-btn"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminExperience;
