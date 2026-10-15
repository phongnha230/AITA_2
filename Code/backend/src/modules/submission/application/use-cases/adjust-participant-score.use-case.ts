import { ICourseRepository } from '../../../course/domain/repositories/course.repository.interface.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../../shared/domain/exceptions/app.error.js';
import { ISubmissionRepository } from '../../domain/repositories/submission.repository.interface.js';

export interface AdjustParticipantScoreRequest {
  submissionId: string;
  participantUserId: string;
  adjustedScore: number | null;
  reason: string;
  requestingUserId: string;
  requestingUserRole: string;
}

export class AdjustParticipantScoreUseCase {
  constructor(
    private readonly submissionRepository: ISubmissionRepository,
    private readonly courseRepository: ICourseRepository
  ) {}

  public async execute(request: AdjustParticipantScoreRequest): Promise<unknown> {
    const submission = await this.submissionRepository.findById(request.submissionId);
    if (!submission) throw new NotFoundError(`Bài nộp với ID: ${request.submissionId}`);
    if (!submission.teamId) throw new ValidationError('Chỉ bài nộp nhóm mới hỗ trợ điều chỉnh điểm thành viên.');
    if (!submission.participants?.some((participant) => participant.userId === request.participantUserId)) {
      throw new NotFoundError(`Thành viên với ID: ${request.participantUserId}`);
    }
    const courseId = submission.assignment?.courseId;
    if (!courseId) throw new ValidationError('Không xác định được môn học của bài nộp.');
    const course = await this.courseRepository.findById(courseId);
    if (!course) throw new NotFoundError(`Môn học với ID: ${courseId}`);
    if (request.requestingUserRole !== 'ADMIN' && course.lecturerId !== request.requestingUserId) {
      throw new ForbiddenError('Bạn không có quyền điều chỉnh điểm của bài nộp này.');
    }

    return this.submissionRepository.adjustParticipantScore(
      request.submissionId,
      request.participantUserId,
      {
        adjustedScore: request.adjustedScore,
        reason: request.reason.trim(),
        adjustedById: request.requestingUserId,
      }
    );
  }
}
