import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { submissionZipUpload } from '../..//infrastructure/storage/multer.config.js';
import { SubmissionController } from '../controllers/submission.controller.js';
import { SubmitAssignmentUseCase } from '../../application/use-cases/submit-assignment.use-case.js';
import { GetSubmissionStatusUseCase } from '../../application/use-cases/get-submission-status.use-case.js';
import { PrismaSubmissionRepository } from '../../infrastructure/repositories/prisma-submission.repository.js';
import { zipExtractorService } from '../../infrastructure/storage/zip-extractor.service.js';
import { bullmqGradingDispatcher } from '../../infrastructure/queue/bullmq-grading-dispatcher.js';
import prisma from '../../../../infrastructure/database/prisma.client.js';
import { authenticateJWT } from '../../../auth/presentation/middlewares/auth.middleware.js';
import { ValidationError } from '../../../../shared/domain/exceptions/app.error.js';
import { env } from '../../../../infrastructure/config/env.js';

const router = Router();

// Composition Root
const submissionRepository = new PrismaSubmissionRepository(prisma);
const submitAssignmentUseCase = new SubmitAssignmentUseCase({
  submissionRepository,
  artifactExtractor: zipExtractorService,
  gradingDispatcher: bullmqGradingDispatcher,
});

const getSubmissionStatusUseCase = new GetSubmissionStatusUseCase(submissionRepository);

const submissionController = new SubmissionController(
  submitAssignmentUseCase,
  getSubmissionStatusUseCase
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
router.post('/', authenticateJWT, uploadSingleZip, submissionController.submitAssignment);
router.get('/:id', authenticateJWT, submissionController.getSubmissionStatus);

export default router;
