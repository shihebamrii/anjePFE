import express from 'express';
import { getNews, getNewsById, createNews, updateNews, deleteNews } from '../controllers/newsController.js';
import { protect, chefDept } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

const cpUpload = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'document', maxCount: 1 }]);

router.route('/')
  .get(getNews)
  .post(protect, chefDept, cpUpload, createNews);

router.route('/:id')
  .get(getNewsById)
  .put(protect, chefDept, cpUpload, updateNews)
  .delete(protect, chefDept, deleteNews);

export default router;
