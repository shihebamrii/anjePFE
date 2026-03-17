import express from 'express';
import {
  getAttendance,
  markAttendance,
  markBulkAttendance,
  getStudentsByClass,
  updateAttendance,
  deleteAttendance,
} from '../controllers/attendanceController.js';
import { protect, teacher } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getAttendance)
  .post(protect, teacher, markAttendance);

router.post('/bulk', protect, teacher, markBulkAttendance);
router.get('/students-by-class', protect, teacher, getStudentsByClass);

router.route('/:id')
  .put(protect, teacher, updateAttendance)
  .delete(protect, teacher, deleteAttendance);

export default router;
