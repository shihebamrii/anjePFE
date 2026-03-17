import api from './api';

export const academicService = {
  // Get courses based on chef's department
  getMyCourses: async () => {
    const response = await api.get('/academic/courses');
    return response.data;
  },

  // Get all available rooms
  getRooms: async () => {
    const response = await api.get('/academic/rooms');
    return response.data;
  },

  // Get timetable for a specific class
  getSchedule: async (classId) => {
    const response = await api.get(`/academic/schedule?classId=${classId}`);
    return response.data;
  },

  // Get department students
  getStudents: async () => {
    const response = await api.get('/academic/students');
    return response.data;
  },

  // Get student schedule
  getStudentSchedule: async () => {
    const response = await api.get(`/academic/schedule/student`);
    return response.data;
  },

  // Get teacher schedule
  getTeacherSchedule: async () => {
    const response = await api.get(`/academic/schedule/teacher`);
    return response.data;
  },

  // Get teacher's courses (derived from sessions)
  getTeacherCourses: async () => {
    const response = await api.get('/academic/teacher/courses');
    return response.data;
  },

  // Get teacher's classes (derived from sessions)
  getTeacherClasses: async () => {
    const response = await api.get('/academic/teacher/classes');
    return response.data;
  },

  // Student CRUD
  addStudent: async (data) => {
    const response = await api.post('/academic/students', data);
    return response.data;
  },
  updateStudent: async (id, data) => {
    const response = await api.put(`/academic/students/${id}`, data);
    return response.data;
  },
  deleteStudent: async (id) => {
    const response = await api.delete(`/academic/students/${id}`);
    return response.data;
  },

  // Course CRUD
  addCourse: async (data) => {
    const response = await api.post('/academic/courses', data);
    return response.data;
  },
  updateCourse: async (id, data) => {
    const response = await api.put(`/academic/courses/${id}`, data);
    return response.data;
  },
  deleteCourse: async (id) => {
    const response = await api.delete(`/academic/courses/${id}`);
    return response.data;
  },

  // Session CRUD
  addSession: async (data) => {
    const response = await api.post('/academic/sessions', data);
    return response.data;
  },
  updateSession: async (id, data) => {
    const response = await api.put(`/academic/sessions/${id}`, data);
    return response.data;
  },
  deleteSession: async (id) => {
    const response = await api.delete(`/academic/sessions/${id}`);
    return response.data;
  },
};
