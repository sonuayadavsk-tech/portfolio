import React, { useState, useEffect } from "react";
import { portfolioAPI, uploadAPI } from "../api";
import "./Admin.css";

interface Stat {
  label: string;
  value: string;
}

interface PortfolioData {
  bio: string;
  title?: string;
  tagline?: string;
  stats?: Stat[];
  profileImage?: string;
  resumeUrl?: string;
  contact?: {
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
  };
}

const AdminProfile: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioData>({
    bio: "",
    title: "",
    tagline: "",
    stats: [],
    profileImage: "",
    resumeUrl: "",
    contact: {
      email: "",
      phone: "",
      linkedin: "",
      github: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const response = await portfolioAPI.getPortfolio();
      setPortfolio(response.data);
      if (response.data.profileImage) {
        setPreviewImage(response.data.profileImage);
      }
    } catch (error) {
      setMessage("❌ Failed to fetch portfolio data");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      setLoading(true);
      setMessage("⏳ Uploading image...");
      const response = await uploadAPI.uploadProfileImage(file);

      if (response.data.imageUrl) {
        // Update portfolio with new image URL
        await portfolioAPI.updatePortfolio({
          ...portfolio,
          profileImage: response.data.imageUrl,
        });

        setMessage("✅ Profile picture updated successfully!");
        fetchPortfolio();
      }
    } catch (error: any) {
      setMessage(`❌ Failed to upload image: ${error.response?.data?.error || error.message}`);
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setLoading(true);
      setMessage("⏳ Uploading resume file...");
      const res = await uploadAPI.uploadResumeFile(files[0]);

      setPortfolio({ ...portfolio, resumeUrl: res.data.imageUrl });
      setMessage("✅ Resume uploaded successfully!");
    } catch (error: any) {
      setMessage(`❌ Failed to upload resume: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPortfolio({ ...portfolio, [name]: value });
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPortfolio({
      ...portfolio,
      contact: {
        ...portfolio.contact,
        [name]: value,
      },
    });
  };

  const handleStatChange = (index: number, field: keyof Stat, value: string) => {
    const updatedStats = [...(portfolio.stats || [])];
    updatedStats[index] = { ...updatedStats[index], [field]: value };
    setPortfolio({ ...portfolio, stats: updatedStats });
  };

  const handleAddStat = () => {
    const newStats = [...(portfolio.stats || []), { label: "", value: "" }];
    setPortfolio({ ...portfolio, stats: newStats });
  };

  const handleRemoveStat = (index: number) => {
    const updatedStats = (portfolio.stats || []).filter((_, i) => i !== index);
    setPortfolio({ ...portfolio, stats: updatedStats });
  };

  const handleSaveAll = async () => {
    try {
      setLoading(true);
      await portfolioAPI.updatePortfolio(portfolio);
      setMessage("✅ All changes saved successfully!");
    } catch (error) {
      setMessage("❌ Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-section">
      <h2>👤 Manage Profile</h2>

      {message && <p className={`message ${message.includes("✅") ? "success" : "error"}`}>{message}</p>}

      {loading && <p className="loading">⏳ Processing...</p>}

      {/* Profile Picture Section */}
      <div className="form-group">
        <h3>📸 Profile Picture</h3>
        <div className="profile-picture-container">
          {previewImage ? (
            <div className="profile-picture-preview">
              <img src={previewImage} alt="Profile" />
            </div>
          ) : (
            <div className="profile-picture-placeholder">No image selected</div>
          )}

          <div className="image-upload-section">
            <label htmlFor="profile-image" className="file-input-label">
              Choose Image
            </label>
            <input
              id="profile-image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
              style={{ display: "none" }}
            />
            <p className="image-upload-hint">JPG, PNG or WebP. Max 10MB.</p>
            {portfolio.profileImage && (
              <p className="image-url">
                <strong>Current URL:</strong> {portfolio.profileImage}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section - Title & Tagline */}
      <div className="form-group">
        <h3>✨ Hero Section</h3>
        <input
          type="text"
          name="title"
          value={portfolio.title || ""}
          onChange={handleInputChange}
          placeholder="Your title (e.g., Full Stack Developer)"
          className="form-input"
          disabled={loading}
        />
        <input
          type="text"
          name="tagline"
          value={portfolio.tagline || ""}
          onChange={handleInputChange}
          placeholder="Your tagline (e.g., Crafting Digital Experiences)"
          className="form-input"
          disabled={loading}
        />

        <h4 className="mt-4 mb-2 font-semibold">📄 Resume</h4>
        <div className="flex flex-col gap-2">
          <input
            type="url"
            name="resumeUrl"
            value={portfolio.resumeUrl || ""}
            onChange={handleInputChange}
            placeholder="Resume Link / URL (e.g., Google Drive link)"
            className="form-input"
            disabled={loading}
          />
          <div className="resume-upload-section border p-4 rounded-md bg-white">
            <label className="file-input-label block mb-2 font-medium">Or Upload Resume (PDF or Image)</label>
            <input type="file" accept=".pdf,image/*" onChange={handleResumeUpload} disabled={loading} />
            {portfolio.resumeUrl && <p className="text-xs text-green-600 mt-2">Resume file is currently attached to your portfolio.</p>}
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="form-group">
        <h3>📝 Bio</h3>
        <textarea
          name="bio"
          value={portfolio.bio}
          onChange={handleInputChange}
          placeholder="Write a brief bio about yourself..."
          rows={4}
          className="form-textarea"
          disabled={loading}
        />
      </div>

      {/* Stats Section */}
      <div className="form-group">
        <h3>📊 Stats (About Me Cards)</h3>
        <div className="stats-list">
          {(portfolio.stats || []).map((stat, index) => (
            <div key={index} className="stat-item">
              <input
                type="text"
                placeholder="Label (e.g., CGPA)"
                value={stat.label}
                onChange={(e) => handleStatChange(index, "label", e.target.value)}
                className="form-input"
                disabled={loading}
              />
              <input
                type="text"
                placeholder="Value (e.g., 8.3)"
                value={stat.value}
                onChange={(e) => handleStatChange(index, "value", e.target.value)}
                className="form-input"
                disabled={loading}
              />
              <button
                onClick={() => handleRemoveStat(index)}
                disabled={loading}
                className="btn btn-delete"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button onClick={handleAddStat} disabled={loading} className="btn btn-secondary">
          + Add Stat
        </button>
      </div>

      {/* Contact Information Section */}
      <div className="form-group">
        <h3>📧 Contact Information</h3>
        <input
          type="email"
          name="email"
          value={portfolio.contact?.email || ""}
          onChange={handleContactChange}
          placeholder="Email"
          className="form-input"
          disabled={loading}
        />
        <input
          type="text"
          name="phone"
          value={portfolio.contact?.phone || ""}
          onChange={handleContactChange}
          placeholder="Phone (e.g., +91-XXXXXXXXXX)"
          className="form-input"
          disabled={loading}
        />
        <input
          type="text"
          name="location"
          value={portfolio.contact?.location || ""}
          onChange={handleContactChange}
          placeholder="Location (e.g., Belagavi, Karnataka)"
          className="form-input"
          disabled={loading}
        />
        <input
          type="url"
          name="linkedin"
          value={portfolio.contact?.linkedin || ""}
          onChange={handleContactChange}
          placeholder="LinkedIn URL"
          className="form-input"
          disabled={loading}
        />
        <input
          type="url"
          name="github"
          value={portfolio.contact?.github || ""}
          onChange={handleContactChange}
          placeholder="GitHub URL"
          className="form-input"
          disabled={loading}
        />
      </div>

      {/* Save All Button */}
      <div className="form-group">
        <button onClick={handleSaveAll} disabled={loading} className="btn btn-primary btn-large">
          💾 Save All Changes
        </button>
      </div>
    </div>
  );
};

export default AdminProfile;
