import api from './api';

export const taskService = {
  // Get all tasks
  getTasks: async (params = {}) => {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  // Get single task
  getTask: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // Create task
  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  // Update task
  updateTask: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  // Delete task
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  // Add comment to task
  addComment: async (id, comment) => {
    const response = await api.post(`/tasks/${id}/comments`, { text: comment });
    return response.data;
  },

  // Delete comment from task
  deleteComment: async (taskId, commentId) => {
    const response = await api.delete(`/tasks/${taskId}/comments/${commentId}`);
    return response.data;
  },

  // Review task (approve/reject)
  reviewTask: async (taskId, reviewData) => {
    const response = await api.put(`/tasks/${taskId}/review`, reviewData);
    return response.data;
  },

  // Get tasks pending review
  getPendingReviewTasks: async () => {
    const response = await api.get('/tasks/pending-review');
    return response.data;
  }
};
