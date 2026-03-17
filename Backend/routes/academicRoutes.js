import express from 'express';
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
} from '../controllers/academicController.js';
import { protect, chefDept, teacher } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Student routes ---
router.get('/schedule/student', protect, getStudentSchedule);

// --- Teacher routes ---
router.get('/schedule/teacher', protect, teacher, getTeacherSchedule);
router.get('/teacher/courses', protect, teacher, getTeacherCourses);
router.get('/teacher/classes', protect, teacher, getTeacherClasses);

// --- Chef Dept routes ---
router.get('/courses', protect, chefDept, getMyCourses);
router.get('/rooms', protect, chefDept, getRooms);
router.get('/schedule', protect, chefDept, getSchedule);
router.get('/students', protect, chefDept, getStudents);

// Student CRUD (chef only)
router.post('/students', protect, chefDept, addStudent);
router.put('/students/:id', protect, chefDept, updateStudent);
router.delete('/students/:id', protect, chefDept, deleteStudent);

// Course CRUD (chef only)
router.post('/courses', protect, chefDept, addCourse);
router.put('/courses/:id', protect, chefDept, updateCourse);
router.delete('/courses/:id', protect, chefDept, deleteCourse);

// Session CRUD (chef only)
router.post('/sessions', protect, chefDept, addSession);
router.put('/sessions/:id', protect, chefDept, updateSession);
router.delete('/sessions/:id', protect, chefDept, deleteSession);

export default router;
