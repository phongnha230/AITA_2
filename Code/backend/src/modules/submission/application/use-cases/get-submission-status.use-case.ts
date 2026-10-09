import { ISubmissionRepository } from '../../domain/repositories/submission.repository.interface.js';
import { NotFoundError, ForbiddenError } from '../../../../shared/domain/exceptions/app.error.js';

export interface GetSubmissionStatusRequest {
  id: string;
  requestingUserId: string;
  requestingUserRole: string;
}

export class GetSubmissionStatusUseCase {
  constructor(private readonly submissionRepository: ISubmissionRepository) {}

  public async execute(request: GetSubmissionStatusRequest) {
    const submission = await this.submissionRepository.findWithJobStatus(request.id);

    if (!submission) {
      throw new NotFoundError(`Bài nộp với ID: ${request.id}`);
    }

    // IDOR Guard: STUDENT chỉ được xem bài nộp của chính mình
    if (
      request.requestingUserRole === 'STUDENT' &&
      (submission as any).userId !== request.requestingUserId
    ) {
      throw new ForbiddenError('Bạn không có quyền xem bài nộp này.');
    }

    return submission;
  }
}
