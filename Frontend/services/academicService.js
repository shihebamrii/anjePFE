// Import the configured base API Axios client
import api from './api';

// Export an academicService object containing methods for academic resources
export const academicService = {
  // Fetch courses belonging to the logged-in Department Head's department
  getMyCourses: async () => {
    const response = await api.get('/academic/courses');
    return response.data;
  },

  // Fetch all classrooms/rooms available in the system
  getRooms: async () => {
    const response = await api.get('/academic/rooms');
    return response.data;
  },

  // Fetch the timetable/schedule for a specific class group using its classId
  getSchedule: async (classId) => {
    const response = await api.get(`/academic/schedule?classId=${classId}`);
    return response.data;
  },

  // Fetch students belonging to the department of the logged-in Department Head
  getStudents: async () => {
    const response = await api.get('/academic/students');
    return response.data;
  },

  // Fetch the schedule/timetable for the logged-in student user
  getStudentSchedule: async () => {
    const response = await api.get(`/academic/schedule/student`);
    return response.data;
  },

  // Fetch the schedule/timetable for the logged-in teacher user
  getTeacherSchedule: async () => {
    const response = await api.get(`/academic/schedule/teacher`);
    return response.data;
  },

  // Fetch list of courses assigned to the logged-in teacher (derived from scheduled sessions)
  getTeacherCourses: async () => {
    const response = await api.get('/academic/teacher/courses');
    return response.data;
  },

  // Fetch list of classes assigned to the logged-in teacher (derived from scheduled sessions)
  getTeacherClasses: async () => {
    const response = await api.get('/academic/teacher/classes');
    return response.data;
  },

  // --- Student CRUD Operations ---
  
  // Register/add a new student to the department
  addStudent: async (data) => {
    const response = await api.post('/academic/students', data);
    return response.data;
  },
  
  // Update details of a student by their database ID
  updateStudent: async (id, data) => {
    const response = await api.put(`/academic/students/${id}`, data);
    return response.data;
  },
  
  // Delete/remove a student by their database ID
  deleteStudent: async (id) => {
    const response = await api.delete(`/academic/students/${id}`);
    return response.data;
  },

  // --- Course CRUD Operations ---
  
  // Create/add a new course subject
  addCourse: async (data) => {
    const response = await api.post('/academic/courses', data);
    return response.data;
  },
  
  // Update details of a course by its database ID
  updateCourse: async (id, data) => {
    const response = await api.put(`/academic/courses/${id}`, data);
    return response.data;
  },
  
  // Delete/remove a course by its database ID
  deleteCourse: async (id) => {
    const response = await api.delete(`/academic/courses/${id}`);
    return response.data;
  },

  // --- Session (Timetable Slot) CRUD Operations ---
  
  // Create/schedule a new class session/slot
  addSession: async (data) => {
    const response = await api.post('/academic/sessions', data);
    return response.data;
  },
  
  // Update scheduling details of an existing session by its database ID
  updateSession: async (id, data) => {
    const response = await api.put(`/academic/sessions/${id}`, data);
    return response.data;
  },
  
  // Delete/cancel a scheduled session by its database ID
  deleteSession: async (id) => {
    const response = await api.delete(`/academic/sessions/${id}`);
    return response.data;
  },
};
