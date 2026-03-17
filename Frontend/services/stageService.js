import api from './api';

export const stageService = {
  getStages: async (type = '', status = '') => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/stages${query}`);
    return response.data;
  },

  getStageById: async (id) => {
    const response = await api.get(`/stages/${id}`);
    return response.data;
  },

  createStage: async (stageData) => {
    const isFormData = stageData instanceof FormData;
    const response = await api.post('/stages', stageData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  updateStage: async (id, data) => {
    const isFormData = data instanceof FormData;
    const response = await api.put(`/stages/${id}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  deleteStage: async (id) => {
    const response = await api.delete(`/stages/${id}`);
    return response.data;
  },
};
