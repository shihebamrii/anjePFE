import express from 'express';
import multer from 'multer';
import { getGrades, addGrade, deleteGrade, bulkUploadGrades } from '../controllers/gradeController.js';
import { protect, teacher } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer config — memory storage (no disk writes)
const upload = multer({ storage: multer.memoryStorage() });

router.route('/')
  .get(protect, getGrades)
  .post(protect, teacher, addGrade);

router.post('/bulk-upload', protect, teacher, upload.single('file'), bulkUploadGrades);

router.route('/:id')
  .delete(protect, teacher, deleteGrade);

export default router;
