import express from 'express';
import { getEvents, getEventById, createEvent, updateEvent, deleteEvent } from '../controllers/eventController.js';
import { protect, teacher } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

const cpUpload = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'document', maxCount: 1 }]);

router.route('/')
  .get(getEvents)
  .post(protect, teacher, cpUpload, createEvent);

router.route('/:id')
  .get(getEventById)
  .put(protect, teacher, cpUpload, updateEvent)
  .delete(protect, teacher, deleteEvent);

export default router;
