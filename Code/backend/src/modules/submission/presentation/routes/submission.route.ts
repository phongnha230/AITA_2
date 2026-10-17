import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { submissionZipUpload } from '../..//infrastructure/storage/multer.config.js';
import { container } from '../../../../infrastructure/container/container.js';
import { authenticateJWT, authorizeRoles } from '../../../auth/presentation/middlewares/auth.middleware.js';
import { ValidationError } from '../../../../shared/domain/exceptions/app.error.js';
import { env } from '../../../../infrastructure/config/env.js';
import { validateBody } from '../../../../shared/presentation/middlewares/validate.middleware.js';
import { AdjustParticipantScoreSchema, ReviewGradingRunSchema } from '../../application/dtos/submission.dto.js';
import {
  requireAssignmentManage,
  requireSubmissionAccess,
} from '../../../assignment/presentation/middlewares/assignment-access.middleware.js';

const router = Router();

const submissionController = container.submissionController;

router.post(
  '/grading-runs/:runId/review',
  authenticateJWT,
  authorizeRoles('LECTURER', 'ADMIN'),
  validateBody(ReviewGradingRunSchema),
  submissionController.reviewGradingRun
);

function uploadSingleZip(req: Request, res: Response, next: NextFunction): void {
  submissionZipUpload.single('file')(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }

    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      next(new ValidationError(`File .zip vượt quá giới hạn ${env.MAX_FILE_SIZE_MB}MB`));
      return;
    }

    next(err);
  });
}

// Routes
router.get('/', authenticateJWT, authorizeRoles('ADMIN'), submissionController.getAllSubmissions);
router.post('/', authenticateJWT, uploadSingleZip, submissionController.submitAssignment);
router.patch(
  '/:submissionId/participants/:userId/score',
  authenticateJWT,
  authorizeRoles('LECTURER', 'ADMIN'),
  validateBody(AdjustParticipantScoreSchema),
  submissionController.adjustParticipantScore
);
router.get(
  '/assignment/:assignmentId',
  authenticateJWT,
  authorizeRoles('LECTURER', 'ADMIN'),
  requireAssignmentManage,
  submissionController.getSubmissionsByAssignment
);
router.get('/:id/grading-history', authenticateJWT, requireSubmissionAccess, submissionController.getGradingHistory);
router.get('/:id/grading-history/:runId/evidence/:evidenceId', authenticateJWT, requireSubmissionAccess, submissionController.getGradingEvidence);
router.post(
  '/:id/grading-runs',
  authenticateJWT,
  authorizeRoles('LECTURER', 'ADMIN'),
  requireSubmissionAccess,
  submissionController.regradeSubmission
);
router.get('/:id', authenticateJWT, requireSubmissionAccess, submissionController.getSubmissionStatus);

export default router;
