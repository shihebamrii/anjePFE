import express from 'express'; // Import express web framework
import multer from 'multer'; // Import multer for handling Excel multipart files
import { getGrades, addGrade, deleteGrade, bulkUploadGrades } from '../controllers/gradeController.js'; // Import grade handlers
import { protect, teacher } from '../middleware/authMiddleware.js'; // Import route security middlewares

const router = express.Router(); // Create Express router instance

// Configure multer to use RAM storage (memoryStorage) rather than saving files to the server disk
const upload = multer({ storage: multer.memoryStorage() });

// Resource routes for grades collection
router.route('/')
  .get(protect, getGrades) // Retrieve grades list (Filtered by student/teacher context)
  .post(protect, teacher, addGrade); // Submit single student grade (Requires Teacher role)

// Bulk upload grades using sheet parser (Uploads Excel sheet through 'file' field and parses it in-memory)
router.post('/bulk-upload', protect, teacher, upload.single('file'), bulkUploadGrades);

// Single grade resource endpoint
router.route('/:id')
  .delete(protect, teacher, deleteGrade); // Remove a student's grade record

export default router; // Export grades routing configuration bundle
