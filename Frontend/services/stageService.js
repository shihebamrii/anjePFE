// Import the configured base API Axios client
import api from './api';

// Export a stageService object containing methods to manage internship/stage offers
export const stageService = {
  // Fetch internship offers, with optional filters for type (e.g. PFE) and status (e.g. OPEN/CLOSED)
  getStages: async (type = '', status = '') => {
    // Construct query parameters dynamically
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    // Send a GET request to retrieve internships matching filters
    const response = await api.get(`/stages${query}`);
    return response.data;
  },

  // Fetch detailed information of a single internship offer using its database ID
  getStageById: async (id) => {
    const response = await api.get(`/stages/${id}`);
    return response.data;
  },

  // Post/create a new internship offer. Supports FormData for uploading flyers or PDF booklets
  createStage: async (stageData) => {
    const isFormData = stageData instanceof FormData;
    const response = await api.post('/stages', stageData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  // Update details of an existing internship offer by its database ID
  updateStage: async (id, data) => {
    const isFormData = data instanceof FormData;
    const response = await api.put(`/stages/${id}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  // Remove/delete an internship offer by its database ID
  deleteStage: async (id) => {
    const response = await api.delete(`/stages/${id}`);
    return response.data;
  },
};
