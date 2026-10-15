import { Router } from 'express';
import { JobController } from '../controllers/job.controller.js';
import {
  authenticateJWT,
  authorizeRoles,
} from '../../modules/auth/presentation/middlewares/auth.middleware.js';
import { requireSubmissionAccess } from '../../modules/assignment/presentation/middlewares/assignment-access.middleware.js';

const router = Router();

router.get(
  '/metrics/overview',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  JobController.getQueueMetrics
);

router.get(
  '/queue/jobs',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  JobController.listQueueJobs
);

router.post(
  '/queue/retry-all',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  JobController.retryAllFailed
);

router.post(
  '/queue/clear-completed',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  JobController.clearCompleted
);

router.post(
  '/queue/flush-dead-letter',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  JobController.flushDeadLetter
);

router.post(
  '/:submissionId/retry',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  JobController.retryJob
);

router.get(
  '/:submissionId',
  authenticateJWT,
  requireSubmissionAccess,
  JobController.getJobStatus
);

// EventSource authenticates with the HttpOnly access cookie.
router.get(
  '/:submissionId/events',
  authenticateJWT,
  requireSubmissionAccess,
  JobController.streamJobEvents
);

export default router;
