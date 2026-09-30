import { Request, Response, NextFunction } from 'express';
import fs from 'node:fs/promises';
import { SubmitAssignmentUseCase } from '../../application/use-cases/submit-assignment.use-case.js';
import { GetSubmissionStatusUseCase } from '../../application/use-cases/get-submission-status.use-case.js';
import { sendSuccess } from '../../../../shared/presentation/utils/api-response.util.js';
import { UnauthorizedError } from '../../../../shared/domain/exceptions/app.error.js';


export class SubmissionController {
  constructor(
    private readonly submitAssignmentUseCase: SubmitAssignmentUseCase,
    private readonly getSubmissionStatusUseCase: GetSubmissionStatusUseCase
  ) {}

  submitAssignment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const uploadedFile = req.file;

    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError('Cần đăng nhập tài khoản để thực hiện nộp bài');
      }

      const submission = await this.submitAssignmentUseCase.execute({
        ...req.body,
        userId,
        uploadedZipPath: uploadedFile?.path,
        uploadedZipSize: uploadedFile?.size,
      });

      // Cleanup temp file if needed
      if (uploadedFile?.path) {
        await fs.rm(uploadedFile.path, { force: true }).catch(() => {});
      }

      sendSuccess(
        res,
        submission.toJSON(),
        'Nộp bài thành công, bài làm đang được xếp hàng chờ chấm điểm.',
        201
      );
    } catch (error) {
      if (uploadedFile?.path) {
        await fs.rm(uploadedFile.path, { force: true }).catch(() => {});
      }
      next(error);
    }
  };

  getSubmissionStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const submission = await this.getSubmissionStatusUseCase.execute(req.params.id);
      sendSuccess(res, submission, 'Lấy trạng thái bài nộp thành công.');
    } catch (error) {
      next(error);
    }
  };
}
