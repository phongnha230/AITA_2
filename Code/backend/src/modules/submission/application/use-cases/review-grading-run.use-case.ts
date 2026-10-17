import { ISubmissionRepository } from '../../domain/repositories/submission.repository.interface.js';

export interface ReviewGradingRunRequest {
  runId: string;
  requestingUserId: string;
  requestingUserRole: string;
  finalScore?: number;
  reviewNote: string;
}

export class ReviewGradingRunUseCase {
  constructor(private readonly submissionRepository: ISubmissionRepository) {}

  execute(request: ReviewGradingRunRequest) {
    return this.submissionRepository.reviewGradingRun(
      request.runId,
      request.requestingUserId,
      request.requestingUserRole,
      request.finalScore,
      request.reviewNote
    );
  }
}
