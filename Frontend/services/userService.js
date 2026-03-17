import api from './api';

export const userService = {
  getUsers: async (role = '') => {
    const query = role ? `?role=${role}` : '';
    const response = await api.get(`/users${query}`);
    return response.data;
  },
};
