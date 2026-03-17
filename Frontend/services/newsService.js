import api from './api';

export const newsService = {
  getNews: async (category = 'all', type = '') => {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (type) params.append('type', type);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/news${query}`);
    return response.data;
  },

  getNewsById: async (id) => {
    const response = await api.get(`/news/${id}`);
    return response.data;
  },

  createNews: async (newsData) => {
    const isFormData = newsData instanceof FormData;
    const response = await api.post('/news', newsData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  updateNews: async (id, newsData) => {
    const isFormData = newsData instanceof FormData;
    const response = await api.put(`/news/${id}`, newsData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  deleteNews: async (id) => {
    const response = await api.delete(`/news/${id}`);
    return response.data;
  },
};
