import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { submissionZipUpload } from '../..//infrastructure/storage/multer.config.js';
import { SubmissionController } from '../controllers/submission.controller.js';
import { SubmitAssignmentUseCase } from '../../application/use-cases/submit-assignment.use-case.js';
import { GetSubmissionStatusUseCase } from '../../application/use-cases/get-submission-status.use-case.js';
import { GetAssignmentSubmissionsUseCase } from '../../application/use-cases/get-assignment-submissions.use-case.js';
import { GetAllSubmissionsUseCase } from '../../application/use-cases/get-all-submissions.use-case.js';
import { PrismaSubmissionRepository } from '../../infrastructure/repositories/prisma-submission.repository.js';
import { zipExtractorService } from '../../infrastructure/storage/zip-extractor.service.js';
import { bullmqGradingDispatcher } from '../../infrastructure/queue/bullmq-grading-dispatcher.js';
import prisma from '../../../../infrastructure/database/prisma.client.js';
import { authenticateJWT, authorizeRoles } from '../../../auth/presentation/middlewares/auth.middleware.js';
import { ValidationError } from '../../../../shared/domain/exceptions/app.error.js';
import { PrismaAssignmentRepository } from '../../../assignment/infrastructure/repositories/prisma-assignment.repository.js';
import { PrismaCourseRepository } from '../../../course/infrastructure/repositories/prisma-course.repository.js';
import { env } from '../../../../infrastructure/config/env.js';

const router = Router();

// Composition Root
const submissionRepository = new PrismaSubmissionRepository(prisma);
const assignmentRepository = new PrismaAssignmentRepository(prisma);
const courseRepository = new PrismaCourseRepository(prisma);

const submitAssignmentUseCase = new SubmitAssignmentUseCase({
  submissionRepository,
  assignmentRepository,
  courseRepository,
  artifactExtractor: zipExtractorService,
  gradingDispatcher: bullmqGradingDispatcher,
});

const getSubmissionStatusUseCase = new GetSubmissionStatusUseCase(submissionRepository);
const getAssignmentSubmissionsUseCase = new GetAssignmentSubmissionsUseCase(submissionRepository);
const getAllSubmissionsUseCase = new GetAllSubmissionsUseCase(submissionRepository);

const submissionController = new SubmissionController(
  submitAssignmentUseCase,
  getSubmissionStatusUseCase,
  getAssignmentSubmissionsUseCase,
  getAllSubmissionsUseCase
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
router.get(
  '/assignment/:assignmentId',
  authenticateJWT,
  authorizeRoles('LECTURER', 'ADMIN'),
  submissionController.getSubmissionsByAssignment
);
router.get('/:id', authenticateJWT, submissionController.getSubmissionStatus);

export default router;
