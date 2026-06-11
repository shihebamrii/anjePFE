// Import the configured base API Axios client
import api from './api';

// Export a newsService object containing methods for announcements and news posts
export const newsService = {
  // Fetch news articles, with optional filters for category and priority type (urgent/normal)
  getNews: async (category = 'all', type = '') => {
    // Construct query parameters dynamically
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (type) params.append('type', type);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    // Send a GET request to retrieve news list matching filters
    const response = await api.get(`/news${query}`);
    return response.data;
  },

  // Fetch full details of a specific news article by its database ID
  getNewsById: async (id) => {
    const response = await api.get(`/news/${id}`);
    return response.data;
  },

  // Create a new announcement. Supports FormData for attachments like flyer images or PDF attachments
  createNews: async (newsData) => {
    const isFormData = newsData instanceof FormData;
    const response = await api.post('/news', newsData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  // Update details of an existing news post by its database ID
  updateNews: async (id, newsData) => {
    const isFormData = newsData instanceof FormData;
    const response = await api.put(`/news/${id}`, newsData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  // Delete/remove a news article from the portal by its database ID
  deleteNews: async (id) => {
    const response = await api.delete(`/news/${id}`);
    return response.data;
  },
};
