import React, { useState, useEffect } from "react";
import { portfolioAPI } from "../api";
import "./Admin.css";

interface SkillCategory {
  title: string;
  skills: string[];
}

const AdminSkills: React.FC = () => {
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([
    { title: "Languages & Web", skills: [] },
    { title: "Backend & Database", skills: [] },
    { title: "Cloud & DevOps", skills: [] },
    { title: "Tools & Practices", skills: [] },
  ]);
  
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await portfolioAPI.getPortfolio();
      if (response.data.skillCategories && Array.isArray(response.data.skillCategories)) {
        setSkillCategories(response.data.skillCategories);
      } else if (response.data.skills && Array.isArray(response.data.skills)) {
        // Migrate old flat array to categories
        const categories: SkillCategory[] = [
          {
            title: "Languages & Web",
            skills: response.data.skills.filter((s: string) =>
              /javascript|typescript|react|next|html|css|java/i.test(s)
            ),
          },
          {
            title: "Backend & Database",
            skills: response.data.skills.filter((s: string) =>
              /node|express|mongodb|postgres|sql|api|rest/i.test(s)
            ),
          },
          {
            title: "Cloud & DevOps",
            skills: response.data.skills.filter((s: string) =>
              /aws|digitalocean|linux|docker|devops|cloud|dns/i.test(s)
            ),
          },
          {
            title: "Tools & Practices",
            skills: response.data.skills.filter((s: string) =>
              !/javascript|typescript|react|next|html|css|java|node|express|mongodb|postgres|sql|api|rest|aws|digitalocean|linux|docker|devops|cloud|dns/i.test(
                s
              )
            ),
          },
        ];
        setSkillCategories(categories);
      }
    } catch (error) {
      setMessage("❌ Failed to fetch skills");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) {
      setMessage("⚠️ Please enter a skill");
      return;
    }

    const categorySkills = skillCategories[selectedCategory].skills;
    if (categorySkills.includes(newSkill)) {
      setMessage("⚠️ Skill already exists in this category");
      return;
    }

    try {
      setLoading(true);
      const updatedCategories = [...skillCategories];
      updatedCategories[selectedCategory].skills.push(newSkill);
      
      await portfolioAPI.updateSection("skills", { skillCategories: updatedCategories });
      setMessage("✅ Skill added successfully!");
      setNewSkill("");
      setSkillCategories(updatedCategories);
    } catch (error) {
      setMessage("❌ Failed to add skill");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkill = async (skill: string) => {
    try {
      setLoading(true);
      const updatedCategories = [...skillCategories];
      updatedCategories[selectedCategory].skills = updatedCategories[
        selectedCategory
      ].skills.filter((s) => s !== skill);
      
      await portfolioAPI.updateSection("skills", { skillCategories: updatedCategories });
      setMessage("✅ Skill deleted successfully!");
      setSkillCategories(updatedCategories);
    } catch (error) {
      setMessage("❌ Failed to delete skill");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-section">
      <h2>🛠️ Manage Skills by Category</h2>

      {message && (
        <p className={`message ${message.includes("✅") ? "success" : "error"}`}>
          {message}
        </p>
      )}

      {/* Category Tabs */}
      <div className="category-tabs">
        {skillCategories.map((cat, index) => (
          <button
            key={index}
            onClick={() => setSelectedCategory(index)}
            className={`category-tab ${selectedCategory === index ? "active" : ""}`}
          >
            {cat.title} ({cat.skills.length})
          </button>
        ))}
      </div>

      {/* Add Skill Form */}
      <div className="form-group">
        <h3>📝 Add Skill to "{skillCategories[selectedCategory].title}"</h3>
        <input
          type="text"
          placeholder="Enter skill name"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
        />
        <button onClick={handleAddSkill} disabled={loading}>
          {loading ? "Adding..." : "➕ Add Skill"}
        </button>
      </div>

      {/* Skills Grid */}
      <div className="skills-list">
        <h3>
          Skills in "{skillCategories[selectedCategory].title}" (
          {skillCategories[selectedCategory].skills.length})
        </h3>
        {skillCategories[selectedCategory].skills.length === 0 ? (
          <p>No skills in this category yet. Add one above!</p>
        ) : (
          <div className="skills-grid">
            {skillCategories[selectedCategory].skills.map((skill, index) => (
              <div key={index} className="skill-badge">
                <span>{skill}</span>
                <button
                  onClick={() => handleDeleteSkill(skill)}
                  disabled={loading}
                  className="remove-btn"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSkills;
