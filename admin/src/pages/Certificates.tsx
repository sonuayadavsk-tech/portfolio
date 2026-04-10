import React, { useState, useEffect } from "react";
import { portfolioAPI, uploadAPI } from "../api";
import "./Admin.css";

interface Achievement {
    _id?: string;
    title: string;
    issuer: string;
    date: string;
    description?: string;
    link?: string;
    image?: string;
}

const AdminCertificates: React.FC = () => {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [newAchievement, setNewAchievement] = useState<Achievement>({
        title: "",
        issuer: "",
        date: "",
        description: "",
        link: "",
        image: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editDraft, setEditDraft] = useState<Achievement | null>(null);

    useEffect(() => {
        fetchAchievements();
    }, []);

    const fetchAchievements = async () => {
        try {
            setLoading(true);
            const response = await portfolioAPI.getPortfolio();
            setAchievements(response.data.achievements || []);
        } catch (error) {
            setMessage("❌ Failed to fetch achievements");
        } finally {
            setLoading(false);
        }
    };

    const handleAddAchievement = async () => {
        if (!newAchievement.title || !newAchievement.issuer) {
            setMessage("⚠️ Please fill in all required fields (Title, Issuer)");
            return;
        }

        try {
            setLoading(true);
            const updatedAchievements = [...achievements, newAchievement];
            await portfolioAPI.updateSection("achievements", { achievements: updatedAchievements });
            setMessage("✅ Achievement added successfully!");
            setNewAchievement({
                title: "",
                issuer: "",
                date: "",
                description: "",
                link: "",
                image: "",
            });
            fetchAchievements();
        } catch (error) {
            setMessage("❌ Failed to add achievement");
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (index: number) => {
        setEditingIndex(index);
        setEditDraft({ ...achievements[index] });
        setMessage("");
    };

    const cancelEdit = () => {
        setEditingIndex(null);
        setEditDraft(null);
    };

    const saveEdit = async () => {
        if (editingIndex === null || !editDraft) return;

        const updatedAchievements = [...achievements];
        updatedAchievements[editingIndex] = editDraft;

        try {
            setLoading(true);
            await portfolioAPI.updateSection("achievements", { achievements: updatedAchievements });
            setMessage("✅ Achievement updated successfully!");
            cancelEdit();
            fetchAchievements();
        } catch (error) {
            setMessage("❌ Failed to update achievement");
        } finally {
            setLoading(false);
        }
    };

    const handleMoveAchievement = async (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= achievements.length) return;

        const updatedAchievements = [...achievements];
        const temp = updatedAchievements[index];
        updatedAchievements[index] = updatedAchievements[newIndex];
        updatedAchievements[newIndex] = temp;

        try {
            setLoading(true);
            await portfolioAPI.updateSection("achievements", { achievements: updatedAchievements });
            setMessage(`✅ Achievement moved ${direction}!`);
            fetchAchievements();
        } catch (error) {
            setMessage("❌ Failed to reorder achievement");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAchievement = async (index: number) => {
        try {
            setLoading(true);
            const updatedAchievements = achievements.filter((_, i) => i !== index);
            await portfolioAPI.updateSection("achievements", { achievements: updatedAchievements });
            setMessage("✅ Achievement deleted successfully!");
            fetchAchievements();
        } catch (error) {
            setMessage("❌ Failed to delete achievement");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, mode: 'new' | 'edit' = 'new') => {
        const { name, value } = e.target;
        if (mode === 'new') {
            setNewAchievement({ ...newAchievement, [name]: value });
        } else if (editDraft) {
            setEditDraft({ ...editDraft, [name]: value });
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, mode: 'new' | 'edit' = 'new') => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        try {
            setLoading(true);
            setMessage("⏳ Uploading certificate image...");
            const res = await uploadAPI.uploadCertificateImage(files[0]);
            if (mode === 'new') {
                setNewAchievement({ ...newAchievement, image: res.data.imageUrl });
            } else if (editDraft) {
                setEditDraft({ ...editDraft, image: res.data.imageUrl });
            }
            setMessage("✅ Certificate image uploaded!");
        } catch (error) {
            setMessage("❌ Image upload failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-section">
            <h2>🏆 Manage Certificates & Achievements</h2>

            {message && <p className={`message ${message.includes("✅") ? "success" : "error"}`}>{message}</p>}

            <div className="form-group">
                <h3>Add New Certificate / Achievement</h3>
                <input
                    type="text"
                    name="title"
                    placeholder="Title (e.g., AWS Certified Practitioner)"
                    value={newAchievement.title}
                    onChange={(e) => handleInputChange(e, 'new')}
                />
                <input
                    type="text"
                    name="issuer"
                    placeholder="Issuer (e.g., Amazon Web Services)"
                    value={newAchievement.issuer}
                    onChange={(e) => handleInputChange(e, 'new')}
                />
                <input
                    type="text"
                    name="date"
                    placeholder="Date (e.g., May 2024)"
                    value={newAchievement.date || ""}
                    onChange={(e) => handleInputChange(e, 'new')}
                />
                <textarea
                    name="description"
                    placeholder="Description or significance"
                    value={newAchievement.description || ""}
                    onChange={(e) => handleInputChange(e, 'new')}
                />
                <input
                    type="url"
                    name="link"
                    placeholder="Certificate Validation URL or Link"
                    value={newAchievement.link || ""}
                    onChange={(e) => handleInputChange(e, 'new')}
                />

                <div className="progress-card-upload mt-4 mb-4">
                    <label className="file-input-label">Upload Certificate Image</label>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'new')} disabled={loading} />
                    {newAchievement.image && (
                        <p className="image-url text-xs mt-1 text-green-500">Image successfully uploaded and attached.</p>
                    )}
                </div>

                <button onClick={handleAddAchievement} disabled={loading}>
                    {loading ? "Adding..." : "➕ Add Certificate"}
                </button>
            </div>

            <div className="achievements-list">
                <h3>Current Certificates & Achievements</h3>
                {achievements.length === 0 ? (
                    <p>No certificates yet. Add one above!</p>
                ) : (
                    <div className="projects-grid">
                        {achievements.map((ach, index) => (
                            <div key={index} className="project-card" style={{ display: 'flex', flexDirection: 'column' }}>
                                {editingIndex === index && editDraft ? (
                                    <div className="edit-form-inline p-4 w-full">
                                        <h4>Edit Achievement</h4>
                                        <input
                                            type="text"
                                            name="title"
                                            placeholder="Title"
                                            value={editDraft.title}
                                            onChange={(e) => handleInputChange(e, 'edit')}
                                            className="mb-2 w-full"
                                        />
                                        <input
                                            type="text"
                                            name="issuer"
                                            placeholder="Issuer"
                                            value={editDraft.issuer}
                                            onChange={(e) => handleInputChange(e, 'edit')}
                                            className="mb-2 w-full"
                                        />
                                        <input
                                            type="text"
                                            name="date"
                                            placeholder="Date"
                                            value={editDraft.date || ""}
                                            onChange={(e) => handleInputChange(e, 'edit')}
                                            className="mb-2 w-full"
                                        />
                                        <textarea
                                            name="description"
                                            placeholder="Description"
                                            value={editDraft.description || ""}
                                            onChange={(e) => handleInputChange(e, 'edit')}
                                            className="mb-2 w-full"
                                        />
                                        <input
                                            type="url"
                                            name="link"
                                            placeholder="Certificate Link"
                                            value={editDraft.link || ""}
                                            onChange={(e) => handleInputChange(e, 'edit')}
                                            className="mb-2 w-full"
                                        />
                                        <div className="progress-card-upload mt-2 mb-2">
                                            <label className="text-xs">Update Image (Optional)</label>
                                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'edit')} />
                                        </div>
                                        <div className="admin-btn-row mt-4 flex gap-2">
                                            <button onClick={saveEdit} className="btn-primary">Save Changes</button>
                                            <button onClick={cancelEdit} className="btn-secondary">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {ach.image && (
                                            <img src={ach.image} alt={ach.title} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px 8px 0 0' }} />
                                        )}
                                        <div className="project-info p-4">
                                            <h4>{ach.title}</h4>
                                            <p className="company text-blue-500">{ach.issuer}</p>
                                            <p className="duration">📅 {ach.date}</p>
                                            {ach.link && <a href={ach.link} target="_blank" rel="noopener noreferrer" className="text-sm underline mt-2 block">View Certificate Link →</a>}
                                            {ach.description && <p className="mt-2 text-sm">{ach.description}</p>}
                                        </div>
                                        <div className="admin-btn-row flex gap-2 p-4 mt-auto">
                                            <div className="reorder-btns flex gap-1">
                                                <button
                                                    onClick={() => handleMoveAchievement(index, 'up')}
                                                    disabled={loading || index === 0}
                                                    className="btn-icon"
                                                    title="Move Up"
                                                >
                                                    ↑
                                                </button>
                                                <button
                                                    onClick={() => handleMoveAchievement(index, 'down')}
                                                    disabled={loading || index === achievements.length - 1}
                                                    className="btn-icon"
                                                    title="Move Down"
                                                >
                                                    ↓
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => startEdit(index)}
                                                className="edit-btn"
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAchievement(index)}
                                                disabled={loading}
                                                className="delete-btn"
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCertificates;
