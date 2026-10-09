import { Router } from 'express';

import {
  JobController,
} from '../controllers/job.controller.js';
import { authenticateJWT } from '../../modules/auth/presentation/middlewares/auth.middleware.js';


const router = Router();


/**
 * GET /jobs/:submissionId
 *
 * Lấy progress / lifecycle của grading job.
 * Yêu cầu đăng nhập để tránh lộ trạng thái bài nộp.
 */
router.get(
  '/:submissionId',
  authenticateJWT,
  JobController.getJobStatus
);

/**
 * GET /jobs/:submissionId/events
 *
 * Server-Sent Events (SSE) để Frontend lắng nghe tiến trình chấm bài Realtime.
 * Yêu cầu đăng nhập — token được truyền qua query param ?token= do SSE không hỗ trợ header.
 */
router.get(
  '/:submissionId/events',
  authenticateJWT,
  JobController.streamJobEvents
);

export default router;