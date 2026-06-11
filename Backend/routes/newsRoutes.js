import express from 'express'; // Import express web framework
import { getNews, getNewsById, createNews, updateNews, deleteNews } from '../controllers/newsController.js'; // Import news controller handlers
import { protect, chefDept } from '../middleware/authMiddleware.js'; // Import route security permissions middleware
import upload from '../middleware/uploadMiddleware.js'; // Import multer static file uploader

const router = express.Router(); // Initialize a new router instance

// Configure upload.fields to parse form attachments (cover image and supplementary documents)
const cpUpload = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'document', maxCount: 1 }]);

// Resource routes for news collection
router.route('/')
  .get(getNews) // Fetch all published news articles (Public access)
  .post(protect, chefDept, cpUpload, createNews); // Post a new news article with attachments (Requires Chef de Département or higher)

// Single resource endpoints for target news ID
router.route('/:id')
  .get(getNewsById) // Fetch details of a single news article (Public access)
  .put(protect, chefDept, cpUpload, updateNews) // Edit/modify existing news article details (Requires Chef de Département or higher)
  .delete(protect, chefDept, deleteNews); // Remove news article (Requires Chef de Département or higher)

export default router; // Export news routing configuration bundle
