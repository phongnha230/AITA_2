import { Request, Response, NextFunction } from 'express';
import fs from 'node:fs/promises';
import { SubmitAssignmentUseCase } from '../../application/use-cases/submit-assignment.use-case.js';
import { GetSubmissionStatusUseCase } from '../../application/use-cases/get-submission-status.use-case.js';
import { GetAssignmentSubmissionsUseCase } from '../../application/use-cases/get-assignment-submissions.use-case.js';
import { GetAllSubmissionsUseCase } from '../../application/use-cases/get-all-submissions.use-case.js';
import { sendSuccess } from '../../../../shared/presentation/utils/api-response.util.js';
import { UnauthorizedError } from '../../../../shared/domain/exceptions/app.error.js';


export class SubmissionController {
  constructor(
    private readonly submitAssignmentUseCase: SubmitAssignmentUseCase,
    private readonly getSubmissionStatusUseCase: GetSubmissionStatusUseCase,
    private readonly getAssignmentSubmissionsUseCase: GetAssignmentSubmissionsUseCase,
    private readonly getAllSubmissionsUseCase: GetAllSubmissionsUseCase
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
      const requestingUserId = req.user?.userId ?? '';
      const requestingUserRole = req.user?.role ?? '';
      const submission = await this.getSubmissionStatusUseCase.execute({
        id: req.params.id,
        requestingUserId,
        requestingUserRole,
      });
      sendSuccess(res, submission, 'Lấy trạng thái bài nộp thành công.');
    } catch (error) {
      next(error);
    }
  };

  getSubmissionsByAssignment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const submissions = await this.getAssignmentSubmissionsUseCase.execute(req.params.assignmentId);
      sendSuccess(res, submissions, 'Lấy danh sách bài nộp theo đề thi thành công.');
    } catch (error) {
      next(error);
    }
  };

  getAllSubmissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
      const result = await this.getAllSubmissionsUseCase.execute(req.query as any);
      sendSuccess(res, result.submissions, 'Lấy danh sách bài nộp toàn trường thành công.', 200, {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit) || 1,
      });
    } catch (error) {
      next(error);
    }
  };
}
