// Import the configured base API Axios client
import api from './api';

// Export a complaintService object containing methods for student complaints/appeals
export const complaintService = {
  // Fetch a list of complaints (filters are applied server-side based on user role)
  getComplaints: async () => {
    const response = await api.get('/complaints');
    return response.data;
  },

  // Submit/file a new grade contestation or complaint
  createComplaint: async (data) => {
    const response = await api.post('/complaints', data);
    return response.data;
  },

  // Update a complaint status (e.g. resolve it with ACCEPTED or REJECTED status) by ID
  resolveComplaint: async (id, data) => {
    const response = await api.put(`/complaints/${id}/resolve`, data);
    return response.data;
  },
};
