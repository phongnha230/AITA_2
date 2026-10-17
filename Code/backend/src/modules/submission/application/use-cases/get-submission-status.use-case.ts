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
      submission.userId !== request.requestingUserId &&
      !submission.participants?.some(
        (participant: { userId: string }) => participant.userId === request.requestingUserId
      )
    ) {
      throw new ForbiddenError('Bạn không có quyền xem bài nộp này.');
    }

    if (request.requestingUserRole !== 'STUDENT') return submission;
    const safeSubmission = { ...submission };
    delete safeSubmission.zipFilePath;
    delete safeSubmission.workspacePath;
    delete safeSubmission.sourceSnapshotPath;
    delete safeSubmission.sourceSnapshotHash;
    delete safeSubmission.gradingSnapshot;
    if (submission.status !== 'GRADED') {
      safeSubmission.finalScore = null;
      safeSubmission.sandboxScore = null;
      safeSubmission.aiScore = null;
      safeSubmission.algorithmScore = null;
      safeSubmission.cleanCodeScore = null;
      safeSubmission.compileOutput = null;
      safeSubmission.testResults = [];
      safeSubmission.aiGradingResult = null;
      return safeSubmission;
    }
    safeSubmission.testResults = (submission.testResults ?? []).map((result: Record<string, unknown>) => {
      const testCase = result.testCase as Record<string, unknown> | undefined;
      if (!testCase?.isHidden) return result;
      const { actualStdout: _actualStdout, actualFileOutput: _actualFileOutput, diffLog: _diffLog, ...safeResult } = result;
      return { ...safeResult, testCase: { id: testCase.id, label: testCase.label, isHidden: true } };
    });
    return safeSubmission;
  }
}
