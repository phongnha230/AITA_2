import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../../../auth/presentation/middlewares/auth.middleware.js';
import { createAuthRateLimiter } from '../../../auth/presentation/middlewares/auth-rate-limit.middleware.js';
import { requireSubmissionAccess } from '../../../assignment/presentation/middlewares/assignment-access.middleware.js';
import { validateBody } from '../../../../shared/presentation/middlewares/validate.middleware.js';
import { executeSandboxSchema } from '../../application/dtos/sandbox.dto.js';
import { SandboxController } from '../controllers/sandbox.controller.js';
import { enforceSandboxPayloadLimits } from '../middlewares/sandbox-limits.middleware.js';

const router = Router();
const directExecutionLimiter = createAuthRateLimiter({
  scope: 'sandbox-execute',
  max: 10,
  windowSeconds: 60,
  identity: (request) => request.user?.userId ?? 'anonymous',
});

router.get('/health', SandboxController.health);
router.get(
  '/status',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  SandboxController.getStatus
);

router.post(
  '/execute',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  directExecutionLimiter,
  enforceSandboxPayloadLimits,
  validateBody(executeSandboxSchema),
  SandboxController.executeCode
);

router.post(
  '/grade/:submissionId',
  authenticateJWT,
  authorizeRoles('ADMIN', 'LECTURER'),
  requireSubmissionAccess,
  SandboxController.gradeSubmission
);

export default router;
