import { Request, Response, NextFunction } from 'express';
import fs from 'node:fs/promises';
import { SubmitAssignmentSchema, GetSubmissionStatusSchema } from '../../application/dtos/submission.dto.js';
import { SubmitAssignmentUseCase } from '../../application/use-cases/submissions/submit-assignment.use-case.js';
import { GetSubmissionStatusUseCase } from '../../application/use-cases/submissions/get-submission-status.use-case.js';
import { submissionRepository } from '../../infrastructure/repositories/submission.repository.js';
import { zipExtractorService } from '../../infrastructure/storage/zip-extractor.service.js';
import { nullGradingDispatcher } from '../../infrastructure/queue/null-grading-dispatcher.js';
import { ValidationError, UnauthenticatedError } from '../../shared/errors/app-error.js';
import { ApiResponse } from '../../shared/types/api-response.type.js';
import { SubmissionEntity } from '../../domain/entities/submission.entity.js';
import { env } from '../../infrastructure/config/env.js';

const submitAssignmentUseCase = new SubmitAssignmentUseCase({
  submissionRepository,
  artifactExtractor: zipExtractorService,
  gradingDispatcher: nullGradingDispatcher,
});

const getSubmissionStatusUseCase = new GetSubmissionStatusUseCase(submissionRepository);

/**
 * Resolves the acting student until TV1's `auth.middleware.ts` (verifyToken)
 * is wired into this route. Outside production it also accepts `studentId`
 * in the request body so the endpoint is testable stand-alone.
 */
function resolveStudentId(req: Request): string {
  const studentId = req.user?.id ?? (env.NODE_ENV !== 'production' ? (req.body?.studentId as string | undefined) : undefined);

  if (!studentId) {
    throw new UnauthenticatedError('Cần đăng nhập bằng tài khoản Student để nộp bài');
  }

  return studentId;
}

export class SubmissionController {
  public static async submitAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    const uploadedFile = req.file;

    try {
      const studentId = resolveStudentId(req);

      const parseResult = SubmitAssignmentSchema.safeParse(req.body);
      if (!parseResult.success) {
        throw new ValidationError('Dữ liệu nộp bài không hợp lệ', parseResult.error.format());
      }

      const submission = await submitAssignmentUseCase.execute({
        ...parseResult.data,
        studentId,
        uploadedZipPath: uploadedFile?.path,
      });

      // The zip has already been extracted into the staging workspace; the
      // temp upload copy is no longer needed.
      if (uploadedFile?.path) {
        await fs.rm(uploadedFile.path, { force: true }).catch(() => {});
      }

      const body: ApiResponse<SubmissionEntity> = {
        success: true,
        message: 'Nộp bài thành công, bài làm đang được xếp hàng chờ chấm điểm',
        data: submission,
      };

      res.status(201).json(body);
    } catch (error) {
      // Clean up the temp upload if staging/validation failed after the file was saved.
      if (uploadedFile?.path) {
        await fs.rm(uploadedFile.path, { force: true }).catch(() => {});
      }
      next(error);
    }
  }

  public static async getSubmissionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parseResult = GetSubmissionStatusSchema.safeParse(req.params);
      if (!parseResult.success) {
        throw new ValidationError('submissionId không hợp lệ', parseResult.error.format());
      }

      const submission = await getSubmissionStatusUseCase.execute(parseResult.data.id);

      const body: ApiResponse<typeof submission> = {
        success: true,
        data: submission,
      };

      res.status(200).json(body);
    } catch (error) {
      next(error);
    }
  }
}
