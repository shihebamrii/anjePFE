import express from 'express'; // Import express web framework
import { getEvents, getEventById, createEvent, updateEvent, deleteEvent } from '../controllers/eventController.js'; // Import events handlers
import { protect, teacher } from '../middleware/authMiddleware.js'; // Import security permission middlewares
import upload from '../middleware/uploadMiddleware.js'; // Import file upload middleware

const router = express.Router(); // Create Express router instance

// Configure upload.fields to handle multiple files in a single form (image and document attachments)
const cpUpload = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'document', maxCount: 1 }]);

// Resource routes for events collection
router.route('/')
  .get(getEvents) // Fetch list of scheduled events/deadlines (Public access)
  .post(protect, teacher, cpUpload, createEvent); // Create a new event with attachments (Requires Teacher role)

// Single resource endpoints for target event ID
router.route('/:id')
  .get(getEventById) // Retrieve details of a specific event (Public access)
  .put(protect, teacher, cpUpload, updateEvent) // Edit/modify existing event details (Requires Teacher role)
  .delete(protect, teacher, deleteEvent); // Remove an event listing (Requires Teacher role)

export default router; // Export events routing configuration bundle
