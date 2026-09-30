import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { submissionZipUpload } from '../../infrastructure/storage/multer.config.js';
import { SubmissionController } from '../controllers/submission.controller.js';
import { ValidationError } from '../../shared/errors/app-error.js';
import { env } from '../../infrastructure/config/env.js';

const router = Router();

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

router.post('/submissions', uploadSingleZip, SubmissionController.submitAssignment);
router.get('/submissions/:id', SubmissionController.getSubmissionStatus);

export default router;
