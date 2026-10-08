import { Router } from 'express';

import {
  JobController,
} from '../controllers/job.controller.js';


const router = Router();


/**
 * GET /jobs/:submissionId
 *
 * Lấy progress / lifecycle của grading job.
 */
router.get(
  '/:submissionId',
  JobController.getJobStatus
);

/**
 * GET /jobs/:submissionId/events
 *
 * Server-Sent Events (SSE) để Frontend lắng nghe tiến trình chấm bài Realtime.
 */
router.get(
  '/:submissionId/events',
  JobController.streamJobEvents
);

export default router;