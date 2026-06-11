// Import the configured base API Axios client
import api from './api';

// Export an eventService object containing methods for scheduling and calendar events
export const eventService = {
  // Fetch calendar events, with optional filters for event type and target audience (role)
  getEvents: async (type = '', audience = '') => {
    // Construct query parameters dynamically
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (audience) params.append('audience', audience);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    // Send a GET request to fetch the events matching filters
    const response = await api.get(`/events${query}`);
    return response.data;
  },

  // Fetch the full details of a specific event using its database ID
  getEventById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  // Create a new event. Checks if eventData is FormData (for supporting image attachments)
  createEvent: async (eventData) => {
    const isFormData = eventData instanceof FormData;
    const response = await api.post('/events', eventData, {
      // Set appropriate multipart header if sending FormData, otherwise let it default to JSON
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  // Update details of an existing event by its ID. Also supports FormData for image changes
  updateEvent: async (id, eventData) => {
    const isFormData = eventData instanceof FormData;
    const response = await api.put(`/events/${id}`, eventData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  // Delete/cancel an event by its database ID
  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },
};
