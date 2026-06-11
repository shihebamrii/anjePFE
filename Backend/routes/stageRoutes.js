// Import the Express framework
import express from 'express';
// Import control functions for internships (stages) from the controller
import { getStages, getStageById, createStage, updateStage, deleteStage } from '../controllers/stageController.js';
// Import authorization middleware (protect verifies logging in, chefDept verifies department head access)
import { protect, chefDept } from '../middleware/authMiddleware.js';
// Import the file upload middleware
import upload from '../middleware/uploadMiddleware.js';

// Create a new router instance
const router = express.Router();

// Configure the upload middleware to accept up to 1 image file and 1 document file
const cpUpload = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'document', maxCount: 1 }]);

// Define routes for the root path: '/api/stages'
router.route('/')
  // Anyone can request a list of available internship offers (Public route)
  .get(getStages)
  // Only logged-in department heads can create a new internship offer (requires files upload)
  .post(protect, chefDept, cpUpload, createStage);

// Define routes with a specific internship ID: '/api/stages/:id'
router.route('/:id')
  // Anyone can retrieve the details of a single internship offer by its ID (Public route)
  .get(getStageById)
  // Only logged-in department heads can update an internship (e.g. changing info or adding new files)
  .put(protect, chefDept, cpUpload, updateStage)
  // Only logged-in department heads can delete an internship offer
  .delete(protect, chefDept, deleteStage);

// Export the router configuration
export default router;
