import { ISubmissionRepository, SubmissionWithJobStatus } from '../../../domain/repositories/submission.repository.interface.js';
import { NotFoundError } from '../../../shared/errors/app-error.js';

export class GetSubmissionStatusUseCase {
  constructor(private readonly submissionRepository: ISubmissionRepository) {}

  public async execute(submissionId: string): Promise<SubmissionWithJobStatus> {
    const submission = await this.submissionRepository.findById(submissionId);

    if (!submission) {
      throw new NotFoundError('Bài nộp (submission)');
    }

    return submission;
  }
}
