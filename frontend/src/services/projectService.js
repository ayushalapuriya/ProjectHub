import api from './api';

export const projectService = {
  // Get all projects
  getProjects: async (params = {}) => {
    const response = await api.get('/projects', { params });
    return response.data;
  },

  // Get single project
  getProject: async (id) => {
    const response = await api.get(`/projects/${id}`);
    console.log("GET PRoject" ,response.data)
    return response.data;
  },

  // Create project
  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  // Update project
  updateProject: async (id, projectData) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  // Delete project
  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  }
};
