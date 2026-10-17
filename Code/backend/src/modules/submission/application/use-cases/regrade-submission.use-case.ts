import { ISubmissionRepository } from '../../domain/repositories/submission.repository.interface.js';
import { IAssignmentRepository } from '../../../assignment/domain/repositories/assignment.repository.interface.js';
import { ICourseRepository } from '../../../course/domain/repositories/course.repository.interface.js';
import { IArtifactExtractor } from '../services/artifact-extractor.interface.js';
import { IGradingDispatcher } from '../services/grading-dispatcher.interface.js';
import { workspaceService } from '../../infrastructure/storage/workspace.service.js';
import { logger } from '../../../../infrastructure/logging/logger.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../../shared/domain/exceptions/app.error.js';

export class RegradeSubmissionUseCase {
  constructor(
    private readonly submissionRepository: ISubmissionRepository,
    private readonly assignmentRepository: IAssignmentRepository,
    private readonly courseRepository: ICourseRepository,
    private readonly artifactExtractor: IArtifactExtractor,
    private readonly gradingDispatcher: IGradingDispatcher
  ) {}

  async execute(submissionId: string, actor: { userId: string; role: string }) {
    try {
      if (actor.role !== 'ADMIN' && actor.role !== 'LECTURER') throw new ForbiddenError('Chỉ giảng viên hoặc admin mới được chấm lại.');
      const submission = await this.submissionRepository.findById(submissionId);
      if (!submission) throw new NotFoundError(`Bài nộp với ID: ${submissionId}`);
      const assignment = await this.assignmentRepository.findById(submission.assignmentId);
      if (!assignment) throw new NotFoundError('Đề thi của bài nộp');
      const course = await this.courseRepository.findById(assignment.courseId);
      if (!course) throw new NotFoundError('Khóa học của bài nộp');
      if (actor.role !== 'ADMIN' && course.lecturerId !== actor.userId) {
        throw new ForbiddenError('Chỉ giảng viên phụ trách môn học mới được chấm lại.');
      }
      const source = await this.submissionRepository.findSourceSnapshot(submissionId);
      if (!source) throw new ValidationError('Không còn bản lưu mã nguồn của bài nộp này để chấm lại.');
      const staged = await this.artifactExtractor.extractAndStage(source.path, submissionId, assignment.maxFileSizeBytes);
      await this.submissionRepository.updateWorkspacePath(submissionId, staged.stagedPath);
      await this.gradingDispatcher.dispatch(submissionId, staged.stagedPath, actor.userId);
      return { submissionId, sourceSha256: source.sha256 };
    } catch (error) {
      logger.error('submission_regrade_failed', { submissionId, requestingUserId: actor.userId, stage: 'REGRADE', error });
      throw error;
    }
  }
}
