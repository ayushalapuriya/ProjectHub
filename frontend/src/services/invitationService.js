import api from './api';

export const invitationService = {
  // Send invitation
  sendInvitation: async (invitationData) => {
    const response = await api.post('/invitations', invitationData);
    return response.data;
  },

  // Get all invitations
  getInvitations: async (params = {}) => {
    const response = await api.get('/invitations', { params });
    return response.data;
  },

  // Get invitation by token
  getInvitationByToken: async (token) => {
    const response = await api.get(`/invitations/token/${token}`);
    return response.data;
  },

  // Accept invitation
  acceptInvitation: async (token, userData) => {
    const response = await api.post(`/invitations/accept/${token}`, userData);
    return response.data;
  },

  // Decline invitation
  declineInvitation: async (token) => {
    const response = await api.post(`/invitations/decline/${token}`);
    return response.data;
  },

  // Cancel invitation
  cancelInvitation: async (id) => {
    const response = await api.delete(`/invitations/${id}`);
    return response.data;
  },

  // Resend invitation
  resendInvitation: async (id) => {
    const response = await api.post(`/invitations/${id}/resend`);
    return response.data;
  }
};
