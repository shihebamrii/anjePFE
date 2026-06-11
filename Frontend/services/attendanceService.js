// Import the configured base API Axios client
import api from './api';

// Export an attendanceService object containing methods for attendance management
export const attendanceService = {
  // Fetch attendance records, with optional filtering by date and/or studentId
  getAttendance: async (date = '', studentId = '') => {
    // Construct the query parameters dynamically
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (studentId) params.append('studentId', studentId);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    // Send a GET request to retrieve matching attendance records
    const response = await api.get(`/attendance${query}`);
    return response.data;
  },

  // Save/log attendance for a single student
  markAttendance: async (attendanceData) => {
    const response = await api.post('/attendance', attendanceData);
    return response.data;
  },

  // Save/log attendance for multiple students simultaneously
  markBulkAttendance: async (data) => {
    const response = await api.post('/attendance/bulk', data);
    return response.data;
  },

  // Retrieve students assigned to a specific class group name
  getStudentsByClass: async (className) => {
    const response = await api.get(`/attendance/students-by-class?className=${encodeURIComponent(className)}`);
    return response.data;
  },

  // Update a student's attendance record (e.g. justify an absence or change status) by record ID
  updateAttendance: async (id, data) => {
    const response = await api.put(`/attendance/${id}`, data);
    return response.data;
  },

  // Delete/remove an attendance record by its database ID
  deleteAttendance: async (id) => {
    const response = await api.delete(`/attendance/${id}`);
    return response.data;
  },
};
