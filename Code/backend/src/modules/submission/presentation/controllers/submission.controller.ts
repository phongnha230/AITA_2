import { Request, Response, NextFunction } from 'express';
import fs from 'node:fs/promises';
import { SubmitAssignmentUseCase } from '../../application/use-cases/submit-assignment.use-case.js';
import { GetSubmissionStatusUseCase } from '../../application/use-cases/get-submission-status.use-case.js';
import { GetAssignmentSubmissionsUseCase } from '../../application/use-cases/get-assignment-submissions.use-case.js';
import { GetAllSubmissionsUseCase } from '../../application/use-cases/get-all-submissions.use-case.js';
import { sendSuccess } from '../../../../shared/presentation/utils/api-response.util.js';
import { UnauthorizedError } from '../../../../shared/domain/exceptions/app.error.js';
import { logger } from '../../../../infrastructure/logging/logger.js';
import { SubmitTeamAssignmentUseCase } from '../../application/use-cases/submit-team-assignment.use-case.js';
import { AdjustParticipantScoreUseCase } from '../../application/use-cases/adjust-participant-score.use-case.js';
import { RegradeSubmissionUseCase } from '../../application/use-cases/regrade-submission.use-case.js';
import { GetGradingHistoryUseCase } from '../../application/use-cases/get-grading-history.use-case.js';
import { ReviewGradingRunUseCase } from '../../application/use-cases/review-grading-run.use-case.js';
import { NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';
import { ISubmissionRepository } from '../../domain/repositories/submission.repository.interface.js';


export class SubmissionController {
  constructor(
    private readonly submitAssignmentUseCase: SubmitAssignmentUseCase,
    private readonly getSubmissionStatusUseCase: GetSubmissionStatusUseCase,
    private readonly getAssignmentSubmissionsUseCase: GetAssignmentSubmissionsUseCase,
    private readonly getAllSubmissionsUseCase: GetAllSubmissionsUseCase,
    private readonly submitTeamAssignmentUseCase: SubmitTeamAssignmentUseCase,
    private readonly adjustParticipantScoreUseCase: AdjustParticipantScoreUseCase,
    private readonly regradeSubmissionUseCase: RegradeSubmissionUseCase,
    private readonly getGradingHistoryUseCase: GetGradingHistoryUseCase,
    private readonly reviewGradingRunUseCase: ReviewGradingRunUseCase,
    private readonly submissionRepository?: ISubmissionRepository
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
        try {
          await fs.rm(uploadedFile.path, { force: true });
        } catch (cleanupError) {
          logger.error('submission_upload_cleanup_failed', {
            requestId: req.header('x-request-id'),
            stage: 'UPLOAD_CLEANUP',
            error: cleanupError,
          });
        }
      }

      sendSuccess(
        res,
        submission.toJSON(),
        'Nộp bài thành công, bài làm đang được xếp hàng chờ chấm điểm.',
        201
      );
    } catch (error) {
      if (uploadedFile?.path) {
        try {
          await fs.rm(uploadedFile.path, { force: true });
        } catch (cleanupError) {
          logger.error('submission_upload_cleanup_failed', {
            requestId: req.header('x-request-id'),
            stage: 'UPLOAD_CLEANUP',
            error: cleanupError,
          });
        }
      }
      next(error);
    }
  };

  submitTeamAssignment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) throw new UnauthorizedError('Cần đăng nhập để nộp bài nhóm.');
      const submission = await this.submitTeamAssignmentUseCase.execute({
        assignmentId: req.params.assignmentId,
        teamId: req.body.teamId,
        gitCommitHash: req.body.gitCommitHash,
        userId: req.user.userId,
      });
      sendSuccess(res, submission.toJSON(), 'Đã tạo attempt nhóm và xếp hàng chấm.', 201);
    } catch (error) {
      next(error);
    }
  };

  adjustParticipantScore = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) throw new UnauthorizedError('Cần đăng nhập để điều chỉnh điểm.');
      const result = await this.adjustParticipantScoreUseCase.execute({
        submissionId: req.params.submissionId,
        participantUserId: req.params.userId,
        adjustedScore: req.body.adjustedScore,
        reason: req.body.reason,
        requestingUserId: req.user.userId,
        requestingUserRole: req.user.role,
      });
      sendSuccess(res, result, 'Đã cập nhật điểm hiệu lực của thành viên.');
    } catch (error) {
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

  regradeSubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId || !req.user.role) throw new UnauthorizedError('Cần đăng nhập để chấm lại.');
      const result = await this.regradeSubmissionUseCase.execute(req.params.id, { userId: req.user.userId, role: req.user.role });
      sendSuccess(res, result, 'Đã tạo lượt chấm mới từ đúng mã nguồn đã nộp.', 202);
    } catch (error) { next(error); }
  };

  getGradingHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId || !req.user.role) throw new UnauthorizedError('Cần đăng nhập để xem lịch sử chấm.');
      const result = await this.getGradingHistoryUseCase.execute(req.params.id, req.user.userId, req.user.role);
      sendSuccess(res, result, 'Lấy lịch sử chấm thành công.');
    } catch (error) { next(error); }
  };

  getGradingEvidence = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId || !req.user.role) throw new UnauthorizedError('Cần đăng nhập để xem bằng chứng chấm.');
      const evidence = await this.getGradingHistoryUseCase.getEvidence(
        req.params.id, req.params.runId, req.params.evidenceId, req.user.userId, req.user.role
      );
      if (!evidence) throw new NotFoundError('Bằng chứng chấm');
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.type(evidence.mimeType).sendFile(evidence.path, (error) => { if (error) next(error); });
    } catch (error) { next(error); }
  };

  reviewGradingRun = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId || !req.user.role) throw new UnauthorizedError('Cần đăng nhập để duyệt điểm.');
      const result = await this.reviewGradingRunUseCase.execute({
        runId: req.params.runId,
        requestingUserId: req.user.userId,
        requestingUserRole: req.user.role,
        finalScore: req.body.finalScore,
        reviewNote: req.body.reviewNote,
      });
      sendSuccess(res, result, 'Đã lưu duyệt điểm và công bố kết quả.');
    } catch (error) { next(error); }
  };

  getSourceFiles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const files = this.submissionRepository ? await this.submissionRepository.getSourceFiles(id) : [];
      sendSuccess(res, files, 'Danh sách mã nguồn bài nộp.');
    } catch (error) { next(error); }
  };

  downloadSubmissionZip = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!this.submissionRepository) {
        throw new NotFoundError('Repository không sẵn sàng.');
      }
      const result = await this.submissionRepository.getSubmissionZip(id);
      if (!result) {
        throw new NotFoundError('Không tìm thấy tập tin bài nộp .ZIP trên hệ thống.');
      }

      if (result.type === 'url') {
        res.redirect(result.url);
        return;
      }

      if (result.type === 'file') {
        res.download(result.path, result.filename);
        return;
      }

      if (result.type === 'buffer') {
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.setHeader('Content-Length', result.buffer.length);
        res.send(result.buffer);
        return;
      }
    } catch (error) {
      next(error);
    }
  };

  manualGradeSubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) throw new UnauthorizedError('Cần đăng nhập để chấm điểm thủ công.');
      if (!this.submissionRepository) throw new NotFoundError('Repository không sẵn sàng.');
      const { id } = req.params;
      const { finalScore, reason } = req.body;
      const result = await this.submissionRepository.manualGrade(id, req.user.userId, {
        finalScore: Number(finalScore),
        reason: String(reason || ''),
      });
      sendSuccess(res, result, 'Đã chấm bài thủ công và cập nhật điểm thành công.');
    } catch (error) {
      next(error);
    }
  };
}
