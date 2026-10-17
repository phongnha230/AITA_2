import { ISubmissionRepository } from '../../domain/repositories/submission.repository.interface.js';

export class GetGradingHistoryUseCase {
  constructor(private readonly submissionRepository: ISubmissionRepository) {}

  execute(submissionId: string, requestingUserId: string, requestingUserRole: string) {
    return this.submissionRepository.getGradingHistory(submissionId, requestingUserId, requestingUserRole);
  }

  getEvidence(submissionId: string, runId: string, evidenceId: string, requestingUserId: string, requestingUserRole: string) {
    return this.submissionRepository.getGradingEvidence(submissionId, runId, evidenceId, requestingUserId, requestingUserRole);
  }
}
