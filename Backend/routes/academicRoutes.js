import express from 'express'; // Import Express web framework
import {
  getMyCourses,
  getRooms,
  getSchedule,
  getStudents,
  getStudentSchedule,
  getTeacherSchedule,
  getTeacherCourses,
  getTeacherClasses,
  addStudent,
  updateStudent,
  deleteStudent,
  addCourse,
  updateCourse,
  deleteCourse,
  addSession,
  updateSession,
  deleteSession,
} from '../controllers/academicController.js'; // Import controller handler functions
import { protect, chefDept, teacher } from '../middleware/authMiddleware.js'; // Import security auth guards

const router = express.Router(); // Initialize Express router instance

// --- Student routes ---
// Retrieve class schedule for the logged-in student (Requires JWT token authentication)
router.get('/schedule/student', protect, getStudentSchedule);

// --- Teacher routes ---
// Retrieve class schedule for the logged-in teacher (Requires JWT token and teacher role verification)
router.get('/schedule/teacher', protect, teacher, getTeacherSchedule);
// Retrieve courses assigned to the logged-in teacher
router.get('/teacher/courses', protect, teacher, getTeacherCourses);
// Retrieve list of unique classes/cohorts taught by the teacher
router.get('/teacher/classes', protect, teacher, getTeacherClasses);

// --- Chef Dept routes ---
// Retrieve courses registered to the chef's department
router.get('/courses', protect, chefDept, getMyCourses);
// Retrieve all campus rooms list
router.get('/rooms', protect, chefDept, getRooms);
// Retrieve schedule for a specific class ID
router.get('/schedule', protect, chefDept, getSchedule);
// Retrieve students belonging to the chef's department
router.get('/students', protect, chefDept, getStudents);

// Student CRUD (Chef de Département access only)
// Add a new student profile
router.post('/students', protect, chefDept, addStudent);
// Edit/modify existing student profile
router.put('/students/:id', protect, chefDept, updateStudent);
// Remove a student profile
router.delete('/students/:id', protect, chefDept, deleteStudent);

// Course CRUD (Chef de Département access only)
// Add a new academic course subject
router.post('/courses', protect, chefDept, addCourse);
// Edit/modify existing course subject details
router.put('/courses/:id', protect, chefDept, updateCourse);
// Remove a course subject
router.delete('/courses/:id', protect, chefDept, deleteCourse);

// Session CRUD (Chef de Département access only)
// Add a new scheduled timetable class session
router.post('/sessions', protect, chefDept, addSession);
// Edit/modify existing scheduled session details
router.put('/sessions/:id', protect, chefDept, updateSession);
// Remove a scheduled session from the timetable
router.delete('/sessions/:id', protect, chefDept, deleteSession);

export default router; // Export the router bundle
