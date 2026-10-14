import { Router } from 'express';
import { uploadController } from '../controllers/upload.controller.js';
import {
  authenticateJWT,
  authorizeRoles,
} from '../../modules/auth/presentation/middlewares/auth.middleware.js';

const router = Router();

router.get('/status', authenticateJWT, authorizeRoles('ADMIN'), uploadController.getStatus);

export default router;
