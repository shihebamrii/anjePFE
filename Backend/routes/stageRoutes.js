import express from 'express';
import { getStages, getStageById, createStage, updateStage, deleteStage } from '../controllers/stageController.js';
import { protect, chefDept } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

const cpUpload = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'document', maxCount: 1 }]);

router.route('/')
  .get(getStages)
  .post(protect, chefDept, cpUpload, createStage);

router.route('/:id')
  .get(getStageById)
  .put(protect, chefDept, cpUpload, updateStage)
  .delete(protect, chefDept, deleteStage);

export default router;
