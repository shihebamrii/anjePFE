import api from './api';

export const complaintService = {
  getComplaints: async () => {
    const response = await api.get('/complaints');
    return response.data;
  },

  createComplaint: async (data) => {
    const response = await api.post('/complaints', data);
    return response.data;
  },

  resolveComplaint: async (id, data) => {
    const response = await api.put(`/complaints/${id}/resolve`, data);
    return response.data;
  },
};
