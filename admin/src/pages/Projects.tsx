import React, { useState, useEffect } from "react";
import { portfolioAPI, uploadAPI } from "../api";
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

/** Same key as frontend ProjectsSection — notifies open portfolio tabs on same origin. */
const PORTFOLIO_PROJECTS_STORAGE_KEY = "portfolio_projects_refresh";

function notifyPortfolioSiteProjectsChanged() {
  try {
    localStorage.setItem(PORTFOLIO_PROJECTS_STORAGE_KEY, String(Date.now()));
  } catch {
    /* private mode / blocked */
  }
}

const emptyProject = (): Project => ({
  name: "",
  description: "",
  skills: [],
  link: "",
  github: "",
  image: "",
});

const AdminProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProject, setNewProject] = useState<Project>(emptyProject);
  const [loading, setLoading] = useState(false);
  const [uploadingNewImage, setUploadingNewImage] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Project | null>(null);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);
  const [newSkillsStr, setNewSkillsStr] = useState("");
  const [draftSkillsStr, setDraftSkillsStr] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await portfolioAPI.getPortfolio();
      setProjects(response.data.projects || []);
    } catch {
      setMessage("❌ Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const showError = (err: unknown, fallback: string) => {
    setMessage(fallback);
    console.error(err);
  };

  const handleNewImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingNewImage(true);
    setMessage("");
    try {
      const res = await uploadAPI.uploadProjectImage(file);
      const url = res.data.imageUrl as string;
      setNewProject((p) => ({ ...p, image: url }));
      setMessage("✅ Project image uploaded — add project or paste URL below.");
    } catch (err) {
      showError(err, "❌ Image upload failed (check password / Cloudinary)");
    } finally {
      setUploadingNewImage(false);
      e.target.value = "";
    }
  };

  const handleEditImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !draft) return;
    setUploadingEditImage(true);
    setMessage("");
    try {
      const res = await uploadAPI.uploadProjectImage(file);
      const url = res.data.imageUrl as string;
      setDraft((p) => (p ? { ...p, image: url } : null));
      setMessage("✅ Image updated for this project — click Save changes.");
    } catch (err) {
      showError(err, "❌ Image upload failed");
    } finally {
      setUploadingEditImage(false);
      e.target.value = "";
    }
  };

  const handleAddProject = async () => {
    if (!newProject.name.trim() || !newProject.description.trim()) {
      setMessage("⚠️ Project name and description are required");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      const skills = newSkillsStr.split(",").map(s => s.trim()).filter(Boolean);
      await portfolioAPI.addProject({
        name: newProject.name.trim(),
        description: newProject.description.trim(),
        skills: skills,
        link: newProject.link?.trim() || undefined,
        github: newProject.github?.trim() || undefined,
        image: newProject.image?.trim() || undefined,
      });
      setMessage("✅ Project added successfully!");
      setNewProject(emptyProject());
      setNewSkillsStr("");
      notifyPortfolioSiteProjectsChanged();
      fetchProjects();
    } catch (err) {
      showError(err, "❌ Failed to add project");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (project: Project) => {
    if (!project._id) return;
    setEditingId(project._id);
    setDraft({
      ...project,
      skills: [...(project.skills || [])],
    });
    setDraftSkillsStr((project.skills || []).join(", "));
    setMessage("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const saveEdit = async () => {
    if (!draft?._id) return;
    if (!draft.name.trim() || !draft.description.trim()) {
      setMessage("⚠️ Name and description are required");
      return;
    }
    try {
      setLoading(true);
      setMessage("");
      const skills = draftSkillsStr.split(",").map(s => s.trim()).filter(Boolean);
      await portfolioAPI.updateProject(draft._id, {
        name: draft.name.trim(),
        description: draft.description.trim(),
        skills: skills,
        link: draft.link?.trim() || "",
        github: draft.github?.trim() || "",
        image: draft.image?.trim() || "",
      });
      setMessage("✅ Project updated!");
      setDraftSkillsStr("");
      cancelEdit();
      notifyPortfolioSiteProjectsChanged();
      fetchProjects();
    } catch (err) {
      showError(err, "❌ Failed to update project");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    try {
      setLoading(true);
      setMessage("");
      await portfolioAPI.deleteProject(projectId);
      if (editingId === projectId) cancelEdit();
      setMessage("✅ Project deleted");
      notifyPortfolioSiteProjectsChanged();
      fetchProjects();
    } catch (err) {
      showError(err, "❌ Failed to delete project");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    target: "new" | "draft"
  ) => {
    const { name, value } = e.target;
    if (target === "new") {
      setNewProject((p) => ({ ...p, [name]: value }));
    } else if (draft) {
      setDraft({ ...draft, [name]: value });
    }
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>, target: "new" | "draft") => {
    if (target === "new") {
      setNewSkillsStr(e.target.value);
    } else {
      setDraftSkillsStr(e.target.value);
    }
  };

  return (
    <div className="admin-section">
      <h2>📁 Manage projects</h2>
      <p className="admin-hint">
        Add or edit projects: photo (Cloudinary), name, description, tech stack, GitHub repo, and live site link. These fields power the public portfolio and assistant context.
      </p>

      {message && (
        <p className={`message ${message.includes("✅") ? "success" : "error"}`}>{message}</p>
      )}

      <div className="form-group">
        <h3>Add new project</h3>
        <label className="admin-label">Project photo</label>
        <div className="admin-image-row">
          <input
            type="file"
            accept="image/*"
            onChange={handleNewImage}
            disabled={uploadingNewImage || loading}
            className="admin-file-input"
          />
          {uploadingNewImage && <span className="admin-inline-status">Uploading…</span>}
          {newProject.image && (
            <img src={newProject.image} alt="Preview" className="admin-thumb" />
          )}
        </div>
        <label className="admin-label">Image URL (optional — if you skip upload)</label>
        <input
          type="url"
          name="image"
          placeholder="https://…"
          value={newProject.image}
          onChange={(e) => handleInputChange(e, "new")}
        />

        <label className="admin-label">Project name *</label>
        <input
          type="text"
          name="name"
          placeholder="e.g. Career Hub"
          value={newProject.name}
          onChange={(e) => handleInputChange(e, "new")}
        />

        <label className="admin-label">Description *</label>
        <textarea
          name="description"
          className="project-description-field"
          placeholder="What the project does, your role, stack highlights…"
          value={newProject.description}
          rows={8}
          onChange={(e) => handleInputChange(e, "new")}
        />

        <label className="admin-label">Tech stack (comma-separated)</label>
        <input
          type="text"
          placeholder="React, Node.js, MongoDB, …"
          value={newSkillsStr}
          onChange={(e) => handleSkillsChange(e, "new")}
        />

        <label className="admin-label">GitHub repository URL</label>
        <input
          type="url"
          name="github"
          placeholder="https://github.com/you/repo"
          value={newProject.github}
          onChange={(e) => handleInputChange(e, "new")}
        />

        <label className="admin-label">Live / hosted link</label>
        <input
          type="url"
          name="link"
          placeholder="https://your-demo.vercel.app"
          value={newProject.link}
          onChange={(e) => handleInputChange(e, "new")}
        />

        <button type="button" onClick={handleAddProject} disabled={loading}>
          {loading ? "Saving…" : "➕ Add project"}
        </button>
      </div>

      <div className="projects-list">
        <h3>Current projects</h3>
        {projects.length === 0 ? (
          <p>No projects yet. Add one above.</p>
        ) : (
          projects.map((project) => (
            <div key={project._id} className="project-card project-card-managed">
              {editingId === project._id && draft ? (
                <div className="project-edit-form">
                  <h4>Edit project</h4>
                  <label className="admin-label">Photo</label>
                  <div className="admin-image-row">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditImage}
                      disabled={uploadingEditImage || loading}
                      className="admin-file-input"
                    />
                    {uploadingEditImage && <span className="admin-inline-status">Uploading…</span>}
                    {draft.image && <img src={draft.image} alt="" className="admin-thumb" />}
                  </div>
                  <label className="admin-label">Image URL</label>
                  <input
                    type="url"
                    name="image"
                    value={draft.image || ""}
                    onChange={(e) => handleInputChange(e, "draft")}
                  />
                  <label className="admin-label">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={draft.name}
                    onChange={(e) => handleInputChange(e, "draft")}
                  />
                  <label className="admin-label">Description *</label>
                  <textarea
                    name="description"
                    value={draft.description}
                    rows={10}
                    onChange={(e) => handleInputChange(e, "draft")}
                  />
                  <label className="admin-label">Tech stack</label>
                  <input
                    type="text"
                    value={draftSkillsStr}
                    onChange={(e) => handleSkillsChange(e, "draft")}
                  />
                  <label className="admin-label">GitHub</label>
                  <input
                    type="url"
                    name="github"
                    value={draft.github || ""}
                    onChange={(e) => handleInputChange(e, "draft")}
                  />
                  <label className="admin-label">Live link</label>
                  <input
                    type="url"
                    name="link"
                    value={draft.link || ""}
                    onChange={(e) => handleInputChange(e, "draft")}
                  />
                  <div className="admin-btn-row">
                    <button type="button" className="btn btn-primary" onClick={saveEdit} disabled={loading}>
                      Save changes
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={cancelEdit} disabled={loading}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="project-card-row">
                    {project.image && (
                      <img src={project.image} alt="" className="project-list-thumb" />
                    )}
                    <div className="project-info">
                      <h4>{project.name}</h4>
                      <p className="project-desc-preview">{project.description}</p>
                      <p className="skills">
                        <strong>Stack:</strong> {project.skills?.length ? project.skills.join(", ") : "—"}
                      </p>
                      <p className="project-links">
                        {project.github && (
                          <a href={project.github} target="_blank" rel="noreferrer">
                            GitHub
                          </a>
                        )}
                        {project.link && (
                          <a href={project.link} target="_blank" rel="noreferrer">
                            Live
                          </a>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="admin-btn-row project-card-actions">
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => startEdit(project)}
                      disabled={loading || !project._id}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => project._id && handleDeleteProject(project._id)}
                      disabled={loading}
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

export default AdminProjects;
