import api from './api';

export const eventService = {
  getEvents: async (type = '', audience = '') => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (audience) params.append('audience', audience);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/events${query}`);
    return response.data;
  },

  getEventById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  createEvent: async (eventData) => {
    const isFormData = eventData instanceof FormData;
    const response = await api.post('/events', eventData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  updateEvent: async (id, eventData) => {
    const isFormData = eventData instanceof FormData;
    const response = await api.put(`/events/${id}`, eventData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },
};
