import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

const api = axios.create({
  baseURL: API_URL,
});

export const portfolioAPI = {
  // GET
  getPortfolio: () => api.get("/api/portfolio"),
  
  // UPDATE
  updatePortfolio: (data: any) =>
    api.put("/api/portfolio", data, {
      params: { password: ADMIN_PASSWORD },
    }),
  
  updateSection: (section: string, data: any) =>
    api.put(`/api/portfolio/${section}`, data, {
      params: { password: ADMIN_PASSWORD },
    }),
  
  addProject: (project: any) =>
    api.post("/api/portfolio/projects", project, {
      params: { password: ADMIN_PASSWORD },
    }),
  
  deleteProject: (projectId: string) =>
    api.delete(`/api/portfolio/projects/${projectId}`, {
      params: { password: ADMIN_PASSWORD },
    }),

  updateProject: (projectId: string, project: Record<string, unknown>) =>
    api.put(`/api/portfolio/projects/${projectId}`, project, {
      params: { password: ADMIN_PASSWORD },
    }),
};

export const uploadAPI = {
  uploadProfileImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post("/api/upload/profile-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      params: { password: ADMIN_PASSWORD },
    });
  },

  uploadProjectImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post("/api/upload/project-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      params: { password: ADMIN_PASSWORD },
    });
  },
};

export const chatAPI = {
  sendMessage: (message: string) =>
    api.post("/api/chat", { message }),
};

export default api;
