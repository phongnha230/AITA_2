import { Router } from 'express';
import { JobController } from '../controllers/job.controller.js';
import { container } from '../../infrastructure/container/container.js';
import {
  authenticateJWT,
  authorizeRoles,
} from '../../modules/auth/presentation/middlewares/auth.middleware.js';
import { requireSubmissionAccess } from '../../modules/assignment/presentation/middlewares/assignment-access.middleware.js';

const router = Router();
const jobController: JobController = container.jobController;

router.get(
  '/metrics/overview',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  jobController.getQueueMetrics
);

router.get(
  '/queue/jobs',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  jobController.listQueueJobs
);

router.post(
  '/queue/retry-all',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  jobController.retryAllFailed
);

router.post(
  '/queue/clear-completed',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  jobController.clearCompleted
);

router.post(
  '/queue/flush-dead-letter',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  jobController.flushDeadLetter
);

router.post(
  '/:submissionId/retry',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  jobController.retryJob
);

router.get(
  '/:submissionId',
  authenticateJWT,
  requireSubmissionAccess,
  jobController.getJobStatus
);

// EventSource authenticates with the HttpOnly access cookie.
router.get(
  '/:submissionId/events',
  authenticateJWT,
  requireSubmissionAccess,
  jobController.streamJobEvents
);

export default router;
