import express from 'express';
import { getEvents, getEventById, createEvent, updateEvent, deleteEvent } from '../controllers/eventController.js';
import { protect, chefDept } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

const cpUpload = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'document', maxCount: 1 }]);

router.route('/')
  .get(getEvents)
  .post(protect, chefDept, cpUpload, createEvent);

router.route('/:id')
  .get(getEventById)
  .put(protect, chefDept, cpUpload, updateEvent)
  .delete(protect, chefDept, deleteEvent);

export default router;
